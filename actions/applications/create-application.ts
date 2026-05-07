'use server';

import { db } from '@/lib/db';
import { auth } from '@/auth';
import { StateAc, StateSheq, ProcessStatus, RoleEnum } from '@prisma/client';
import { hasActionPermission } from '@/config/action-permissions';
import { sendApplicationConfirmationEmail } from '@/lib/email/postmark';

export interface CreateApplicationInput {
  // Datos del contrato
  contractId: string;
  companyId: string;
  
  // Datos del trabajador
  workerName: string;
  workerPaternal: string;
  workerMaternal: string;
  workerRun: string;
  
  // Actividades seleccionadas
  activityIds: string[];
  
  // Documentos subidos (con URLs de Cloudinary)
  documents: {
    documentationId?: string; // ID del tipo de documento (Documentation)
    activityId?: string; // ID de la actividad (si es específico)
    url: string; // URL de Cloudinary
    type: 'PDF' | 'IMG' | 'DOC' | 'OTHER';
    expiresAt?: Date; // Fecha de expiración del documento
  }[];
  
  // Foto de credencial
  credentialPhotoUrl?: string;
}

export interface CreateApplicationResult {
  success: boolean;
  applicationId?: string;
  error?: string;
}

/**
 * Crea una nueva solicitud de acreditación completa
 */
export async function createApplication(
  input: CreateApplicationInput
): Promise<CreateApplicationResult> {
  try {
    // Obtener sesión del usuario
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: 'Usuario no autenticado' };
    }

    // ✅ VALIDACIÓN: Permisos
    if (!hasActionPermission('applications:create', session.user.roles as RoleEnum[])) {
      return { success: false, error: 'No tienes permiso para crear solicitudes' };
    }

    // Validar datos requeridos
    if (!input.contractId || !input.companyId) {
      return { success: false, error: 'Faltan datos del contrato' };
    }

    if (!input.workerName || !input.workerPaternal || !input.workerRun) {
      return { success: false, error: 'Faltan datos del trabajador' };
    }

    if (input.activityIds.length === 0) {
      return { success: false, error: 'Debe seleccionar al menos una actividad' };
    }

    // Obtener el contrato para asignar el AdminContractor y su fecha de término
    const contract = await db.contract.findUnique({
      where: { id: input.contractId },
      select: { 
        useracId: true,
        finalDate: true,
      },
    });

    if (!contract) {
      return { success: false, error: 'Contrato no encontrado' };
    }

    // Calcular licenseExpiration: fecha más cercana entre documentos y contrato
    const dates: Date[] = [];
    
    // Agregar fecha de término del contrato si existe
    if (contract.finalDate) {
      dates.push(new Date(contract.finalDate));
    }
    
    // Agregar fechas de expiración de documentos
    input.documents.forEach(doc => {
      if (doc.expiresAt) {
        dates.push(new Date(doc.expiresAt));
      }
    });
    
    // Obtener la fecha más cercana (mínima)
    const licenseExpiration = dates.length > 0 
      ? new Date(Math.min(...dates.map(d => d.getTime())))
      : null;

    // Crear displayWorkerName
    const displayWorkerName = `${input.workerName} ${input.workerPaternal} ${input.workerMaternal}`.trim();

    // Usar transacción para asegurar consistencia
    const application = await db.$transaction(async (tx) => {
      // 1. Crear la solicitud
      const createData = {
        // Status
        status: 'primeraVez',
        processStatus: ProcessStatus.pendiente,
        stateAc: StateAc.pendiente,
        stateSheq: StateSheq.pendiente,

        // Datos del trabajador
        workerName: input.workerName,
        workerPaternal: input.workerPaternal,
        workerMaternal: input.workerMaternal,
        workerRun: input.workerRun,
        displayWorkerName,
        licenseExpiration, // Fecha de expiración calculada

        // Relaciones
        companyId: input.companyId,
        contractId: input.contractId,
        userId: session.user.id,
        userAcId: contract.useracId, // AdminContractor del contrato

        // Conectar actividades
        activities: {
          connect: input.activityIds.map(id => ({ id })),
        },
      };

      const newApplication = await tx.application.create({
        data: createData as any,
      });

      // 2. Guardar foto de credencial si existe
      if (input.credentialPhotoUrl) {
        await tx.documentationFile.create({
          data: {
            applicationId: newApplication.id,
            url: input.credentialPhotoUrl,
            type: 'IMG',
            // No se vincula a documentationId ni activityId porque es general
          },
        });
      }

      // 3. Guardar documentos de actividades
      if (input.documents.length > 0) {
        // Filtrar documentos válidos (deben tener documentationId)
        const validDocuments = input.documents.filter(doc => doc.documentationId);
        
        if (validDocuments.length > 0) {
          const docsToCreate = validDocuments.map(doc => ({
            applicationId: newApplication.id,
            documentationId: doc.documentationId!,
            activityId: doc.activityId || null,
            url: doc.url,
            type: doc.type,
            expiresAt: doc.expiresAt,
          }));

          await tx.documentationFile.createMany({
            data: docsToCreate as any,
          });
        }
      }

      // 4. Crear registro de auditoría
      await tx.applicationAudit.create({
        data: {
          applicationId: newApplication.id,
          action: 'CREACION',
          changedById: session.user.id,
          details: `Solicitud creada por ${session.user.email}`,
        },
      });

      return newApplication;
    });

    // 5. Enviar email de confirmación (fuera de la transacción para no bloquear)
    try {
      const creator = await db.user.findUnique({ 
        where: { id: session.user.id },
        select: { email: true }
      });
      await sendApplicationConfirmationEmail(application.id, creator?.email ?? undefined);
    } catch (err) {
      console.error('[EMAIL ERROR] create-application:', err);
    }

    return {
      success: true,
      applicationId: application.id,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido al crear la solicitud',
    };
  }
}
