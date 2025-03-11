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
            run: '12345678-9',
            phoneNumber: '+56912345678',
            category: 'Category1',
            deletedLogic: false,
            password: bcryptjs.hashSync('123456', 10),
            image: 'path/to/image1.jpg',
            roles: ['admin', 'sheq', 'adminContractor', 'user', 'credential'],
            companyId: 'cm7p8ogxg0009vdjk6gcp0h2r', // Se establecerá más adelante
        },
        {
            name: 'Rodrigo',
            middleName: 'Andres',
            lastName: 'Larenas',
            secondLastName: 'Matcovich',
            userName: 'Rodrigo Larenas Matcovich',
            displayName: 'Rodrigo Larenas',
            email: 'rodrigo.larenas@rcrsupport.cl'.toLocaleLowerCase(),
            run: '12345678-9',
            phoneNumber: '+56912345678',
            category: 'Category1',
            deletedLogic: false,
            password: bcryptjs.hashSync('123456', 10),
            image: 'path/to/image1.jpg',
            roles: ['admin', 'sheq'],
            companyId: 'cm7p8ogxg0009vdjk6gcp0h2r', // Se establecerá más adelante
        },
        {
            name: 'Sheq',
            middleName: '',
            lastName: 'Prueba',
            secondLastName: '',
            userName: 'sheq de prueba',
            displayName: 'Sheq de prueba',
            email: 'sheq@correo.com'.toLocaleLowerCase(),
            run: '87654321-0',
            phoneNumber: '+56987654321',
            category: 'Category2',
            deletedLogic: false,
            password: bcryptjs.hashSync('123456', 10),
            image: 'path/to/image2.jpg',
            roles: ['sheq'],
            companyId: 'cm7p8ogxg0009vdjk6gcp0h2r', // Se establecerá más adelante
        },
        {
            name: 'Admin Contrato',
            middleName: '',
            lastName: 'Prueba',
            secondLastName: '',
            userName: 'adminContrato de prueba',
            displayName: 'Admin Contrato de prueba',
            email: 'adminContrato@correo.com'.toLocaleLowerCase(),
            run: '11223344-5',
            phoneNumber: '+56911223344',
            category: 'Category3',
            deletedLogic: false,
            password: bcryptjs.hashSync('123456', 10),
            image: 'path/to/image3.jpg',
            roles: ['adminContractor'],
            companyId: 'cm7p8ogxg0009vdjk6gcp0h2r', // Se establecerá más adelante
        },
        {
            name: 'Usuario',
            middleName: '',
            lastName: 'Prueba',
            secondLastName: '',
            userName: 'usuario de prueba',
            displayName: 'Usuario de prueba',
            email: 'usuario@correo.com'.toLocaleLowerCase(),
            run: '55667788-9',
            phoneNumber: '+56955667788',
            category: 'Category4',
            deletedLogic: false,
            password: bcryptjs.hashSync('123456', 10),
            image: 'path/to/image4.jpg',
            roles: ['user'],
            companyId: 'cm7p8ogxg0009vdjk6gcp0h2r', // Se establecerá más adelante
        },
        {
            name: 'Imprimir',
            middleName: '',
            lastName: 'Prueba',
            secondLastName: '',
            userName: 'Imprimir de prueba',
            displayName: 'Imprimir de prueba',
            email: 'credencial@correo.com'.toLocaleLowerCase(),
            run: '99887766-5',
            phoneNumber: '+56998877665',
            category: 'Category5',
            deletedLogic: false,
            password: bcryptjs.hashSync('123456', 10),
            image: 'path/to/image5.jpg',
            roles: ['credential'],
            companyId: 'cm7p8ogxg0009vdjk6gcp0h2r', // Se establecerá más adelante
        }
    ],
    companies: [
        { name: 'RCR-Support', rut: '76.101.552-4', phone: '(094) 595-7595' },
        { name: 'Capstone Copper', rut: '77.418.580-1', phone: '(000) 000-0000' },
        { name: 'Ingeniería Civil Vicente S.A.', rut: '93.546.000-k', phone: '(022) 209-0137' },
        { name: 'Carcamo y Clunes Gestion de Riesgos', rut: '76.748.589-1', phone: '(097) 779-0642' },
        { name: 'Guiñez', rut: '78.152.850-1', phone: '(099) 324-5650' },
        // { name: 'MANTOS COPPER PLANTA', rut: '77.418.580-1', phone: '(999) 999-9999' },
        { name: 'Enaex', rut: '76.041.871-4', phone: '(976) 041-8714' },
        { name: 'EPSA', rut: '96.773.060-2', phone: '(099) 609-2847' },
        { name: 'VIGGO', rut: '76.642.320-5', phone: '(995) 342-9628' },
        { name: 'AMECO CHILE SA', rut: '96.862.140-8', phone: '(052) 220-4423' },
        { name: 'VMS Chile SA.', rut: '78.794.180-K', phone: '(055) 256-3971' },
        { name: 'Reveco & Schiaffo', rut: '76.259.779-9', phone: '(569) 902-0168' },
        { name: 'Schwager', rut: '76.145.047-6', phone: '(569) 220-5535' },
        { name: 'RV Conveyor', rut: '76.746.848-2', phone: '(569) 542-3831' },
        { name: 'FAM América Latina Maquinarias Ltda.', rut: '77.683.790-3', phone: '(562) 291-2300' },
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
