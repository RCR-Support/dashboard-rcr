'use client';
import { useSession } from 'next-auth/react';
import { permissions } from '@/config/permissions';
import { useRoleStore } from '@/store/ui/roleStore';
import { hasActionPermission } from '@/config/action-permissions';
import { RoleEnum } from '@prisma/client';

export const usePermissions = () => {
  const { data: session, status } = useSession();
  const selectedRole = useRoleStore(state => state.selectedRole);

  const hasPermission = (path: string) => {
    if (status === 'loading') return false;
    if (!session?.user?.roles || !selectedRole) return false;

    const routePermission = permissions[path];
    
    // ⚠️ CAMBIO CRÍTICO: Default seguro - denegar si no hay configuración
    if (!routePermission) {
      if (process.env.NODE_ENV === 'development') {
        console.warn(`⚠️ Ruta sin configuración de permisos: ${path}`);
      }
      return false; // ✅ Default seguro
    }

    return routePermission.roles.includes(selectedRole as any);
  };

  /**
   * Verifica si el usuario tiene permiso para ejecutar una acción específica
   * Usa el nuevo sistema de permisos granulares
   * 
   * @param action - Nombre de la acción (ej: 'applications:create')
   * @returns true si tiene permiso, false si no
   */
  const can = (action: string): boolean => {
    if (status === 'loading') return false;
    if (!session?.user?.roles) return false;

    return hasActionPermission(action, session.user.roles as RoleEnum[]);
  };

  return {
    hasPermission,
    can, // ✅ Nueva función para permisos de acción
    userRole: selectedRole,
    allRoles: session?.user?.roles || [],
    isLoading: status === 'loading',
  };
};
