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

export interface CompanySelect{
    value: string;
    label: string;
    description: string;
    users?: CompanyUser[];
}
