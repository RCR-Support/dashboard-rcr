import { initialData } from "./seed";
import { db } from "../lib/db";
import { RoleEnum } from "@prisma/client"; // Importa RoleEnum de Prisma
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function runOtherSeeds() {
    try {
        // Ejecutar otros scripts de semilla
        console.log('Ejecutando seed para actividades y documentaciones...');
        await execAsync('npx ts-node seed/seed-activities-documentations.ts');
        
        console.log('Ejecutando seed para relaciones actividad-documentación...');
        await execAsync('npx ts-node seed/seed-activity-documentation-relations.ts');
        
        console.log('Ejecutando seed para licencias de conducir...');
        await execAsync('npx ts-node seed/seed-driver-licenses.ts');
    } catch (error) {
        console.error('Error al ejecutar scripts de semilla adicionales:', error);
    }
}

async function main() {
    console.log('Seeding database...');

    // Eliminar datos existentes en orden para evitar violaciones de clave foránea
    try {
        // Primero eliminar las tablas que tienen referencias a user, company, etc.
        await db.contract.deleteMany({});
        await db.userRole.deleteMany({});
        await db.notification.deleteMany({});
        await db.applicationAudit.deleteMany({});
        await db.documentationFile.deleteMany({});
        await db.application.deleteMany({});
        await db.reassignmentLog.deleteMany({});
        await db.activityDocumentation.deleteMany({});
        await db.documentation.deleteMany({});
        await db.activity.deleteMany({});
        
        // Ahora podemos eliminar usuarios y compañías
        await db.user.deleteMany({});
        await db.company.deleteMany({});
        await db.role.deleteMany({});
        await db.account.deleteMany({});
        await db.verificationToken.deleteMany({});
        
        console.log('Datos anteriores eliminados correctamente.');
    } catch (error) {
        console.error('Error al eliminar datos existentes:', error);
        throw error;
    }

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

    // Almacenar referencia del adminContractor
    let adminContractorUser = null;

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

            // Almacenar referencia del adminContractor
            if (role === RoleEnum.adminContractor) {
                adminContractorUser = createdUser; // Guarda el usuario creado como adminContractor
            }
            // Si es un usuario normal, asignarle el adminContractor
            if (user.roles.includes('user') && adminContractorUser) {
                await db.user.update({
                    where: { id: createdUser.id },
                    data: {
                        adminContractorId: adminContractorUser.id
                    }
                });
                console.log(`Asignado adminContractor ${adminContractorUser.displayName} al usuario ${createdUser.displayName}`);
            }
        }
    }

    console.log('Database seeded with users, roles and companies.');
    
    // Ejecutar otros scripts de semilla
    await runOtherSeeds();
    
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
