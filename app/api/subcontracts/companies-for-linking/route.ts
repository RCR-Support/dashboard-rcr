import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/auth';
import { hasActionPermission } from '@/config/action-permissions';

/**
 * Retorna todas las empresas activas con sus usuarios activos,
 * para que el mandante pueda elegir a cuál vincular.
 */
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return new NextResponse('No autorizado', { status: 401 });
    }

    const canCreate = hasActionPermission('subcontracts:create', session.user.roles);
    if (!canCreate) {
      return new NextResponse('Sin permisos', { status: 403 });
    }

    const user = await db.user.findUniqueOrThrow({ where: { email: session.user.email } });

    const companies = await db.company.findMany({
      where: {
        status: true,
        // Excluir la empresa del mandante (no puede subcontratarse a sí mismo)
        ...(user.companyId ? { NOT: { id: user.companyId } } : {}),
      },
      select: {
        id: true,
        name: true,
        rut: true,
        User: {
          where: { isActive: true, deletedLogic: false },
          select: { id: true, name: true, userName: true, email: true, phoneNumber: true },
        },
      },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json(
      companies.map(c => ({
        id: c.id,
        name: c.name,
        rut: c.rut,
        activeUsers: c.User.map(u => ({ id: u.id, name: u.name, alias: u.userName, email: u.email, phone: u.phoneNumber })),
      }))
    );
  } catch {
    return new NextResponse('Error interno', { status: 500 });
  }
}
