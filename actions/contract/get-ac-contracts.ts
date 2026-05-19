'use server';

import { db } from '@/lib/db';
import { auth } from '@/auth';
import { hasActionPermission } from '@/config/action-permissions';
import { RoleEnum } from '@prisma/client';

export interface AcContract {
  id: string;
  contractNumber: string;
  contractName: string;
  initialDate: Date;
  finalDate: Date;
  company: {
    id: string;
    name: string | null;
  } | null;
}

export async function getAcContracts(acUserId: string): Promise<{
  ok: boolean;
  contracts?: AcContract[];
  error?: string;
}> {
  try {
    const session = await auth();
    if (!session?.user) return { ok: false, error: 'No autenticado' };

    const userRoles = session.user.roles as RoleEnum[];
    if (!hasActionPermission('users:edit:any', userRoles)) {
      return { ok: false, error: 'Sin permisos' };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const contracts = await db.contract.findMany({
      where: {
        useracId: acUserId,
        deletedAt: null,
        finalDate: { gte: today },
      },
      select: {
        id: true,
        contractNumber: true,
        contractName: true,
        initialDate: true,
        finalDate: true,
        Company: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { finalDate: 'asc' },
    });

    return {
      ok: true,
      contracts: contracts.map(c => ({
        ...c,
        company: c.Company,
      })),
    };
  } catch (error) {
    console.error('[getAcContracts]', error);
    return { ok: false, error: 'Error al obtener contratos' };
  }
}
