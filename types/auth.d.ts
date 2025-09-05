import { RoleEnum } from '@prisma/client';

export interface RoutePermission {
  roles: RoleEnum[];
  description: string;
}

export interface PermissionsMapping {
  [path: string]: RoutePermission;
}
