'use server';

import { db } from '@/lib/db';
import { auth } from '@/auth';

export async function getCompanyContracts(companyId: string) {
  try {
    const session = await auth();
    if (!session?.user) return { ok: false, error: 'No autenticado' };

    const today = new Date();
    today.setHours(0, 0, 0, 0); // Inicio del día de hoy
    
    const contracts = await db.contract.findMany({
      where: {
        companyId,
        deletedAt: null,
        finalDate: {
          gte: today, // Solo contratos que terminen hoy o en el futuro
        },
      },
      include: {
        userAc: {
          select: {
            id: true,
            email: true,
            displayName: true,
          },
        },
      },
      orderBy: {
        finalDate: 'asc', // Ordenar por fecha de término más cercana primero
      },
    });

    return { ok: true, contracts };
  } catch {
    return { ok: false, error: 'Error al obtener los contratos' };
  }
}