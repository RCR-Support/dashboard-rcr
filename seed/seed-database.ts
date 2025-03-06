import { initialData } from "./seed";
import { db } from "../lib/db";

async function main() {
    try {
        // Eliminar empresas existentes
        await db.company.deleteMany({});

        // Eliminar usuarios existentes
        await db.user.deleteMany();

        // Crear empresas y obtener sus IDs
        const companies = await Promise.all(
            initialData.companies.map(company =>
                db.company.create({
                    data: company
                })
            )
        );

        // Asignar IDs de empresas a los usuarios
        const usersWithCompanyIds = initialData.users.map((user, index) => ({
            ...user,
            companyId: companies[index % companies.length].id
        }));

        // Crear usuarios con los IDs de las empresas asignados
        await db.user.createMany({
            data: usersWithCompanyIds
        });

        console.log('Seed ejecutado correctamente');
    } catch (error) {
        console.error('Error al ejecutar el seed:', error);
    } finally {
        await db.$disconnect();
    }
}

(() => {
    if (process.env.NODE_ENV === 'production') return;
    main();
})();
