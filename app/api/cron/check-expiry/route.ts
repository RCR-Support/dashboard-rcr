import { NextRequest, NextResponse } from 'next/server';
import { notifyExpiringApplications } from '@/actions/notifications/notify-expiring-applications';

/**
 * GET /api/cron/check-expiry
 * Protegido por Authorization: Bearer <CRON_SECRET>
 * Genera notificaciones para solicitudes con documentos próximos a vencer.
 * Ejecutar diariamente (ej. 08:00).
 */
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  const secret = process.env.CRON_SECRET;

  if (!secret || authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ ok: false, error: 'No autorizado' }, { status: 401 });
  }

  const result = await notifyExpiringApplications();

  return NextResponse.json(result);
}
