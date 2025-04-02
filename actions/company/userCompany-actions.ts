"use server";

import { db } from "@/lib/db";

export const getCompanyUsers = async (companyId: string) => {
    try {
        const users = await db.user.findMany({
            where: {
                companyId: companyId,
                isActive: true
            },
            select: {
                id: true,
                name: true,
                lastName: true,
                email: true,
                phoneNumber: true,
                displayName: true,
                roles: {
                    include: {
                        role: true
                    }
                }
            }
        });

        return {
            success: true,
            users
        };

    } catch (error) {
        console.error("Error al obtener usuarios:", error);
        return { error: "Error interno del servidor" };
    }
};
