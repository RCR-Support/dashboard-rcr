import bcryptjs from 'bcryptjs';

interface SeedUser{
    name: string;
    email: string;
    password: string;
    role: 'admin' | 'user';
}

interface SeedData{
    users: SeedUser[];
}

export const initialData : SeedData = {
    users: [
        {
            name: 'Héctor Matcovich',
            email: 'matcovich@gmail.com',
            password: bcryptjs.hashSync('123456', 10), //    '123456',
            role: 'admin'
        },
        {
            name: 'Usuario Prueba',
            email: 'usuario@correo.com',
            password: bcryptjs.hashSync('123456', 10), // '123456',
            role: 'user'
        },
    ]
}
