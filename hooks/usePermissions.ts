'use client';
import { useSession } from 'next-auth/react';
import { permissions } from '@/config/permissions';
import { useRoleStore } from '@/store/ui/roleStore';

export const usePermissions = () => {
  const { data: session, status } = useSession();
  const selectedRole = useRoleStore(state => state.selectedRole);

  const hasPermission = (path: string) => {
    if (status === 'loading') return false;
    if (!session?.user?.roles || !selectedRole) return false;

    const routePermission = permissions[path];
    if (!routePermission) return true; // Si no hay configuración específica, permitir acceso

    return routePermission.roles.includes(selectedRole as any);
  };

  return {
    hasPermission,
    userRole: selectedRole,
    allRoles: session?.user?.roles || [],
    isLoading: status === 'loading',
  };
};
