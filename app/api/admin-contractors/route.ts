import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { RoleEnum } from '@prisma/client';
import { auth } from '@/auth';
import { hasActionPermission } from '@/config/action-permissions';

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  // Solo admin y sheq pueden listar admin-contractors
  if (!hasActionPermission('users:view:all', session.user.roles) &&
      !hasActionPermission('contracts:view:all', session.user.roles) &&
      !hasActionPermission('contracts:create', session.user.roles)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }
  const admins = await db.user.findMany({
    where: {
      roles: {
        some: {
          role: { name: RoleEnum.adminContractor },
        },
      },
      isActive: true,
    },
    select: {
      id: true,
      displayName: true,
      name: true,
      lastName: true,
      company: { select: { name: true } },
    },
    orderBy: { displayName: 'asc' },
  });

  const data = admins.map(admin => ({
    label: admin.displayName || `${admin.name} ${admin.lastName}`,
    value: admin.id,
    description: admin.company?.name || 'Sin empresa asignada',
  }));

  return NextResponse.json(data);
}
