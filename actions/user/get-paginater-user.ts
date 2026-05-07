'use server';

import { auth } from '@/auth';
import { db } from '@/lib/db';
import { hasActionPermission } from '@/config/action-permissions';

export const getPaginatedUser = async () => {
  const session = await auth();

  if (!session?.user) {
    return { ok: false, message: 'No autenticado' };
  }
  if (!hasActionPermission('companies:view:all', session.user.roles)) {
    return { ok: false, message: 'No tienes permiso de administrador' };
  }

  const users = await db.user.findMany({
    orderBy: {
      createdAt: 'desc',
    },
    omit: { password: true },
  });

  return {
    ok: true,
    users: users,
  };
};
