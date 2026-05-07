'use server';

import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';
import { hasActionPermission } from '@/config/action-permissions';

interface UpdateDocumentationData {
  name: string;
  isGlobal?: boolean;
}

export async function updateDocumentation(
  id: string,
  data: UpdateDocumentationData
) {
  try {
    const session = await auth();
    if (!session?.user) return { success: false, error: 'No autenticado' };
    if (!hasActionPermission('activities:edit', session.user.roles)) {
      return { success: false, error: 'No tienes permiso para editar documentaciones' };
    }

    const documentation = await db.documentation.update({
      where: { id },
      data: {
        name: data.name.trim(),
        ...(typeof data.isGlobal === 'boolean' ? { isGlobal: data.isGlobal } : {}),
      },
    });

    revalidatePath('/dashboard/documentations');
    revalidatePath('/dashboard/documentations/activity-matrix');

    return { success: true, data: documentation };
  } catch (error) {
    return { success: false, error: 'Error al actualizar la documentación' };
  }
}
