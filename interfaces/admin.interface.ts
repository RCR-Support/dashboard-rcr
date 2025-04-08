export interface AdminOption {
    value: string;
    label: string;
    description?: string;
    companyId?: string;
}

export interface AdminData {
    id: string;
    name: string;
    lastName: string;
    adminContractorId?: string;  // Agregamos para mantener consistencia con Prisma
    company?: {
        name: string | null;
    } | null;
}

export interface AdminResponse {
    ok: boolean;
    admins?: AdminOption[];  // Cambiado de AdminData[] a AdminOption[]
    message?: string;
}
