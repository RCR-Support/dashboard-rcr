'use server';

import { db } from '@/lib/db';
import { companySchema } from '@/lib/validation-company';
import { z } from 'zod';
import { auth } from '@/auth';
import { hasActionPermission } from '@/config/action-permissions';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const extractCloudinaryPublicId = (imageUrl: string): string | null => {
  try {
    const url = new URL(imageUrl);
    const uploadIndex = url.pathname.indexOf('/upload/');
    if (uploadIndex === -1) return null;

    // Ejemplo path restante: v1712345678/company-logos/company-logo-123.jpg
    const afterUpload = url.pathname.slice(uploadIndex + '/upload/'.length);
    const withoutVersion = afterUpload.replace(/^v\d+\//, '');
    return withoutVersion.replace(/\.[a-zA-Z0-9]+$/, '');
  } catch {
    return null;
  }
};

const uploadLogoToCloudinary = async (file: File, companyId?: string) => {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const base64Image = `data:${file.type};base64,${buffer.toString('base64')}`;

  const uploadResult = await new Promise<{ secure_url: string }>(
    (resolve, reject) => {
      cloudinary.uploader.upload(
        base64Image,
        {
          folder: 'company-logos',
          public_id: companyId
            ? `company-logo-${companyId}-${Date.now()}`
            : `company-logo-${Date.now()}`,
          overwrite: true,
          transformation: [{ width: 400, height: 200, crop: 'fit' }],
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result as { secure_url: string });
        }
      );
    }
  );

  return uploadResult.secure_url;
};

