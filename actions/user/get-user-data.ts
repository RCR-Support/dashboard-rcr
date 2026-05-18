'use server';

import { auth } from '@/auth';
import { db } from '@/lib/db';
import { RoleEnum } from '@prisma/client';
import { hasActionPermission } from '@/config/action-permissions';

export const fetchUserData = async () => {
  const timestamp = Date.now(); // Agregar timestamp para evitar caché

  const session = await auth();

  if (!session?.user || !hasActionPermission('companies:view:all', session.user.roles)) {
    return {
      ok: false,
      message: 'No tienes permiso de administrador',
    };
  }

  try {
    const users = await db.user.findMany({
      // No filtramos por deletedLogic para traer todos los usuarios
      orderBy: { createdAt: 'desc' },
      omit: { password: true },
      include: {
        company: true, // Relación con la empresa
        roles: {
          // Relación con los roles
          include: {
            role: true,
          },
        },
        adminContractor: true,
        assignedUsers: {
          include: {
            company: true,
          },
        },
        Contract: {
          where: { deletedAt: null },
          select: {
            id: true,
            contractName: true,
            contractNumber: true,
            Company: { select: { name: true } },
          },
          orderBy: { contractName: 'asc' },
        },
        subcontractsAsRep: {
          where: { isActive: true },
          select: {
            status: true,
            contract: {
              select: {
                contractName: true,
                contractNumber: true,
                Company: { select: { name: true } },
              },
            },
          },
        },
      },
    });

    return {
      ok: true,
      users: users.map(user => ({
        ...user,
        roles: user.roles.map(r => r.role.name as RoleEnum),
        contracts: user.Contract,
        asSubcontractor: user.subcontractsAsRep.map(s => ({
          contractName: s.contract.contractName,
          contractNumber: s.contract.contractNumber,
          mandanteName: s.contract.Company?.name ?? null,
          status: s.status,
        })),
      })),
    };
  } catch (error) {
    console.error('Error al obtener los datos de usuario:', error);
    return {
      ok: false,
      message: 'Error al obtener los datos de usuario',
    };
  }
};
