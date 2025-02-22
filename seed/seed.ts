import bcryptjs from 'bcryptjs';

interface SeedUser{
    firstName: string;
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
            firstName: 'Héctor',
            middleName: 'Javier',
            lastName: 'Matcovich',
            secondLastName: 'González',
            userName: 'Héctor Matcovich',
            displayName: 'Héctor Matcovich',
            email: 'matcovich@gmail.com',
            password: bcryptjs.hashSync('123456', 10), //    '123456',
            role: 'admin'
        },
        {
            firstName: 'Sheq',
            middleName: '',
            lastName: 'Prueba',
            secondLastName: '',
            userName: 'sheq de prueba',
            displayName: 'Sheq de prueba',
            email: 'sheq@correo.com',
            password: bcryptjs.hashSync('123456', 10), // '123456',
            role: 'sheq'
        },
        {
            firstName: 'Admin Contrato',
            middleName: '',
            lastName: 'Prueba',
            secondLastName: '',
            userName: 'adminContrato de prueba',
            displayName: 'Admin Contrato de prueba',
            email: 'adminContrato@correo.com',
            password: bcryptjs.hashSync('123456', 10), // '123456',
            role: 'adminContractor'
        },
        {
            firstName: 'Usuario',
            middleName: '',
            lastName: 'Prueba',
            secondLastName: '',
            userName: 'usuario de prueba',
            displayName: 'Usuario de prueba',
            email: 'usuario@correo.com',
            password: bcryptjs.hashSync('123456', 10), // '123456',
            role: 'user'
        },
        {
            firstName: 'Imprimir',
            middleName: '',
            lastName: 'Prueba',
            secondLastName: '',
            userName: 'Imprimir de prueba',
            displayName: 'Imprimir de prueba',
            email: 'credencial@correo.com',
            password: bcryptjs.hashSync('123456', 10), // '123456',
            role: 'credential'
        }
    ]
}
