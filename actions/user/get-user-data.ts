'use server';

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { RoleEnum } from "@prisma/client";

export const fetchUserData = async () => {
    const session = await auth();

    if (!session?.user || session.user.roles?.includes('admin') === false) {
        return {
            ok: false,
            message: 'No tienes permiso de administrador'
        };
    }

    try {
    const users = await db.user.findMany({
        where: {
            deletedLogic: false,
        },
        orderBy: { createdAt: 'desc' },
        include: {
            company: true,  // Relación con la empresa
            roles:{         // Relación con los roles
                include: {
                    role: true
                }
            },
            adminContractor: true,
            assignedUsers: {
                where: {
                    deletedLogic: false
                },
                include: {
                    company: true
                }
            } // Incluir la relación
        }
    });

    return {
        ok: true,
        users: users.map(user => ({
            ...user,
            roles: user.roles.map(r => r.role.name as RoleEnum), // Asegúrate de que el tipo sea correcto
        }))
    };
    } catch (error) {
        console.error("Error al obtener los datos de usuario:", error);
        return {
            ok: false,
            message: 'Error al obtener los datos de usuario'
        };
    }

};
