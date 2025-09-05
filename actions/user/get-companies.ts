'use server';

import { auth } from '@/auth';
import { db } from '@/lib/db';
import { Prisma } from '@prisma/client';

export const fetchCompanies = async () => {
  const session = await auth();

  if (!session?.user) {
    return {
      ok: false,
      message: 'No estás autenticado',
    };
  }

  try {
    const companies = await db.company.findMany({
      where: {
        name: {
          not: null,
        },
      },
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

    const formattedCompanies = companies.map(company => ({
      value: company.id,
      label: company.name ? `${company.name} (${company.rut})` : company.rut,
      description: [
        company.phone && `📞 ${company.phone}`,
        company.url && `🌐 ${company.url}`,
        company.city && `📍 ${company.city}`,
      ]
        .filter(Boolean)
        .join(' | '),
    }));

    return {
      ok: true,
      companies: formattedCompanies,
    };
  } catch (error) {
    // console.error('Error al obtener empresas:', error);
    return {
      ok: false,
      message: 'Error al cargar las empresas',
    };
  }
};
