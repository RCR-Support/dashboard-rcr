'use server';

import { db } from '@/lib/db';

export async function getCompanyContracts(companyId: string) {
  try {
    const contracts = await db.contract.findMany({
      where: {
        companyId,
        deletedAt: null,
      },
      include: {
        userAc: {
          select: {
            id: true,
            email: true,
            displayName: true,
          }
        }
      }
    });

    return { ok: true, contracts };
  } catch (error) {
    console.error('Error al obtener contratos:', error);
    return { ok: false, error: 'Error al obtener los contratos' };
  }
}
