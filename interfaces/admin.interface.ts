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

// Interface para ver la logica de los usuarios asignados a un admin contractor y posterior eleminacion
// de los mismos
// en el caso de que el admin contractor sea eliminado

export interface AssignedUser {
    id: string;
    displayName: string;
    email: string;
    company?: {
        name: string | null;
    } | null;
}

export interface AdminContractorWithUsers {
    id: string;
    displayName: string;
    assignedUsers: AssignedUser[];
}
