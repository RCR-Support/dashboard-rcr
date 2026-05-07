import { PermissionsMapping } from '@/types/auth';
import { RoleEnum } from '@prisma/client';

export const permissions: PermissionsMapping = {
  '/dashboard': {
    roles: [
      RoleEnum.admin,
      RoleEnum.user,
      RoleEnum.sheq,
      RoleEnum.adminContractor,
      RoleEnum.credential,
    ],
    description: 'Acceso al dashboard principal',
  },
  '/dashboard/admin': {
    roles: [RoleEnum.admin],
    description: 'Panel de Administración',
  },
  '/dashboard/admin/roles-permissions': {
    roles: [RoleEnum.admin],
    description: 'Gestión de Roles y Permisos',
  },
  '/dashboard/users': {
    roles: [RoleEnum.admin],
    description: 'Gestión de usuarios',
  },
  '/dashboard/users/edit': {
    roles: [RoleEnum.admin],
    description: 'Editar usuario',
  },
  '/dashboard/users/createUser': {
    roles: [RoleEnum.admin],
    description: 'Crear usuario',
  },
  '/dashboard/user': {
    roles: [RoleEnum.user],
    description: 'Pagina vista ejemplo de  usuario',
  },
  '/dashboard/companies': {
    roles: [RoleEnum.admin],
    description: 'Gestión de empresas',
  },
  '/dashboard/companies/createCompany': {
    roles: [RoleEnum.admin],
    description: 'Crear empresa',
  },
  '/dashboard/companies/edit': {
    roles: [RoleEnum.admin, RoleEnum.user],
    description: 'Editar empresa',
  },
  '/dashboard/contracts': {
    roles: [RoleEnum.admin, RoleEnum.adminContractor],
    description: 'Gestión de contratos',
  },
  '/dashboard/activities': {
    roles: [
      RoleEnum.admin,
      RoleEnum.user,
      RoleEnum.sheq,
      RoleEnum.adminContractor,
    ],
    description: 'Gestión de actividades',
  },
  '/dashboard/activities/createActivity': {
    roles: [RoleEnum.admin],
    description: 'Crear actividad',
  },
  '/dashboard/activities/edit': {
    roles: [RoleEnum.admin],
    description: 'Editar actividad',
  },
  '/dashboard/documentations': {
    roles: [
      RoleEnum.admin,
      RoleEnum.user,
      RoleEnum.sheq,
      RoleEnum.adminContractor,
    ],
    description: 'Ver documentaciones',
  },
  '/dashboard/documentations/create': {
    roles: [RoleEnum.admin],
    description: 'Crear documentación',
  },
  '/dashboard/documentations/activity-matrix': {
    roles: [
      RoleEnum.admin,
      RoleEnum.user,
      RoleEnum.sheq,
      RoleEnum.adminContractor,
    ],
    description: 'Ver matriz de actividades y documentos',
  },
  '/dashboard/applications': {
    roles: [
      RoleEnum.admin,
      RoleEnum.user,
      RoleEnum.sheq,
      RoleEnum.adminContractor,
      RoleEnum.credential,
    ],
    description: 'Gestión de solicitudes',
  },
  '/dashboard/applications/create': {
    roles: [RoleEnum.admin, RoleEnum.user],
    description: 'Crear solicitud',
  },
  // Rutas dinámicas (usadas por matchDynamicRoute en middleware)
  '/dashboard/applications/detail': {
    roles: [
      RoleEnum.admin,
      RoleEnum.sheq,
      RoleEnum.adminContractor,
      RoleEnum.user,
      RoleEnum.credential,
    ],
    description: 'Ver detalle de solicitud',
  },
  '/dashboard/applications/edit': {
    roles: [RoleEnum.admin, RoleEnum.user],
    description: 'Editar solicitud',
  },
  '/dashboard/contracts/detail': {
    roles: [RoleEnum.admin, RoleEnum.adminContractor],
    description: 'Ver detalle de contrato',
  },
  '/dashboard/contracts/edit': {
    roles: [RoleEnum.admin, RoleEnum.adminContractor],
    description: 'Editar contrato',
  },
  '/dashboard/users/detail': {
    roles: [RoleEnum.admin],
    description: 'Ver detalle de usuario',
  },
  '/dashboard/companies/detail': {
    roles: [RoleEnum.admin],
    description: 'Ver detalle de empresa',
  },
  '/dashboard/credentials': {
    roles: [RoleEnum.credential, RoleEnum.admin],
    description: 'Listado de credenciales por imprimir',
  },
  '/dashboard/credentials/detail': {
    roles: [RoleEnum.credential, RoleEnum.admin],
    description: 'Detalle e impresión de credencial',
  },
  '/print/credential/detail': {
    roles: [RoleEnum.credential, RoleEnum.admin, RoleEnum.user],
    description: 'Página de impresión optimizada para máquinas de credenciales',
  },
};
