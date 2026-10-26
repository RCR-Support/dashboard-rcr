import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/auth';
import { hasActionPermission } from '@/config/action-permissions';
import { Prisma, SubcontractStatus } from '@prisma/client';
import { sendSubcontractLinkedEmails } from '@/lib/email/postmark';
import { revalidatePath } from 'next/cache';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session?.user?.email) {
      return new NextResponse('No autorizado', { status: 401 });
    }

    const canViewAll = hasActionPermission('subcontracts:view:all', session.user.roles);
    const canViewOwn = hasActionPermission('subcontracts:view:own', session.user.roles);
    if (!canViewAll && !canViewOwn) {
      return new NextResponse('Sin permisos', { status: 403 });
    }

    const subcontract = await db.subcontract.findUnique({
      where: { id },
      include: {
        subCompany: {
          select: { id: true, name: true, rut: true, city: true },
        },
        contract: {
          select: {
            id: true,
            contractName: true,
            contractNumber: true,
            Company: { select: { id: true, name: true, rut: true } },
            userAc: { select: { id: true, name: true, email: true } },
          },
        },
      },
    });

    if (!subcontract) {
      return new NextResponse('Subcontrato no encontrado', { status: 404 });
    }

    // Verificar acceso si no es admin
    if (!canViewAll) {
      const user = await db.user.findUniqueOrThrow({ where: { email: session.user.email! } });
      if (subcontract.contract.Company.id !== user.companyId) {
        return new NextResponse('Sin permisos', { status: 403 });
      }
    }

    return NextResponse.json(subcontract);
  } catch {
    return new NextResponse('Error interno', { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session?.user?.email) {
      return new NextResponse('No autorizado', { status: 401 });
    }

    if (!hasActionPermission('subcontracts:approve', session.user.roles)) {
      return new NextResponse('Sin permisos', { status: 403 });
    }

    const body = await req.json();
    const { status, isActive, userId } = body as { status?: SubcontractStatus; isActive?: boolean; userId?: string | null };

    const subcontract = await db.subcontract.findUnique({
      where: { id },
      include: { subCompany: true },
    });
    if (!subcontract) {
      return new NextResponse('Subcontrato no encontrado', { status: 404 });
    }

    const updateData: Prisma.SubcontractUpdateInput = {
      ...(status !== undefined && { status }),
      ...(isActive !== undefined && { isActive }),
    };

    if (userId !== undefined) {
      const normalizedUserId = userId || null;

      if (normalizedUserId) {
        const representative = await db.user.findFirst({
          where: {
            id: normalizedUserId,
            companyId: subcontract.subCompanyId,
            deletedLogic: false,
          },
          select: { id: true, email: true },
        });

        if (!representative) {
          return new NextResponse('El contacto seleccionado no pertenece a la sub-empresa', { status: 400 });
        }

        updateData.user = { connect: { id: representative.id } };
        updateData.representativeEmail = representative.email;
      } else {
        updateData.user = { disconnect: true };
        updateData.representativeEmail = null;
      }
    }

    const updated = await db.subcontract.update({
      where: { id },
      data: updateData,
    });

    // Si se activa un subcontrato pendiente → activar también la empresa + enviar emails
    if (status === 'activo' && subcontract.status === 'pendiente') {
      await db.company.update({
        where: { id: subcontract.subCompanyId },
        data: { status: true },
      });
      // Enviar emails de vinculación (Flujo B aprobado = mismos emails que Flujo A)
      sendSubcontractLinkedEmails({
        contractId: subcontract.contractId,
        subCompanyId: subcontract.subCompanyId,
      }).catch(() => {});
    }

    revalidatePath('/dashboard/contracts');
    revalidatePath('/dashboard/my-company');
    revalidatePath('/dashboard/companies');
    revalidatePath('/dashboard/admin/subcontracts');
    revalidatePath('/dashboard/applications');

    return NextResponse.json(updated);
  } catch {
    return new NextResponse('Error interno', { status: 500 });
  }
}
