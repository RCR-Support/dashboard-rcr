'use server';

import { db } from '@/lib/db';
import { auth } from '@/auth';
import { hasActionPermission } from '@/config/action-permissions';
import { revalidatePath } from 'next/cache';

export async function deleteDocumentation(id: string) {
  const session = await auth();
  if (!session?.user) throw new Error('No autenticado');
  if (!hasActionPermission('activities:delete', session.user.roles)) {
    throw new Error('No tienes permiso para eliminar documentaciones');
  }

  const deleted = await db.documentation.delete({ where: { id } });
  revalidatePath('/dashboard/documentations');
  revalidatePath('/dashboard/documentations/activity-matrix');

  return deleted;
}
