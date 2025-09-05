'use server';

import { db } from '@/lib/db';
import { companySchema } from '@/lib/validation-company';
import { z } from 'zod';

export const createCompany = async (values: z.infer<typeof companySchema>) => {
  try {
    const parsed = companySchema.safeParse(values);

    if (!parsed.success) {
      return {
        error: 'Datos inválidos',
        validationErrors: parsed.error.errors,
      };
    }

    const data = parsed.data;

    // Verificar si ya existe una empresa con ese RUT
    const companyExists = await db.company.findUnique({
      where: { rut: data.rut },
      include: {
        User: {
          select: {
            id: true,
            name: true,
            lastName: true,
            run: true,
            email: true,
            roles: {
              select: {
                role: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (companyExists) {
      return { error: 'Ya existe una empresa con ese RUT' };
    }

    // Crear la empresa
    const company = await db.company.create({
      data: {
        name: data.name,
        phone: data.phone,
        rut: data.rut,
        status: data.status,
        url: data.url,
        city: data.city,
      },
      include: {
        User: {
          select: {
            id: true,
            name: true,
            lastName: true,
            run: true,
            email: true,
            roles: {
              select: {
                role: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    return {
      success: true,
      company,
    };
  } catch (error) {
    console.error('Error al crear empresa:', error);
    return { error: 'Error interno del servidor' };
  }
};

export const getCompanyById = async (id: string) => {
  try {
    const company = await db.company.findUnique({
      where: { id },
      include: {
        User: {
          select: {
            id: true,
            name: true,
            lastName: true,
            run: true,
            email: true,
            roles: {
              select: {
                role: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!company) {
      return { error: 'Empresa no encontrada' };
    }

    // Transformar los datos al formato CompanySelect
    const formattedCompany = {
      value: company.id,
      name: company.name,
      rut: company.rut,
      phone: company.phone,
      status: company.status,
      city: company.city,
      url: company.url,
      users: company.User,
    };

    return {
      success: true,
      company: formattedCompany,
    };
  } catch (error) {
    console.error('Error al obtener empresa:', error);
    return { error: 'Error interno del servidor' };
  }
};
export const updateCompany = async (
  values: z.infer<typeof companySchema> & { id: string }
) => {
  try {
    const { id, ...data } = values;
    const parsed = companySchema.safeParse(data);

    if (!parsed.success) {
      return {
        error: 'Datos inválidos',
        validationErrors: parsed.error.errors,
      };
    }

    const company = await db.company.update({
      where: { id },
      data: parsed.data,
    });

    return {
      success: true,
      company,
    };
  } catch (error) {
    console.error('Error al actualizar empresa:', error);
    return { error: 'Error interno del servidor' };
  }
};
