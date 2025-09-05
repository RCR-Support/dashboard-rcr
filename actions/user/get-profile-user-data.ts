'use server';

import { auth } from '@/auth';
import { db } from '@/lib/db';
import { RoleEnum } from '@prisma/client';

export interface ProfileUserResponse {
  ok: boolean;
  message?: string;
  user?: {
    id: string;
    displayName: string;
    email: string;
    userName: string;
    image: string | null;
    company: {
      name: string | null;
    } | null;
    roles: {
      role: {
        name: RoleEnum;
      };
    }[];
  };
}

export const getProfileUserData = async (
  id: string
): Promise<ProfileUserResponse> => {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return {
        ok: false,
        message: 'Usuario no autenticado',
      };
    }

    // Buscar por email que es un campo único
    const user = await db.user.findUnique({
      where: {
        email: session.user.email,
      },
      select: {
        id: true,
        displayName: true,
        email: true,
        userName: true,
        image: true,
        company: {
          select: {
            name: true,
          },
        },
        roles: {
          select: {
            role: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      // console.log('Usuario no encontrado:', session.user.email);
      return {
        ok: false,
        message: 'Usuario no encontrado',
      };
    }

    // console.log('Usuario encontrado:', user.email);
    return {
      ok: true,
      user: user as ProfileUserResponse['user'],
    };
  } catch (error) {
    // console.error('Error al obtener datos del perfil:', error);
    return {
      ok: false,
      message: 'Error al obtener datos del perfil',
    };
  }
};
