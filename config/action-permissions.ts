/**
 * SISTEMA DE PERMISOS GRANULARES POR ACCIÓN
 * 
 * Define qué roles pueden ejecutar qué acciones en el sistema.
 * Este archivo es la fuente de verdad para permisos a nivel de acción.
 * 
 * DIFERENCIA CON permissions.ts:
 * - permissions.ts: Controla acceso a RUTAS (URLs)
 * - action-permissions.ts: Controla acceso a ACCIONES (crear, editar, aprobar, etc.)
 * 
 * ============================================================================
 * EJEMPLOS DE USO
 * ============================================================================
 * 
 * 1. EN COMPONENTES CLIENTE (UI):
 * 
 *    import { usePermissions } from '@/hooks/usePermissions';
 * 
 *    function MyComponent() {
 *      const { can } = usePermissions();
 *      
 *      return (
 *        <>
 *          {can('applications:create') && (
 *            <Button>Crear Solicitud</Button>
 *          )}
 *          
 *          {can('documents:approve') && (
 *            <Button>Aprobar Documento</Button>
 *          )}
 *        </>
 *      );
 *    }
 * 
 * 2. EN SERVER ACTIONS:
 * 
 *    import { auth } from '@/auth';
 *    import { hasActionPermission } from '@/config/action-permissions';
 * 
 *    export async function createApplication(data: FormData) {
 *      const session = await auth();
 *      
 *      // Validar autenticación
 *      if (!session?.user) {
 *        return { error: 'No autenticado' };
 *      }
 *      
 *      // Validar permisos
 *      if (!hasActionPermission('applications:create', session.user.roles)) {
 *        return { error: 'No tienes permiso para crear solicitudes' };
 *      }
 *      
 *      // Ejecutar acción
 *      await db.application.create({ data });
 *      return { success: true };
 *    }
 * 
 * 3. VERIFICAR SI UN ROL TIENE PERMISO:
 * 
 *    import { roleHasPermission } from '@/config/action-permissions';
 *    import { RoleEnum } from '@prisma/client';
 * 
 *    const canCreate = roleHasPermission('applications:create', RoleEnum.user);
 *    // Retorna: true
 * 
 * 4. OBTENER ROLES PERMITIDOS PARA UNA ACCIÓN:
 * 
 *    import { getAllowedRoles } from '@/config/action-permissions';
 * 
 *    const roles = getAllowedRoles('applications:create');
 *    // Retorna: [RoleEnum.user]
 * 
 * ============================================================================
 * CONVENCIONES DE NOMENCLATURA
 * ============================================================================
 * 
 * Formato: 'recurso:acción:alcance'
 * 
 * Ejemplos:
 * - applications:view:all      → Ver todas las solicitudes
 * - applications:view:own      → Ver solo solicitudes propias
 * - applications:edit:any      → Editar cualquier solicitud
 * - applications:edit:own      → Editar solo solicitudes propias
 * - documents:approve          → Aprobar documentos
 * 
 * Acciones comunes:
 * - view    → Ver/leer recursos
 * - create  → Crear nuevos recursos
 * - edit    → Modificar recursos existentes
 * - delete  → Eliminar recursos
 * - approve → Aprobar recursos
 * - reject  → Rechazar recursos
 * 
 * Alcances comunes:
 * - all      → Todos los recursos del sistema
 * - own      → Solo recursos propios
 * - assigned → Solo recursos asignados al usuario
 * - any      → Cualquier recurso (sin restricciones)
 * 
 * ============================================================================
 */

import { RoleEnum } from '@prisma/client';

export type ActionPermission = {
  roles: RoleEnum[];
  description: string;
};

/**
 * Mapa de acciones → roles permitidos
 */
