'use server';

import { db } from '@/lib/db';
import { auth } from '@/auth';
import { hasActionPermission } from '@/config/action-permissions';
import { RoleEnum, StateAc } from '@prisma/client';

export interface ReassignContractsInput {
  fromUserId: string;
  toUserId: string;
  contractIds: string[];
  reason: string;
  mode: 'temporal' | 'permanente';
  returnDate?: string;
  deactivateUser?: boolean;
}

export async function reassignContracts(input: ReassignContractsInput): Promise<{
  ok: boolean;
  reassigned?: number;
  error?: string;
}> {
  try {
    const session = await auth();
    if (!session?.user) return { ok: false, error: 'No autenticado' };

    const userRoles = session.user.roles as RoleEnum[];
    if (!hasActionPermission('users:edit:any', userRoles)) {
      return { ok: false, error: 'Solo el administrador puede traspasar contratos' };
    }

    const { fromUserId, toUserId, contractIds, reason, mode, returnDate, deactivateUser } = input;

    const uniqueContractIds = Array.from(new Set(contractIds));

    if (!uniqueContractIds.length) {
      return { ok: false, error: 'Debes seleccionar al menos un contrato' };
    }

    if (fromUserId === toUserId) {
      return { ok: false, error: 'El AC receptor debe ser distinto al AC ausente' };
    }

    if (mode !== 'temporal' && mode !== 'permanente') {
      return { ok: false, error: 'El modo de traspaso no es válido' };
    }

    if (reason.trim().length < 5) {
      return { ok: false, error: 'Debes indicar un motivo de al menos 5 caracteres' };
    }

    const recipient = await db.user.findFirst({
      where: {
        id: toUserId,
        isActive: true,
        deletedLogic: false,
        roles: { some: { role: { name: RoleEnum.adminContractor } } },
      },
      select: { id: true },
    });

    if (!recipient) {
      return { ok: false, error: 'El AC receptor no existe, está inactivo o no tiene el rol requerido' };
    }

    // Validar que todos los contractIds pertenecen al AC ausente
    const validContracts = await db.contract.findMany({
      where: {
        id: { in: uniqueContractIds },
        useracId: fromUserId,
        deletedAt: null,
      },
      select: { id: true },
    });

    if (validContracts.length !== uniqueContractIds.length) {
      return { ok: false, error: 'Uno o más contratos no pertenecen a este administrador de contrato' };
    }

    if (mode === 'permanente') {
      const activeContractsCount = await db.contract.count({
        where: { useracId: fromUserId, deletedAt: null },
      });
      if (uniqueContractIds.length !== activeContractsCount) {
        return { ok: false, error: 'El traspaso permanente requiere seleccionar todos los contratos activos del AC' };
      }
    }

    const reasonPrefix = mode === 'permanente' ? '[PERMANENTE]' : '[TEMPORAL]';
    const fullReason = `${reasonPrefix} ${reason}`;

    await db.$transaction(async (tx) => {
      for (const contractId of uniqueContractIds) {
        // 1. Actualizar el AC del contrato
        await tx.contract.update({
          where: { id: contractId },
          data: { useracId: toUserId },
        });

        // 2. Actualizar solicitudes pendientes del contrato
        await tx.application.updateMany({
          where: {
            contractId,
            stateAc: { in: [StateAc.pendiente, StateAc.adjuntar] },
          },
          data: { userAcId: toUserId },
        });

        // 3. Registrar en el log de auditoría
        await tx.reassignmentLog.create({
          data: {
            previousAcId: fromUserId,
            newAcId: toUserId,
            contractId,
            userId: session.user.id,
            reason,
            mode,
            returnDate: mode === 'temporal' && returnDate ? new Date(returnDate) : null,
          },
        });

        // 4. Notificar al nuevo AC
        await tx.notification.create({
          data: {
            userId: toUserId,
            type: 'REASSIGNMENT',
            title: 'Nuevo contrato asignado',
            message: `Se te ha asignado un contrato por traspaso (${mode === 'permanente' ? 'permanente' : 'temporal'}). Motivo: ${reason}`,
            actionUrl: '/dashboard/contracts',
          },
        });
      }

      // 5. En modo permanente: desactivar el AC anterior si corresponde
      if (mode === 'permanente' && deactivateUser !== false) {
        await tx.user.update({
          where: { id: fromUserId },
          data: { isActive: false },
        });
      }
    });

    return { ok: true, reassigned: uniqueContractIds.length };
  } catch (error) {
    console.error('[reassignContracts]', error);
    return { ok: false, error: 'Error al ejecutar el traspaso de contratos' };
  }
}
