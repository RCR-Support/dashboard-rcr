"use server";

import { db } from "@/lib/db";

export const getCompanyUsers = async (companyId: string) => {
    try {
        // 1. Hacemos una consulta única que trae todos los datos relacionados
        const company = await db.company.findUnique({
            where: {
                id: companyId,
            },
            include: {
                // 2. Incluimos los usuarios activos
                User: {
                    where: { isActive: true },
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
                },
                //  3. Incluimos los contratos no eliminados con sus administradores
                Contract: {
                    where: {
                        deletedAt: null
                    },
                    select: {
                        id: true,
                        contractNumber: true,
                        contractName: true,
                        initialDate: true,
                        finalDate: true,
                        // 4. Agregamos datos del administrador del contrato
                        userAc: {
                            select: {
                                id: true,
                                email: true,
                                displayName: true
                            }
                        }
                    }
                }
            }
        });

        if (!company) {
            return {
                success: false,
                error: "Compañía no encontrada"
            };
        }
        // 5. Formateamos la respuesta
        const formattedCompany = {
            users: company.User || [],
            contracts: company?.Contract.map(contract => ({
                ...contract,
                adminName: contract.userAc?.displayName || 'Sin administrador'
            })) || [],
            summary: {
                totalUsers: company.User.length,
                totalContracts: company.Contract.length
            }
        };

        return {
            success: true,
            ...formattedCompany
        };

    } catch (error) {
        console.error("Error al obtener datos de la compañía:", error);
        return {
            success: false,
            error: "Error interno del servidor",
            users: [],
            contracts: [],
            summary: {
                totalUsers: 0,
                totalContracts: 0
            }
        };
    }
};
