'use server';

import { db } from '@/lib/db';
import { auth } from '@/auth';

export async function markNotificationAsRead(notificationId: string) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return { ok: false, error: 'No autenticado' };
    }

    // Verificar que la notificación pertenece al usuario
    const notification = await db.notification.findFirst({
      where: {
        id: notificationId,
        userId: session.user.id,
      },
    });

    if (!notification) {
      return { ok: false, error: 'Notificación no encontrada' };
    }

    await db.notification.update({
      where: { id: notificationId },
      data: { read: true },
    });

    return { ok: true };
  } catch (error) {
    return { ok: false, error: 'Error al marcar notificación como leída' };
  }
}

export async function markAllNotificationsAsRead() {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return { ok: false, error: 'No autenticado' };
    }

    await db.notification.updateMany({
      where: {
        userId: session.user.id,
        read: false,
      },
      data: { read: true },
    });

    return { ok: true };
  } catch (error) {
    return { ok: false, error: 'Error al marcar notificaciones como leídas' };
  }
}
