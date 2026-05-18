'use server';

import { db } from '@/lib/db';
import { auth } from '@/auth';

export async function getCompanyContracts(companyId: string) {
  try {
    const session = await auth();
    if (!session?.user) return { ok: false, error: 'No autenticado' };

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 1. Contratos propios (empresa es mandante)
    const ownContracts = await db.contract.findMany({
      where: {
        companyId,
        deletedAt: null,
        finalDate: { gte: today },
      },
      include: {
        userAc: {
          select: { id: true, email: true, displayName: true },
        },
      },
      orderBy: { finalDate: 'asc' },
    });

    // 2. Contratos como sub-empresa (solo si el usuario actual es el representante designado)
    const subcontractLinks = await db.subcontract.findMany({
      where: {
        subCompanyId: companyId,
        userId: session.user.id,
        status: 'activo',
        isActive: true,
        contract: {
          deletedAt: null,
          finalDate: { gte: today },
        },
      },
      include: {
        contract: {
          include: {
            userAc: {
              select: { id: true, email: true, displayName: true },
            },
            Company: {
              select: { name: true, rut: true },
            },
          },
        },
      },
    });

    const subContracts = subcontractLinks.map(link => ({
      ...link.contract,
      isSubcontract: true as const,
      mandanteName: link.contract.Company?.name ?? link.contract.Company?.rut ?? null,
    }));

    const ownContractsMapped = ownContracts.map(c => ({
      ...c,
      isSubcontract: false as const,
      mandanteName: null as string | null,
    }));

    return {
      ok: true,
      contracts: [...ownContractsMapped, ...subContracts],
    };
  } catch {
    return { ok: false, error: 'Error al obtener los contratos' };
  }
}