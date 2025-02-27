import bcryptjs from 'bcryptjs';

interface SeedUser{
    name: string;
    middleName?: string;
    lastName: string;
    secondLastName?: string;
    userName: string;
    displayName: string;
    email: string;
    password: string;
    role: 'admin'| 'sheq' | 'adminContractor' | 'user' | 'credential';
}

interface SeedData{
    users: SeedUser[];
}

export const initialData : SeedData = {
    users: [
        {
            name: 'Héctor',
            middleName: 'Javier',
            lastName: 'Matcovich',
            secondLastName: 'González',
            userName: 'Héctor Matcovich',
            displayName: 'Héctor Matcovich',
            email: 'matcovich@gmail.com'.toLocaleLowerCase(),
            password: bcryptjs.hashSync('123456', 10), //    '123456',
            role: 'admin'
        },
        {
            name: 'Sheq',
            middleName: '',
            lastName: 'Prueba',
            secondLastName: '',
            userName: 'sheq de prueba',
            displayName: 'Sheq de prueba',
            email: 'sheq@correo.com'.toLocaleLowerCase(),
            password: bcryptjs.hashSync('123456', 10), // '123456',
            role: 'sheq'
        },
        {
            name: 'Admin Contrato',
            middleName: '',
            lastName: 'Prueba',
            secondLastName: '',
            userName: 'adminContrato de prueba',
            displayName: 'Admin Contrato de prueba',
            email: 'adminContrato@correo.com'.toLocaleLowerCase(),
            password: bcryptjs.hashSync('123456', 10), // '123456',
            role: 'adminContractor'
        },
        {
            name: 'Usuario',
            middleName: '',
            lastName: 'Prueba',
            secondLastName: '',
            userName: 'usuario de prueba',
            displayName: 'Usuario de prueba',
            email: 'usuario@correo.com'.toLocaleLowerCase(),
            password: bcryptjs.hashSync('123456', 10), // '123456',
            role: 'user'
        },
        {
            name: 'Imprimir',
            middleName: '',
            lastName: 'Prueba',
            secondLastName: '',
            userName: 'Imprimir de prueba',
            displayName: 'Imprimir de prueba',
            email: 'credencial@correo.com'.toLocaleLowerCase(),
            password: bcryptjs.hashSync('123456', 10), // '123456',
            role: 'credential'
        }
    ]
}
