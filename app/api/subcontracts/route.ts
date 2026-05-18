import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/auth';
import { hasActionPermission } from '@/config/action-permissions';
import { sendSubcontractLinkedEmails } from '@/lib/email/postmark';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return new NextResponse('No autorizado', { status: 401 });
    }

    const canViewAll = hasActionPermission('subcontracts:view:all', session.user.roles);
    const canViewOwn = hasActionPermission('subcontracts:view:own', session.user.roles);

    if (!canViewAll && !canViewOwn) {
      return new NextResponse('Sin permisos', { status: 403 });
    }

    const user = await db.user.findUniqueOrThrow({
      where: { email: session.user.email },
    });

    const { searchParams } = new URL(req.url);
    const contractId = searchParams.get('contractId');

    const where: Record<string, unknown> = {};

    if (!canViewAll) {
      // Solo ve subcontratos de contratos de su empresa (mandante)
      if (!user.companyId) return NextResponse.json([]);
      where.contract = { companyId: user.companyId };
    }

    if (contractId) {
      where.contractId = contractId;
    }

    const subcontracts = await db.subcontract.findMany({
      where,
      include: {
        subCompany: {
          select: { id: true, name: true, rut: true },
        },
        contract: {
          select: {
            id: true,
            contractName: true,
            contractNumber: true,
            Company: { select: { name: true, rut: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(subcontracts);
  } catch {
    return new NextResponse('Error interno', { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return new NextResponse('No autorizado', { status: 401 });
    }

    if (!hasActionPermission('subcontracts:create', session.user.roles)) {
      return new NextResponse('Sin permisos', { status: 403 });
    }

    const body = await req.json();
    const { contractId, subCompanyId, userId } = body as { contractId: string; subCompanyId: string; userId?: string };

    if (!contractId || !subCompanyId) {
      return new NextResponse('Faltan campos requeridos', { status: 400 });
    }

    // Verificar que el contrato existe
    const contract = await db.contract.findUnique({ where: { id: contractId } });
    if (!contract) return new NextResponse('Contrato no encontrado', { status: 404 });

    // Verificar que la sub-empresa no es la misma que el mandante
    if (contract.companyId === subCompanyId) {
      return new NextResponse('La sub-empresa no puede ser la misma que el mandante', { status: 400 });
    }

    // Si es usuario (mandante), verificar que el contrato pertenece a su empresa
    const user = await db.user.findUniqueOrThrow({ where: { email: session.user.email } });
    const isAdmin = hasActionPermission('subcontracts:view:all', session.user.roles);
    if (!isAdmin && contract.companyId !== user.companyId) {
      return new NextResponse('No tienes acceso a este contrato', { status: 403 });
    }

    // Verificar que la sub-empresa existe y está activa
    const subCompany = await db.company.findUnique({ where: { id: subCompanyId } });
    if (!subCompany || !subCompany.status) {
      return new NextResponse('Empresa no encontrada o inactiva', { status: 404 });
    }

    // Crear el subcontrato (activo directo para Flujo A)
    const subcontract = await db.subcontract.create({
      data: {
        contractId,
        subCompanyId,
        userId: userId ?? null,
        status: 'activo',
        isActive: true,
      },
    });

    // Enviar emails en background (no bloquea la respuesta)
    sendSubcontractLinkedEmails({ contractId, subCompanyId }).catch(() => {});

    return NextResponse.json(subcontract, { status: 201 });
  } catch (err: unknown) {
    if (
      err instanceof Error &&
      err.message.includes('Unique constraint failed')
    ) {
      return new NextResponse('Esta empresa ya está vinculada a este contrato', { status: 409 });
    }
    return new NextResponse('Error interno', { status: 500 });
  }
}
