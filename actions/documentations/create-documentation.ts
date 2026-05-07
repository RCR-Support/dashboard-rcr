'use server';

import { db } from '@/lib/db';
import { auth } from '@/auth';
import { hasActionPermission } from '@/config/action-permissions';

type AcceptedFileType = 'PDF' | 'IMAGE' | 'DOCUMENT' | 'ANY';

export async function createDocumentation(
  name: string,
  _acceptedFileType?: AcceptedFileType,
  isGlobal: boolean = false
) {
  try {
    const session = await auth();
    if (!session?.user) return { success: false, error: 'No autenticado' };
    if (!hasActionPermission('activities:create', session.user.roles)) {
      return { success: false, error: 'No tienes permiso para crear documentaciones' };
    }
    if (!name || name.trim().length === 0) {
      return {
        success: false,
        error: 'El nombre es requerido',
      };
    }

    const documentation = await db.documentation.create({
      data: {
        name: name.trim(),
        isGlobal,
      },
    });

    return {
      success: true,
      data: documentation,
    };
  } catch (error) {
    return {
      success: false,
      error: 'Error al crear la documentación',
    };
  }
}
