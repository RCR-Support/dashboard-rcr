'use server';

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { RoleEnum } from "@prisma/client";
import { AdminResponse, AdminOption } from '@/interfaces/admin.interface';

export const fetchAdmins = async (): Promise<AdminResponse> => {
    const session = await auth();

    if (!session?.user) {
        return {
            ok: false,
            admins: [],
            message: 'No estás autenticado'
        };
    }

    try {
        const dbAdmins = await db.user.findMany({
            where: {
                roles: {
                    some: {
                        role: {
                            name: RoleEnum.adminContractor
                        }
                    }
                },
                isActive: true
            },
            select: {
                id: true,
                name: true,
                lastName: true,
                displayName: true, // Agregamos displayName
                company: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            },
            orderBy: {
                displayName: 'asc' // Ordenamos por displayName
            }
        });

        const formattedAdmins: AdminOption[] = dbAdmins.map(admin => ({
            value: admin.id,
            label: admin.displayName,
            description: admin.company?.name || 'Sin empresa asignada',
            companyId: admin.company?.id // Agregamos el ID de la empresa
        }));

        return {
            ok: true,
            admins: formattedAdmins
        };
    } catch (error) {
        console.error('Error al cargar administradores:', error);
        return {
            ok: false,
            admins: [],
            message: 'Error al cargar los administradores'
        };
    }
};
