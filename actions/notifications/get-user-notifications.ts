'use server';

import { db } from '@/lib/db';
import { auth } from '@/auth';

export async function getUserNotifications() {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return { ok: false, error: 'No autenticado' };
    }

    const notifications = await db.notification.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 20, // Últimas 20 notificaciones
    });

    const unreadCount = await db.notification.count({
      where: {
        userId: session.user.id,
        read: false,
      },
    });

    return { 
      ok: true, 
      notifications,
      unreadCount,
    };
  } catch (error) {
    return { ok: false, error: 'Error al obtener notificaciones' };
  }
}
