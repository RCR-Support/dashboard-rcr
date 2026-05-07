'use server';

import { auth } from '@/auth';
import { db } from '@/lib/db';
import { Prisma } from '@prisma/client';
import { hasActionPermission } from '@/config/action-permissions';

export const fetchCompanies = async (onlyWithContracts = false) => {
  const session = await auth();

  if (!session?.user) {
    return {
      ok: false,
      message: 'No estás autenticado',
    };
  }

  const user = session.user;
  const userRoles = user.roles || [];

  // Verificar permisos - Solo admin puede ver empresas
  const canViewAll = hasActionPermission('companies:view:all', userRoles);

  if (!canViewAll) {
    return {
      ok: false,
      message: 'No tienes permiso para ver empresas',
    };
  }

  try {
    const whereClause: Prisma.CompanyWhereInput = {
      name: {
        not: null,
      },
      ...(onlyWithContracts && {
        Contract: {
          some: {},
        },
      }),
    };

    const formatCompany = (company: {
      id: string;
      name: string | null;
      rut: string;
      phone: string;
      url: string | null;
      city: string | null;
      logoUrl?: string | null;
    }) => ({
      value: company.id,
      label: company.name ? `${company.name} (${company.rut})` : company.rut,
      description: [
        company.phone && `📞 ${company.phone}`,
        company.url && `🌐 ${company.url}`,
        company.city && `📍 ${company.city}`,
      ]
        .filter(Boolean)
        .join(' | '),
      logoUrl: company.logoUrl ?? null,
    });

    try {
      const companies = await db.company.findMany({
        where: whereClause,
        select: {
          id: true,
          name: true,
          rut: true,
          phone: true,
          status: true,
          url: true,
          city: true,
          logoUrl: true,
        },
        orderBy: {
          name: 'asc',
        },
      });

      return {
        ok: true,
        companies: companies.map(formatCompany),
      };
    } catch (error) {
      // Fallback temporal para ambientes donde aún no existe logoUrl.
      const companies = await db.company.findMany({
        where: whereClause,
        select: {
          id: true,
          name: true,
          rut: true,
          phone: true,
          status: true,
          url: true,
          city: true,
        },
        orderBy: {
          name: 'asc',
        },
      });

      return {
        ok: true,
        companies: companies.map(company => formatCompany({ ...company, logoUrl: null })),
        warning: 'Listado cargado sin logoUrl (migracion pendiente)',
      };
    }
  } catch (error) {
    // console.error('Error al obtener empresas:', error);
    return {
      ok: false,
      message: 'Error al cargar las empresas',
    };
  }
};
