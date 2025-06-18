'use server';

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { UserEdit } from "@/interfaces/user.interfaceEdit";

type GetUserByIdResponse =
    | { ok: true; user: UserEdit; message?: string }
    | { ok: false; message: string; user?: never };

export const getUserById = async (userId: string): Promise<GetUserByIdResponse> => {
    try {
        const session = await auth();
        if (!session?.user) {
            return {
                ok: false,
                message: 'No estás autenticado'
            };
        }

        const userData = await db.user.findUnique({
            where: {
                id: userId
            },
            select: {
                id: true,
                name: true,
                middleName: true,
                lastName: true,
                secondLastName: true,
                userName: true,
                email: true,
                run: true,
                password: true,
                displayName: true,
                phoneNumber: true,
                companyId: true,
                adminContractorId: true,
                adminContractor: {
                    select: {
                        id: true,
                        name: true,
                        lastName: true,
                        displayName: true
                    }
                },
                company: {
                    select: {
                        id: true,
                        name: true
                    }
                },
                roles: {
                    include: {
                        role: {
                            select: {
                                id: true,
                                name: true
                            }
                        }
                    }
                },
                image: true // Agregado para incluir el campo image
            }
        });

        if (!userData) {
            return {
                ok: false,
                message: 'Usuario no encontrado'
            };
        }

        // Log para debug
        console.log('Datos del usuario:', {
            id: userData.id,
            roles: userData.roles,
            adminContractorId: userData.adminContractorId,
            adminContractor: userData.adminContractor
        });

        const user: UserEdit = {
            id: userData.id,
            name: userData.name,
            lastName: userData.lastName,
            middleName: userData.middleName,
            secondLastName: userData.secondLastName,
            userName: userData.userName,
            email: userData.email,
            password: userData.password || undefined,
            run: userData.run,
            phoneNumber: userData.phoneNumber,
            companyId: userData.companyId,
            displayName: userData.displayName,
            company: userData.company,
            roles: userData.roles,
            adminContractorId: userData.adminContractorId || null,
            adminContractor: userData.adminContractor,
            image: userData.image // Agregado para incluir el campo image
        };

        return {
            ok: true,
            user
        };

    } catch (error) {
        console.error('Error al obtener usuario:', error);
        return {
            ok: false,
            message: 'Error al obtener el usuario XD'
        };
    }
};
