import { PrismaClient } from '@prisma/client';
import bcryptjs from 'bcryptjs';

const db = new PrismaClient();

interface SeedUser {
    name: string;
    middleName?: string;
    lastName: string;
    secondLastName?: string;
    userName: string;
    displayName: string;
    email: string;
    run: string;
    phoneNumber: string;
    category: string;
    deletedLogic: boolean;
    password: string;
    image?: string;
    roles: ValidRoles[];
    companyId: string;
}


interface SeedCompany {
    name: string;
    rut: string;
    phone: string;
}

interface SeedData {
    users: SeedUser[];
    companies: SeedCompany[];
}
type ValidRoles = 'admin' | 'sheq' | 'adminContractor' | 'user' | 'credential';
export const initialData: SeedData = {
    users: [
        {
            name: 'Héctor',
            middleName: 'Javier',
            lastName: 'Matcovich',
            secondLastName: 'González',
            userName: 'H Matcovich G',
            displayName: 'Héctor Matcovich',
            email: 'matcovich@gmail.com'.toLocaleLowerCase(),
            run: '133272496',
            phoneNumber: '988777600',
            category: 'Category1',
            deletedLogic: false,
            password: bcryptjs.hashSync('uno1dos2', 10),
            image: 'path/to/image1.jpg',
            roles: ['admin', 'sheq', 'adminContractor', 'user', 'credential'],
            companyId: 'cm91fqt6e0005vdos3xd0cj8w', // Se establecerá más adelante
        },
        {
            name: 'Rodrigo',
            middleName: 'Andres',
            lastName: 'Larenas',
            secondLastName: 'Matcovich',
            userName: 'Rodrigo Larenas Matcovich',
            displayName: 'Rodrigo Larenas',
            email: 'rodrigo.larenas@rcrsupport.cl'.toLocaleLowerCase(),
            run: '123456789',
            phoneNumber: '988777601',
            category: 'Category1',
            deletedLogic: false,
            password: bcryptjs.hashSync('123456', 10),
            image: 'path/to/image1.jpg',
            roles: ['admin', 'sheq'],
            companyId: 'cm91fqt6e0005vdos3xd0cj8w', // Se establecerá más adelante
        },
        {
            name: 'Sheq',
            middleName: '',
            lastName: 'Prueba',
            secondLastName: '',
            userName: 'sheq de prueba',
            displayName: 'Sheq de prueba',
            email: 'sheq@correo.com'.toLocaleLowerCase(),
            run: '876543210',
            phoneNumber: '988777602',
            category: 'Category2',
            deletedLogic: false,
            password: bcryptjs.hashSync('123456', 10),
            image: 'path/to/image2.jpg',
            roles: ['sheq'],
            companyId: 'cm91fqt6e0005vdos3xd0cj8w', // Se establecerá más adelante
        },
        {
            name: 'Admin Contrato',
            middleName: '',
            lastName: 'Prueba',
            secondLastName: '',
            userName: 'adminContrato de prueba',
            displayName: 'Admin Contrato de prueba',
            email: 'adminContrato@correo.com'.toLocaleLowerCase(),
            run: '112233445',
            phoneNumber: '988777603',
            category: 'Category3',
            deletedLogic: false,
            password: bcryptjs.hashSync('123456', 10),
            image: 'path/to/image3.jpg',
            roles: ['adminContractor'],
            companyId: 'cm91fqt6e0005vdos3xd0cj8w', // Se establecerá más adelante
        },
        {
            name: 'Usuario',
            middleName: '',
            lastName: 'Prueba',
            secondLastName: '',
            userName: 'usuario de prueba',
            displayName: 'Usuario de prueba',
            email: 'usuario@correo.com'.toLocaleLowerCase(),
            run: '556677889',
            phoneNumber: '988777604',
            category: 'Category4',
            deletedLogic: false,
            password: bcryptjs.hashSync('123456', 10),
            image: 'path/to/image4.jpg',
            roles: ['user'],
            companyId: 'cm91fqt6e0005vdos3xd0cj8w', // Se establecerá más adelante
        },
        {
            name: 'Imprimir',
            middleName: '',
            lastName: 'Prueba',
            secondLastName: '',
            userName: 'Imprimir de prueba',
            displayName: 'Imprimir de prueba',
            email: 'credencial@correo.com'.toLocaleLowerCase(),
            run: '998877665',
            phoneNumber: '988777605',
            category: 'Category5',
            deletedLogic: false,
            password: bcryptjs.hashSync('123456', 10),
            image: 'path/to/image5.jpg',
            roles: ['credential'],
            companyId: 'cm91fqt6e0005vdos3xd0cj8w', // Se establecerá más adelante
        }
    ],
    companies: [
        { name: 'RCR-Support', rut: '761015524', phone: '988777650' },
        { name: 'Capstone Copper', rut: '774185801', phone: '988777651' },
        { name: 'Ingeniería Civil Vicente S.A.', rut: '93546000k', phone: '988777652' },
        { name: 'Carcamo y Clunes Gestion de Riesgos', rut: '767485891', phone: '988777653' },
        { name: 'Guiñez', rut: '781528501', phone: '988777654' },
        { name: 'Enaex', rut: '760418714', phone: '988777655' },
        { name: 'EPSA', rut: '967730602', phone: '988777656' },
        { name: 'VIGGO', rut: '766423205', phone: '988777657' },
        { name: 'AMECO CHILE SA', rut: '968621408', phone: '988777658' },
        { name: 'VMS Chile SA.', rut: '78794180K', phone: '988777659' },
        { name: 'Reveco & Schiaffo', rut: '762597799', phone: '988777660' },
        { name: 'Schwager', rut: '761450476', phone: '988777661' },
        { name: 'RV Conveyor', rut: '767468482', phone: '988777662' },
        { name: 'FAM América Latina Maquinarias Ltda.', rut: '776837903', phone: '988777663' },
    ]
};

