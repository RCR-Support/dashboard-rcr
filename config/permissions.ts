import { PermissionsMapping } from "@/types/auth";
import { RoleEnum } from "@prisma/client";

export const permissions: PermissionsMapping = {
    '/dashboard': {
        roles: [
            RoleEnum.admin,
            RoleEnum.user,
            RoleEnum.sheq,
            RoleEnum.adminContractor,
            RoleEnum.credential
        ],
        description: 'Acceso al dashboard principal'
    },
    '/dashboard/admin': {
        roles: [RoleEnum.admin],
        description: 'Panel de Administración'
    },
    '/dashboard/users': {
        roles: [RoleEnum.admin],
        description: 'Gestión de usuarios'
    },
    '/dashboard/users/createUser': {
        roles: [RoleEnum.admin],
        description: 'Crear usuario'
    },
    '/dashboard/user': {
        roles: [RoleEnum.user, RoleEnum.user],
        description: 'Pagina vista ejemplo de  usuario'
    },
    '/dashboard/companies': {
        roles: [
            RoleEnum.admin
        ],
        description: 'Gestión de empresas'
    },

};
