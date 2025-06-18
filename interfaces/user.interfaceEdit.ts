export interface UserEdit {
    id: string;
    name: string;
    lastName: string;
    middleName?: string | null;
    secondLastName?: string | null;
    userName: string;
    email: string;
    password?: string;
    run: string;
    phoneNumber: string;
    companyId: string | null;
    displayName: string;
    company: {
        id: string;
        name: string | null;
    } | null;
    roles: Array<{
        role: {
            id: string;
            name: string;
        };
        userId: string;
        roleId: string;
    }>;
    adminContractorId?: string | null;  // Cambiado para manejar null
    adminContractor?: {
        id: string;
        name: string;
        lastName: string;
        displayName: string;  // Agregado para mostrar en el select
    } | null;  // Agregado null para manejar casos donde no hay admin
    UserOnAdminContractor?: {
        adminContractor: {
            id: string;
            name: string;
            lastName: string;
            displayName: string;
        };
    } | null;
    // todo: Images
    images?: FileList;
    image?: string | null | undefined; // Ajustado para aceptar null además de undefined
}
