import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { StateAc } from '@prisma/client';

/**
 * GET /api/cron/return-contracts
 *
 * Devuelve automáticamente contratos temporales cuya returnDate ya llegó.
 * Llamar desde un cron job (Vercel Cron, cURL programado, etc.)
 * Protegido con CRON_SECRET en cabecera Authorization: Bearer <secret>
 */
export async function GET(req: Request) {
  // Protección por secret
  const authHeader = req.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const now = new Date();

    // Logs temporales con returnDate pasada y no devueltos aún
    const pendingLogs = await db.reassignmentLog.findMany({
      where: {
        mode: 'temporal',
        returnedAt: null,
        returnDate: { lte: now },
      },
      select: {
        id: true,
        previousAcId: true,
        newAcId: true,
        contractId: true,
        contract: {
          select: { contractName: true, contractNumber: true, useracId: true },
        },
      },
    });

    if (pendingLogs.length === 0) {
      return NextResponse.json({ ok: true, processed: 0, message: 'Sin contratos para devolver' });
    }

    // Filtrar los que aún están bajo el AC receptor (no fueron re-traspasados)
    const returnable = pendingLogs.filter(l => l.contract.useracId === l.newAcId);
    const skipped = pendingLogs.length - returnable.length;

    let returned = 0;

    await db.$transaction(async (tx) => {
      for (const log of returnable) {
        // Devolver contrato al AC original
        await tx.contract.update({
          where: { id: log.contractId },
          data: { useracId: log.previousAcId },
        });

        // Reasignar solicitudes pendientes
        await tx.application.updateMany({
          where: {
            contractId: log.contractId,
            stateAc: { in: [StateAc.pendiente, StateAc.adjuntar] },
          },
          data: { userAcId: log.previousAcId },
        });

        // Crear log de retorno
        await tx.reassignmentLog.create({
          data: {
            previousAcId: log.newAcId,
            newAcId: log.previousAcId,
            contractId: log.contractId,
            reason: '[RETORNO AUTOMÁTICO] La fecha de retorno pactada llegó',
            mode: 'retorno',
          },
        });

        // Marcar log original como devuelto
        await tx.reassignmentLog.update({
          where: { id: log.id },
          data: { returnedAt: now },
        });

        // Notificar al AC original
        await tx.notification.create({
          data: {
            userId: log.previousAcId,
            type: 'REASSIGNMENT',
            title: 'Contrato devuelto automáticamente',
            message: `El contrato #${log.contract.contractNumber} fue devuelto a tu gestión según la fecha de retorno pactada.`,
            actionUrl: '/dashboard/contracts',
          },
        });

        returned++;
      }

      // Reactivar ACs originales que pudieran estar inactivos
      const originalAcIds = Array.from(new Set(returnable.map(l => l.previousAcId)));
      for (const acId of originalAcIds) {
        await tx.user.update({
          where: { id: acId },
          data: { isActive: true },
        });
      }
    });

    return NextResponse.json({
      ok: true,
      processed: pendingLogs.length,
      returned,
      skipped,
      message: `${returned} contrato(s) devueltos. ${skipped} omitidos (ya re-traspasados).`,
    });
  } catch (error) {
    console.error('[cron/return-contracts]', error);
    return NextResponse.json({ ok: false, error: 'Error interno' }, { status: 500 });
  }
}
