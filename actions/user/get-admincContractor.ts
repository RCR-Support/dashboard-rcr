'use server';

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { RoleEnum } from "@prisma/client";

export const fetchAdmins = async () => {
    const session = await auth();

    if (!session?.user) {
        return {
            ok: false,
            message: 'No estás autenticado'
        };
    }

    try {
        const admins = await db.user.findMany({
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
                company: {
                    select: {
                        name: true
                    }
                }
            }
        });

        const formattedAdmins = admins.map(admin => ({
            value: admin.id,
            label: `${admin.name} ${admin.lastName} ${admin.company?.name ? `- ${admin.company.name}` : ''}`
        }));

        return {
            ok: true,
            admins: formattedAdmins
        };
    } catch (error) {
        return {
            ok: false,
            message: 'Error al cargar los administradores'
        };
    }
};
