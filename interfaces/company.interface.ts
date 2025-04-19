import { User } from "./user.interface";
import { Contract } from "./contract.interface";

export interface Company {
    id: string;
    name: string | null;
    rut: string;
    phone: string;
    city: string | null;
    url: string | null;
    status: boolean;
    users?: User[];
    contracts?: Contract[];
}

export interface CompanyUser {
    id: string;
    email: string;
    name: string;
    lastName: string;
    displayName: string;
    phoneNumber: string;
    roles: {
        role: {
            id: string;
            name: string;
        };
        userId: string;
        roleId: string;
    }[];
}

export interface CompanySelect {
    value: string;
    label: string;
    description: string;
    users?: Array<{
        id: string;
        displayName: string;
        email: string;
        roles: Array<{
            role: {
                name: string;
            }
        }>
    }>;
    contracts?: Array<{
        id: string;
        contractNumber: string;
        contractName: string;
        initialDate: Date;
        finalDate: Date;
        userAc?: {
            id: string;
            displayName: string;
            email: string;
        }
    }>;
    summary?: {
        totalUsers: number;
        totalContracts: number;
    };
}
