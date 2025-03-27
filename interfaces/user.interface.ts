import { RoleEnum } from '@prisma/client'; // Asegúrate de que la importación sea correcta

export interface Company {
    id: string;
    name: string | null;
    rut: string;
    phone: string;
    city: string | null;
    url: string | null;
    status: boolean;
}

export interface User {
    id: string;
    name: string;
    middleName?: string | null;
    lastName: string;
    secondLastName?: string | null;
    displayName: string;
    userName: string;
    email: string;
    run: string;
    phoneNumber?: string | null;
    category?: string;
    deletedLogic: boolean | null;
    password: string | null;
    image?: string | null;
    roles: string[]; // Cambiado a un array de strings
    companyId: string | null;
    company?: Company | null;
}
