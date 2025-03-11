import { initialData } from "./seed";
import { db } from "../lib/db";
import { RoleEnum } from "@prisma/client"; // Importa RoleEnum de Prisma
async function main() {
    console.log('Seeding database...');

    // Eliminar datos existentes
    await db.userRole.deleteMany({});
    await db.user.deleteMany({});
    await db.company.deleteMany({});
    await db.role.deleteMany({}); // Asegúrate de eliminar los roles existentes

    // Crear roles
    const roles: RoleEnum[] = [RoleEnum.admin, RoleEnum.sheq, RoleEnum.adminContractor, RoleEnum.user, RoleEnum.credential];
    for (const role of roles) {
        await db.role.create({
            data: { name: role },
        });
    }

    // Crear empresas y obtener sus IDs
    const companies = await Promise.all(
        initialData.companies.map(company =>
            db.company.create({
                data: company,
            })
        )
    );

    // Crear usuarios y asignar roles
    for (const user of initialData.users) {
        const company = companies.find(c => c.name === 'RCR-Support'); // Ajusta esto según tus necesidades
        if (company) {
            user.companyId = company.id;
        }

        const createdUser = await db.user.create({
            data: {
                name: user.name,
                middleName: user.middleName,
                lastName: user.lastName,
                secondLastName: user.secondLastName,
                userName: user.userName,
                displayName: user.displayName,
                email: user.email,
                run: user.run,
                phoneNumber: user.phoneNumber,
                category: user.category,
                deletedLogic: user.deletedLogic,
                password: user.password,
                image: user.image,
                companyId: user.companyId,
            },
        });

        // Asignar roles al usuario
        for (const role of user.roles) {
            const roleRecord = await db.role.findUnique({
                where: { name: role },
            });

            if (roleRecord) {
                await db.userRole.create({
                    data: {
                        userId: createdUser.id,
                        roleId: roleRecord.id,
                    },
                });
            }
        }
    }

    console.log('Database seeded successfully.');
}

main()
    .catch((e) => {
        console.error('Error al ejecutar el seed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await db.$disconnect();
    });
