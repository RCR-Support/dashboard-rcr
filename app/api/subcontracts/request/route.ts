import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/auth';
import { hasActionPermission } from '@/config/action-permissions';
import { sendSubcontractRequestEmails } from '@/lib/email/postmark';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return new NextResponse('No autorizado', { status: 401 });
    }

    if (!hasActionPermission('subcontracts:request', session.user.roles)) {
      return new NextResponse('Sin permisos', { status: 403 });
    }

    const body = await req.json();
    const {
      contractId,
      companyName,
      companyRut,
      companyCity,
      repEmail,
    } = body as {
      contractId: string;
      companyName: string;
      companyRut: string;
      companyCity?: string;
      repEmail: string;
    };

    if (!contractId || !companyName || !companyRut || !repEmail) {
      return new NextResponse('Faltan campos requeridos', { status: 400 });
    }

    // Verificar que el contrato existe
    const contract = await db.contract.findUnique({
      where: { id: contractId },
      include: { Company: true },
    });
    if (!contract) return new NextResponse('Contrato no encontrado', { status: 404 });

    // Si es usuario mandante, verificar ownership del contrato
    const user = await db.user.findUniqueOrThrow({ where: { email: session.user.email } });
    const isAdmin = hasActionPermission('subcontracts:approve', session.user.roles);
    if (!isAdmin && contract.companyId !== user.companyId) {
      return new NextResponse('No tienes acceso a este contrato', { status: 403 });
    }

    // Verificar que el RUT no está ya registrado
    const existingCompany = await db.company.findFirst({ where: { rut: companyRut } });
    if (existingCompany) {
      return new NextResponse('El RUT de empresa ya está registrado en el sistema. Usa la opción "Empresa Existente" para vincularla.', { status: 409 });
    }

    // Crear empresa nueva en estado inactivo (pendiente de aprobación)
    const newCompany = await db.company.create({
      data: {
        name: companyName,
        rut: companyRut,
        city: companyCity,
        status: false,
      },
    });

    // Crear subcontrato en estado pendiente
    const subcontract = await db.subcontract.create({
      data: {
        contractId,
        subCompanyId: newCompany.id,
        status: 'pendiente',
        isActive: false,
      },
    });

    // Crear notificación para admin
    await db.notification.create({
      data: {
        type: 'SUBCONTRACT_REQUEST',
        title: `Nueva solicitud de sub-empresa: ${companyName}`,
        message: `La empresa ${contract.Company.name ?? contract.Company.rut} solicitó incorporar a ${companyName} (${companyRut}) en el contrato ${contract.contractNumber} - ${contract.contractName}. Representante: ${repEmail}.`,
        userId: user.id,
      },
    });

    // Enviar emails (awaited para garantizar envío en entorno serverless)
    await sendSubcontractRequestEmails({
      contractId,
      subCompanyId: newCompany.id,
      representativeEmail: repEmail,
    }).catch((err) => {
      console.error('[sendSubcontractRequestEmails]', err);
    });

    return NextResponse.json({ subcontract, company: newCompany }, { status: 201 });
  } catch {
    return new NextResponse('Error interno', { status: 500 });
  }
}

