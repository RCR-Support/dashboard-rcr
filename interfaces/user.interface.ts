// user.interface.ts
export interface Company {
    id: string;
    name: string | null;
    rut: string;
    phone: string;
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
    role: string;
    companyId: string | null;
    company?: Company | null;
}
