'use server';

import { db } from '@/lib/db';
import { auth } from '@/auth';

export const getCompanyUsers = async (companyId: string) => {
  try {
    const session = await auth();
    if (!session?.user) return { error: 'No autenticado' };
    // 1. Hacemos una consulta única que trae todos los datos relacionados
    const company = await db.company.findUnique({
      where: {
        id: companyId,
      },
      include: {
        // 2. Incluimos los usuarios activos
        User: {
          where: { isActive: true },
          select: {
            id: true,
            name: true,
            lastName: true,
            email: true,
            phoneNumber: true,
            displayName: true,
            roles: {
              include: {
                role: true,
              },
            },
          },
        },
        //  3. Incluimos los contratos no eliminados con sus administradores
        Contract: {
          where: {
            deletedAt: null,
          },
          select: {
            id: true,
            contractNumber: true,
            contractName: true,
            initialDate: true,
            finalDate: true,
            userAc: {
              select: {
                id: true,
                email: true,
                displayName: true,
              },
            },
            // Sub-empresas vinculadas a cada contrato
            subcontracts: {
              where: { isActive: true },
              select: {
                id: true,
                status: true,
                subCompanyId: true,
                subCompany: {
                  select: { id: true, name: true, rut: true },
                },
                user: {
                  select: { displayName: true },
                },
              },
            },
          },
        },
        // Si esta empresa es sub-empresa de alguien
        subcontracts: {
          where: { isActive: true },
          select: {
            id: true,
            status: true,
            contract: {
              select: {
                id: true,
                contractName: true,
                contractNumber: true,
                Company: { select: { id: true, name: true, rut: true } },
              },
            },
          },
        },
      },
    });

    if (!company) {
      return {
        success: false,
        error: 'Compañía no encontrada',
      };
    }
    // 5. Formateamos la respuesta
    const formattedCompany = {
      users: company.User || [],
      contracts:
        company?.Contract.map(contract => ({
          ...contract,
          adminName: contract.userAc?.displayName || 'Sin administrador',
          subcompanies: contract.subcontracts?.map(s => ({
            id: s.subCompany.id,
            name: s.subCompany.name,
            rut: s.subCompany.rut,
            status: s.status,
            representativeName: s.user?.displayName ?? null,
          })) || [],
        })) || [],
      // Contratos en los que esta empresa es sub-empresa
      asSubcontractor: company.subcontracts?.map(s => ({
        contractId: s.contract.id,
        contractName: s.contract.contractName,
        contractNumber: s.contract.contractNumber,
        mandanteId: s.contract.Company?.id,
        mandanteName: s.contract.Company?.name,
        mandanteRut: s.contract.Company?.rut,
        status: s.status,
      })) || [],
      summary: {
        totalUsers: company.User.length,
        totalContracts: company.Contract.length,
      },
    };

    return {
      success: true,
      ...formattedCompany,
    };
  } catch (error) {
    console.error('Error al obtener datos de la compañía:', error);
    return {
      success: false,
      error: 'Error interno del servidor',
      users: [],
      contracts: [],
      asSubcontractor: [],
      summary: {
        totalUsers: 0,
        totalContracts: 0,
      },
    };
  }
};
