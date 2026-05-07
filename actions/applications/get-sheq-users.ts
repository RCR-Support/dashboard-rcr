'use server';

import { db } from '@/lib/db';
import { auth } from '@/auth';
import { hasActionPermission } from '@/config/action-permissions';

export async function getSheqUsers() {
  try {
    const session = await auth();
    if (!session?.user) return [];
    if (!hasActionPermission('documents:approve', session.user.roles)) return [];
    const sheqUsers = await db.user.findMany({
      where: {
        roles: {
          some: {
            role: {
              name: 'sheq',
            },
          },
        },
      },
      select: {
        id: true,
        displayName: true,
        email: true,
      },
      orderBy: {
        displayName: 'asc',
      },
    });

    return sheqUsers;
  } catch {
    return [];
  }
}
