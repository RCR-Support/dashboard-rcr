
export interface CompanySelectEdit {
    value: string;
    name: string | null;
    rut: string;
    phone: string;
    status: boolean;
    city: string | null;
    url: string | null;
    users?: Array<{
        id: string;
        name: string;
        lastName: string;
        email: string;
        roles: Array<{
            role: {
                name: string;
            };
        }>;
    }>;
}
