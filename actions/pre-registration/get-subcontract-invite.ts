'use server';

import { db } from '@/lib/db';
import { hashSubcontractInviteToken } from '@/lib/subcontracts/invite-token';

export type SubcontractInviteContext = {
  subcontractId: string;
  token: string;
  representativeEmail: string | null;
  subCompany: {
    id: string;
    name: string | null;
    rut: string;
    city: string | null;
  };
  contract: {
    id: string;
    contractName: string;
    contractNumber: string;
    mandanteName: string | null;
    mandanteRut: string;
  };
};

export async function getSubcontractInviteContext(
  subcontractId?: string,
  token?: string
): Promise<SubcontractInviteContext | null> {
  if (!subcontractId || !token) return null;

  const subcontract = await db.subcontract.findFirst({
    where: {
      id: subcontractId,
      inviteToken: hashSubcontractInviteToken(token),
      status: 'pendiente',
      isActive: false,
      OR: [
        { inviteExpiresAt: null },
        { inviteExpiresAt: { gt: new Date() } },
      ],
    },
    include: {
      subCompany: {
        select: { id: true, name: true, rut: true, city: true },
      },
      contract: {
        select: {
          id: true,
          contractName: true,
          contractNumber: true,
          Company: { select: { name: true, rut: true } },
        },
      },
    },
  });

  if (!subcontract) return null;

  return {
    subcontractId: subcontract.id,
    token,
    representativeEmail: subcontract.representativeEmail,
    subCompany: subcontract.subCompany,
    contract: {
      id: subcontract.contract.id,
      contractName: subcontract.contract.contractName,
      contractNumber: subcontract.contract.contractNumber,
      mandanteName: subcontract.contract.Company.name,
      mandanteRut: subcontract.contract.Company.rut,
    },
  };
}