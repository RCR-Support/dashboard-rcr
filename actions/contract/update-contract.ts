'use server';

import { db } from '@/lib/db';
import { auth } from '@/auth';
import { hasActionPermission } from '@/config/action-permissions';
import { revalidatePath } from 'next/cache';

export interface UpdateContractInput {
  contractNumber: string;
  contractName: string;
  initialDate: Date;
  finalDate: Date;
  useracId: string;
}

export async function updateContract(contractId: string, data: UpdateContractInput) {
  const session = await auth();
  if (!session?.user) return { success: false, error: 'No autenticado' };

  const canEditAny = hasActionPermission('contracts:edit:any', session.user.roles);
  const canEditAssigned = hasActionPermission('contracts:edit:assigned', session.user.roles);

  if (!canEditAny && !canEditAssigned) {
    return { success: false, error: 'No tienes permiso para editar contratos' };
  }

  // Si solo puede editar los asignados, verificar que sea su contrato
  if (!canEditAny && canEditAssigned) {
    const contract = await db.contract.findUnique({
      where: { id: contractId },
      select: { useracId: true },
    });
    if (!contract) return { success: false, error: 'Contrato no encontrado' };
    if (contract.useracId !== session.user.id) {
      return { success: false, error: 'Solo puedes editar contratos asignados a ti' };
    }
  }

  try {
    const updated = await db.contract.update({
      where: { id: contractId },
      data: {
        contractNumber: data.contractNumber,
        contractName: data.contractName,
        initialDate: new Date(data.initialDate),
        finalDate: new Date(data.finalDate),
        userAc: { connect: { id: data.useracId } },
      },
      include: {
        userAc: { select: { id: true, displayName: true, email: true } },
        Company: { select: { id: true, name: true } },
      },
    });

    revalidatePath('/dashboard/contracts');
    revalidatePath('/dashboard/companies');

    return { success: true, contract: updated };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al actualizar el contrato',
    };
  }
}