// async function main() {
//     console.log('Seeding database...');

//     // Eliminar datos existentes
//     await db.userRole.deleteMany({});
//     await db.user.deleteMany({});
//     await db.company.deleteMany({});

//     // Crear empresas y obtener sus IDs
//     const companies = await Promise.all(
//         initialData.companies.map(company =>
//             db.company.create({
//                 data: company,
//             })
//         )
//     );

//     // Crear usuarios y asignar roles
//     for (const user of initialData.users) {
//         const company = companies.find(c => c.name === 'RCR-Support'); // Ajusta esto según tus necesidades
//         if (company) {
//             user.companyId = company.id;
//         }

//         const createdUser = await db.user.create({
//             data: {
//                 name: user.name,
//                 middleName: user.middleName,
//                 lastName: user.lastName,
//                 secondLastName: user.secondLastName,
//                 userName: user.userName,
//                 displayName: user.displayName,
//                 email: user.email,
//                 run: user.run,
//                 phoneNumber: user.phoneNumber,
//                 category: user.category,
//                 deletedLogic: user.deletedLogic,
//                 password: user.password,
//                 image: user.image,
//                 companyId: user.companyId,
//             },
//         });

//         // Asignar roles al usuario
//         for (const role of user.roles) {
//             const roleRecord = await db.role.findUnique({
//                 where: { name: role },
//             });

//             if (roleRecord) {
//                 await db.userRole.create({
//                     data: {
//                         userId: createdUser.id,
//                         roleId: roleRecord.id,
//                     },
//                 });
//             }
//         }
//     }

//     console.log('Database seeded successfully.');
// }

// main()
//     .catch((e) => {
//         console.error('Error al ejecutar el seed:', e);
//         process.exit(1);
//     })
//     .finally(async () => {
//         await db.$disconnect();
//     });
