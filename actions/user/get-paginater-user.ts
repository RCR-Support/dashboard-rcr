'use server';

import { auth } from '@/auth';
import { db } from '@/lib/db';

export const getPaginatedUser = async () => {
  const session = await auth();

  if (session?.user?.roles?.includes('admin') === false) {
    return {
      ok: false,
      message: 'No tienes permiso de administrador',
    };
  }

  const users = await db.user.findMany({
    orderBy: {
      createdAt: 'desc',
    },
  });

  return {
    ok: true,
    users: users,
  };
};
