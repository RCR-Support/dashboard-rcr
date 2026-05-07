'use server';

import { db } from '@/lib/db';
import {
  Contract,
  ContractUser,
  ContractResponse,
  ContractFormValues,
} from '@/interfaces/contract.interface';
import {
  AdminContractor,
  AdminContractorResponse,
} from '@/interfaces/admin-contractor.interface';
import { revalidatePath } from 'next/cache';
import { Prisma } from '@prisma/client';
import { auth } from '@/auth';
import { hasActionPermission } from '@/config/action-permissions';

// Tipo para crear un contrato usando los tipos de Prisma
type CreateContractInput = Prisma.ContractCreateInput;

export async function getContracts(
  companyId: string
): Promise<ContractResponse> {
  try {
    const session = await auth();
    if (!session?.user) return { success: false, error: 'No autenticado', contracts: [] };
    const contracts = await db.contract.findMany({
      where: {
        companyId,
        deletedAt: null,
      },
      include: {
        userAc: {
          select: {
            id: true,
            displayName: true,
            email: true,
          },
        },
      },
    });

    const formattedContracts: Contract[] = contracts.map(contract => ({
      ...contract,
      userAc: contract.userAc as ContractUser,
    }));

    return {
      success: true,
      contracts: formattedContracts,
    };
  } catch {
    return {
      success: false,
      error: 'Error al cargar los contratos',
      contracts: [],
    };
  }
}

export async function createContract(data: ContractFormValues) {
  try {
    const session = await auth();
    if (!session?.user) return { success: false, error: 'No autenticado' };
    if (!hasActionPermission('contracts:create', session.user.roles)) {
      return { success: false, error: 'No tienes permiso para crear contratos' };
    }

    const contract = await db.contract.create({
      data: {
        contractNumber: data.contractNumber,
        contractName: data.contractName,
        initialDate: new Date(data.initialDate),
        finalDate: new Date(data.finalDate),
        Company: {
          connect: { id: data.companyId },
        },
        userAc: {
          connect: { id: data.useracId },
        },
      },
      include: {
        userAc: {
          select: {
            id: true,
            displayName: true,
            email: true,
          },
        },
        Company: true, // <-- También incluimos la Company en la respuesta si la necesitamos
      },
    });

    revalidatePath('/dashboard/companies');
    return { success: true, contract };
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : 'Error al crear el contrato',
    };
  }
}

export async function getAdminContractors(): Promise<AdminContractorResponse> {
  try {
    const adminContractors = await db.user.findMany({
      where: {
        roles: {
          some: {
            role: {
              name: 'adminContractor',
            },
          },
        },
        deletedLogic: false,
      },
      select: {
        id: true,
        displayName: true,
        email: true,
      },
    });

    const formattedAdmins: AdminContractor[] = adminContractors.map(admin => ({
      value: admin.id,
      label: admin.displayName,
      description: admin.email,
    }));

    return {
      success: true,
      adminContractors: formattedAdmins,
    };
  } catch {
    return {
      success: false,
      error: 'Error al cargar administradores',
      adminContractors: [],
    };
  }
}
