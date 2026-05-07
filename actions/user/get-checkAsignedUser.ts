'use server';

import { db } from '@/lib/db';
import { AdminContractorWithUsers } from '@/interfaces/admin.interface';
import { auth } from '@/auth';

export const checkAssignedUsers = async (
  userId: string
): Promise<AdminContractorWithUsers | null> => {
  try {
    const session = await auth();
    if (!session?.user) return null;
    // Verificar si el usuario es adminContractor
    const user = await db.user.findFirst({
      where: {
        id: userId,
        roles: {
          some: {
            role: {
              name: 'adminContractor',
            },
          },
        },
      },
      include: {
        assignedUsers: {
          where: {
            deletedLogic: false,
          },
          include: {
            company: true,
          },
        },
      },
    });

    if (!user) {
      return null;
    }

    const assignedUsers = user.assignedUsers.map(assignedUser => ({
      id: assignedUser.id,
      displayName: assignedUser.displayName,
      email: assignedUser.email,
      company: assignedUser.company
        ? {
            name: assignedUser.company.name,
          }
        : null,
    }));

    return {
      id: user.id,
      displayName: user.displayName,
      assignedUsers,
    };
  } catch (error) {
    return null;
  }
};
