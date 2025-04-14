"use server";

import { db } from "@/lib/db";
import { AdminContractorWithUsers } from "@/interfaces/admin.interface";

export const checkAssignedUsers = async (userId: string): Promise<AdminContractorWithUsers | null> => {
    try {
        // Verificar si el usuario es adminContractor
        const user = await db.user.findFirst({
            where: {
                id: userId,
                roles: {
                    some: {
                        role: {
                            name: 'adminContractor'
                        }
                    }
                }
            },
            include: {
                assignedUsers: {
                    where: { 
                        deletedLogic: false 
                    },
                    include: {
                        company: true
                    }
                }
            }
        });

        if (!user) {
            console.log('No es adminContractor');
            return null;
        }

        const assignedUsers = user.assignedUsers.map(assignedUser => ({
            id: assignedUser.id,
            displayName: assignedUser.displayName,
            email: assignedUser.email,
            company: assignedUser.company ? {
                name: assignedUser.company.name
            } : null
        }));

        console.log('Usuarios asignados encontrados:', assignedUsers.length);

        return {
            id: user.id,
            displayName: user.displayName,
            assignedUsers
        };

    } catch (error) {
        console.error("Error al verificar usuarios:", error);
        return null;
    }
};