export const createCompany = async (
  values: z.infer<typeof companySchema>,
  formData?: FormData
) => {
  try {
    const session = await auth();
    if (!session?.user) return { error: 'No autenticado' };
    if (!hasActionPermission('companies:create', session.user.roles)) {
      return { error: 'No tienes permiso para crear empresas' };
    }

    const parsed = companySchema.safeParse(values);

    if (!parsed.success) {
      return {
        error: 'Datos inválidos',
        validationErrors: parsed.error.errors,
      };
    }

    const data = parsed.data;
  let uploadedLogoUrl: string | null = null;

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

    const logoFile = formData?.get('logo') as File | null;
    if (logoFile && logoFile.size > 0) {
      try {
        uploadedLogoUrl = await uploadLogoToCloudinary(logoFile);
      } catch (uploadError) {
        console.error('Error al subir logo de empresa:', uploadError);
        return {
          error:
            'No se pudo subir el logo. Intente con una imagen más pequeña o en otro formato.',
        };
      }
    }

    try {
      // Crear la empresa
      const company = await db.company.create({
        data: {
          name: data.name,
          phone: data.phone,
          rut: data.rut,
          status: data.status,
          url: data.url,
          city: data.city,
          logoUrl: uploadedLogoUrl ?? data.logoUrl ?? null,
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
      if (uploadedLogoUrl) {
        const publicId = extractCloudinaryPublicId(uploadedLogoUrl);
        if (publicId) {
          await cloudinary.uploader.destroy(publicId, { invalidate: true });
        }
      }
      throw error;
    }
  } catch (error) {
    return { error: 'Error interno del servidor' };
  }
};

export const getCompanyById = async (id: string) => {
  try {
    const { auth } = await import('@/auth');
    const { hasActionPermission } = await import('@/config/action-permissions');
    
    // 1. Verificar autenticación
    const session = await auth();
    if (!session?.user) {
      return { error: 'No autenticado' };
    }

    const user = session.user;
    const userRoles = user.roles || [];

    // 2. Verificar permisos
    const canViewAll = hasActionPermission('companies:view:all', userRoles);
    const canViewOwn = hasActionPermission('companies:view:own', userRoles);

    if (!canViewAll && !canViewOwn) {
      return { error: 'No tienes permiso para ver empresas' };
    }

    // 3. Si no es admin, verificar ownership
    if (!canViewAll && canViewOwn) {
      if (!user.companyId || user.companyId !== id) {
        return { error: 'No puedes ver empresas que no son tuyas' };
      }
    }

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
      logoUrl: company.logoUrl,
      users: company.User,
    };

    return {
      success: true,
      company: formattedCompany,
    };
  } catch (error) {
    return { error: 'Error interno del servidor' };
  }
};
export const updateCompany = async (
  values: z.infer<typeof companySchema> & { id: string },
  formData?: FormData
) => {
  try {
    const { auth } = await import('@/auth');
    const { hasActionPermission } = await import('@/config/action-permissions');
    
    // 1. Verificar autenticación
    const session = await auth();
    if (!session?.user) {
      return { error: 'No autenticado' };
    }

    const user = session.user;
    const userRoles = user.roles || [];

    // 2. Verificar permisos
    const canEditAny = hasActionPermission('companies:edit:any', userRoles);
    const canEditOwn = hasActionPermission('companies:edit:own', userRoles);

    if (!canEditAny && !canEditOwn) {
      return { error: 'No tienes permiso para editar empresas' };
    }

    const { id, ...data } = values;
    const parsed = companySchema.safeParse(data);

    if (!parsed.success) {
      return {
        error: 'Datos inválidos',
        validationErrors: parsed.error.errors,
      };
    }

    // 3. Si no es admin, verificar ownership (que edite solo su empresa)
    if (!canEditAny && canEditOwn) {
      if (!user.companyId || user.companyId !== id) {
        return { error: 'No puedes editar empresas que no son tuyas' };
      }
    }

    const currentCompany = await db.company.findUnique({
      where: { id },
      select: { logoUrl: true },
    });

    let uploadedLogoUrl: string | null = null;
    const logoFile = formData?.get('logo') as File | null;
    if (logoFile && logoFile.size > 0) {
      try {
        uploadedLogoUrl = await uploadLogoToCloudinary(logoFile, id);
      } catch (uploadError) {
        console.error('Error al subir logo de empresa:', uploadError);
        return {
          error:
            'No se pudo subir el logo. Intente con una imagen más pequeña o en otro formato.',
        };
      }
    }

    const nextLogoUrl = uploadedLogoUrl ?? parsed.data.logoUrl ?? null;
    const previousLogoUrl = currentCompany?.logoUrl || null;
    const shouldDeletePreviousLogo =
      Boolean(previousLogoUrl) && previousLogoUrl !== nextLogoUrl;

    let company;
    try {
      company = await db.company.update({
        where: { id },
        data: {
          ...parsed.data,
          logoUrl: nextLogoUrl,
        },
      });
    } catch (error) {
      if (uploadedLogoUrl) {
        const publicId = extractCloudinaryPublicId(uploadedLogoUrl);
        if (publicId) {
          await cloudinary.uploader.destroy(publicId, { invalidate: true });
        }
      }
      throw error;
    }

    if (shouldDeletePreviousLogo && previousLogoUrl) {
      const publicId = extractCloudinaryPublicId(previousLogoUrl);
      if (publicId) {
        try {
          await cloudinary.uploader.destroy(publicId, { invalidate: true });
        } catch (deleteError) {
          // No bloquear actualización por falla de limpieza remota.
          console.error('No se pudo eliminar logo anterior en Cloudinary:', deleteError);
        }
      }
    }

    return {
      success: true,
      company,
    };
  } catch (error) {
    return { error: 'Error interno del servidor' };
  }
};

export const deleteCompany = async (companyId: string) => {
  try {
    const session = await auth();
    if (!session?.user) return { error: 'No autenticado' };
    if (!hasActionPermission('companies:delete', session.user.roles)) {
      return { error: 'No tienes permiso para eliminar empresas' };
    }

    // Verificar que no tenga usuarios activos asociados
    const usersCount = await db.user.count({
      where: {
        companyId,
        deletedLogic: false,
        isActive: true,
      },
    });

    if (usersCount > 0) {
      return {
        error: `No se puede eliminar: la empresa tiene ${usersCount} usuario(s) activo(s) asociado(s). Reasígnalos primero.`,
      };
    }

    // Soft delete: desactivar empresa
    await db.company.update({
      where: { id: companyId },
      data: { status: false },
    });

    return { success: true };
  } catch {
    return { error: 'Error interno del servidor' };
  }
};
