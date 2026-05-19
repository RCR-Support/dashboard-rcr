'use server';

import { db } from '@/lib/db';
import { auth } from '@/auth';
import { hasActionPermission } from '@/config/action-permissions';
import { RoleEnum, StateAc } from '@prisma/client';

export interface ReturnContractsInput {
  /** IDs de los ReassignmentLog que se van a "devolver" */
  logIds: string[];
  /** AC original que vuelve (a quien se devuelven los contratos) */
  originalAcId: string;
  /** Motivo opcional de la devolución */
  returnReason?: string;
}

export async function returnAcContracts(input: ReturnContractsInput): Promise<{
  ok: boolean;
  returned?: number;
  error?: string;
}> {
  try {
    const session = await auth();
    if (!session?.user) return { ok: false, error: 'No autenticado' };

    const userRoles = session.user.roles as RoleEnum[];
    if (!hasActionPermission('users:edit:any', userRoles)) {
      return { ok: false, error: 'Solo el administrador puede ejecutar devoluciones' };
    }

    const { logIds, originalAcId, returnReason } = input;

    if (!logIds.length) return { ok: false, error: 'No se indicaron registros a devolver' };

    // Traer los logs originales (deben ser temporales, no devueltos aún, y pertenecer al originalAcId)
    const logs = await db.reassignmentLog.findMany({
      where: {
        id: { in: logIds },
        previousAcId: originalAcId,
        mode: 'temporal',
        returnedAt: null,
      },
      select: {
        id: true,
        contractId: true,
        newAcId: true,
        contract: { select: { contractName: true, contractNumber: true, useracId: true } },
      },
    });

    if (!logs.length) {
      return { ok: false, error: 'No hay contratos pendientes de devolución para este usuario' };
    }

    // Verificar que los contratos aún están bajo el AC receptor (newAcId)
    // Si el AC receptor ya los traspasó a alguien más, alertar
    const notOwned = logs.filter(l => l.contract.useracId !== l.newAcId);
    if (notOwned.length > 0) {
      return {
        ok: false,
        error: `${notOwned.length} contrato(s) ya fueron transferidos a otro administrador y no pueden devolverse automáticamente: ${notOwned.map(l => `#${l.contract.contractNumber}`).join(', ')}`,
      };
    }

    const reason = returnReason?.trim()
      ? `[RETORNO] ${returnReason.trim()}`
      : '[RETORNO] Regreso del AC original';

    await db.$transaction(async (tx) => {
      for (const log of logs) {
        // 1. Devolver contrato al AC original
        await tx.contract.update({
          where: { id: log.contractId },
          data: { useracId: originalAcId },
        });

        // 2. Reasignar solicitudes pendientes al AC original
        await tx.application.updateMany({
          where: {
            contractId: log.contractId,
            stateAc: { in: [StateAc.pendiente, StateAc.adjuntar] },
          },
          data: { userAcId: originalAcId },
        });

        // 3. Crear log de la devolución
        await tx.reassignmentLog.create({
          data: {
            previousAcId: log.newAcId,   // quien tenía el contrato
            newAcId: originalAcId,        // a quien vuelve
            contractId: log.contractId,
            userId: session.user.id,
            reason,
            mode: 'retorno',
          },
        });

        // 4. Marcar log original como devuelto
        await tx.reassignmentLog.update({
          where: { id: log.id },
          data: { returnedAt: new Date() },
        });

        // 5. Notificar al AC original
        await tx.notification.create({
          data: {
            userId: originalAcId,
            type: 'REASSIGNMENT',
            title: 'Contrato devuelto',
            message: `El contrato #${log.contract.contractNumber} fue devuelto a tu gestión.`,
            actionUrl: '/dashboard/contracts',
          },
        });
      }

      // 6. Reactivar el AC si estaba desactivado temporalmente
      await tx.user.update({
        where: { id: originalAcId },
        data: { isActive: true },
      });
    });

    return { ok: true, returned: logs.length };
  } catch (error) {
    console.error('[returnAcContracts]', error);
    return { ok: false, error: 'Error al ejecutar la devolución de contratos' };
  }
}