export const actionPermissions: Record<string, ActionPermission> = {
  // ========================================
  // SOLICITUDES - Ver
  // ========================================
  'applications:view:all': {
    roles: [RoleEnum.admin],
    description: 'Ver todas las solicitudes del sistema',
  },
  'applications:view:assigned': {
    roles: [RoleEnum.sheq, RoleEnum.adminContractor],
    description: 'Ver solicitudes asignadas (SHEQ y AdminContractor solo ven las que se les asignaron)',
  },
  'applications:view:own': {
    roles: [RoleEnum.user],
    description: 'Ver solicitudes de su propia empresa (solo para empresas contratistas)',
  },

  // ========================================
  // SOLICITUDES - Crear
  // ========================================
  'applications:create': {
    roles: [RoleEnum.admin, RoleEnum.user],
    description: 'Crear nueva solicitud (admin y usuarios de empresas contratistas)',
  },

  // ========================================
  // SOLICITUDES - Editar
  // ========================================
  'applications:edit:any': {
    roles: [RoleEnum.admin],
    description: 'Editar cualquier solicitud sin restricciones',
  },
  'applications:edit:own': {
    roles: [RoleEnum.user],
    description: 'Editar solicitudes propias (requiere validación de ownership y estado RECHAZADO)',
  },

  // ========================================
  // SOLICITUDES - Eliminar
  // ========================================
  'applications:delete': {
    roles: [RoleEnum.admin],
    description: 'Eliminar solicitudes (solo admin)',
  },

  // ========================================
  // DOCUMENTOS - Aprobar/Rechazar
  // ========================================
  'documents:review': {
    roles: [RoleEnum.admin, RoleEnum.sheq, RoleEnum.adminContractor],
    description: 'Revisar documentos (aprobar o rechazar)',
  },
  'documents:approve': {
    roles: [RoleEnum.admin, RoleEnum.sheq, RoleEnum.adminContractor],
    description: 'Aprobar documentos (requiere validación de estado PENDIENTE)',
  },
  'documents:reject': {
    roles: [RoleEnum.admin, RoleEnum.sheq, RoleEnum.adminContractor],
    description: 'Rechazar documentos (requiere validación de estado PENDIENTE)',
  },

  // ========================================
  // AUDITORÍA
  // ========================================
  'audit:view': {
    roles: [RoleEnum.admin, RoleEnum.sheq],
    description: 'Ver historial de auditoría de solicitudes',
  },

  // ========================================
  // ACTIVIDADES
  // ========================================
  'activities:view': {
    roles: [RoleEnum.admin, RoleEnum.sheq, RoleEnum.adminContractor, RoleEnum.user],
    description: 'Ver actividades del sistema',
  },
  'activities:create': {
    roles: [RoleEnum.admin],
    description: 'Crear nuevas actividades',
  },
  'activities:edit': {
    roles: [RoleEnum.admin],
    description: 'Editar actividades existentes',
  },
  'activities:delete': {
    roles: [RoleEnum.admin],
    description: 'Eliminar actividades',
  },

  // ========================================
  // EMPRESAS
  // ========================================
  'companies:view:all': {
    roles: [RoleEnum.admin],
    description: 'Ver todas las empresas del sistema (solo admin)',
  },
  'companies:view:own': {
    roles: [RoleEnum.user],
    description: 'Ver la empresa propia del usuario autenticado',
  },
  'companies:create': {
    roles: [RoleEnum.admin],
    description: 'Crear nuevas empresas',
  },
  'companies:edit:any': {
    roles: [RoleEnum.admin],
    description: 'Editar cualquier empresa',
  },
  'companies:edit:own': {
    roles: [RoleEnum.user],
    description: 'Editar la empresa propia del usuario autenticado',
  },
  'companies:delete': {
    roles: [RoleEnum.admin],
    description: 'Eliminar empresas',
  },

  // ========================================
  // CONTRATOS
  // ========================================
  'contracts:view:all': {
    roles: [RoleEnum.admin],
    description: 'Ver todos los contratos del sistema',
  },
  'contracts:view:assigned': {
    roles: [RoleEnum.adminContractor],
    description: 'Ver contratos asignados como administrador',
  },
  'contracts:create': {
    roles: [RoleEnum.admin],
    description: 'Crear nuevos contratos',
  },
  'contracts:edit:any': {
    roles: [RoleEnum.admin],
    description: 'Editar cualquier contrato',
  },
  'contracts:edit:assigned': {
    roles: [RoleEnum.adminContractor],
    description: 'Editar contratos asignados',
  },
  'contracts:delete': {
    roles: [RoleEnum.admin],
    description: 'Eliminar contratos',
  },

  // ========================================
  // USUARIOS
  // ========================================
  'users:view:all': {
    roles: [RoleEnum.admin],
    description: 'Ver todos los usuarios del sistema',
  },
  'users:edit:any': {
    roles: [RoleEnum.admin],
    description: 'Editar cualquier usuario (incluye cambiar empresa)',
  },
  'users:create': {
    roles: [RoleEnum.admin],
    description: 'Crear nuevos usuarios',
  },
  'users:delete': {
    roles: [RoleEnum.admin],
    description: 'Eliminar usuarios',
  },

  // ========================================
  // CREDENCIALES (rol credential)
  // ========================================
  'credentials:view:approved': {
    roles: [RoleEnum.credential, RoleEnum.admin, RoleEnum.user],
    description: 'Ver solicitudes aprobadas para generar credenciales',
  },
  'credentials:print': {
    roles: [RoleEnum.credential, RoleEnum.admin, RoleEnum.user],
    description: 'Imprimir/generar credenciales físicas',
  },

  // ========================================
  // ARCHIVOS
  // ========================================
  'files:upload': {
    roles: [RoleEnum.admin, RoleEnum.user, RoleEnum.sheq, RoleEnum.adminContractor],
    description: 'Subir archivos al sistema',
  },
};

/**
 * Verifica si un conjunto de roles tiene permiso para ejecutar una acción
 * 
 * @param action - Nombre de la acción (ej: 'applications:create')
 * @param userRoles - Array de roles del usuario
 * @returns true si tiene permiso, false si no
 */
export function hasActionPermission(
  action: string,
  userRoles: RoleEnum[]
): boolean {
  const permission = actionPermissions[action];

  if (!permission) {
    // Si la acción no existe en la configuración, denegar por defecto
    if (process.env.NODE_ENV === 'development') {
      console.warn(`⚠️ Acción sin configuración de permisos: ${action}`);
    }
    return false;
  }

  // Verificar si alguno de los roles del usuario está en la lista de roles permitidos
  return permission.roles.some(allowedRole => userRoles.includes(allowedRole));
}

/**
 * Obtiene la lista de roles permitidos para una acción
 * 
 * @param action - Nombre de la acción
 * @returns Array de roles permitidos o null si la acción no existe
 */
export function getAllowedRoles(action: string): RoleEnum[] | null {
  const permission = actionPermissions[action];
  return permission ? permission.roles : null;
}

/**
 * Verifica si un rol específico tiene permiso para una acción
 * 
 * @param action - Nombre de la acción
 * @param role - Rol a verificar
 * @returns true si el rol tiene permiso, false si no
 */
export function roleHasPermission(action: string, role: RoleEnum): boolean {
  const permission = actionPermissions[action];
  if (!permission) return false;
  return permission.roles.includes(role);
}
