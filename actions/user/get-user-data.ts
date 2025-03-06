'use server';

import { auth } from "@/auth";
import { db } from "@/lib/db";

export const fetchUserData = async () => {
    const session = await auth();

    if (!session?.user || session.user.role !== 'admin') {
        return {
            ok: false,
            message: 'No tienes permiso de administrador'
        };
    }

    const users = await db.user.findMany({
        orderBy: { createdAt: 'desc' },
        include: { company: true } // Relación con la empresa
    });



    // console.log("Usuarios desde el action:", users); // Se verá en la terminal
    // console.log("Empresas:", users.map(user => user.company?.name ?? "Sin empresa")); // También en la terminal

    return {
        ok: true,
        users
    };
};
