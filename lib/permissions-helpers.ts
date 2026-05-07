/**
 * PERMISSIONS HELPERS
 * 
 * Utilidades para manejo de permisos y rutas dinámicas.
 * Creado: 2 Enero 2026
 */

/**
 * Mapeo de rutas dinámicas a sus claves de permiso.
 * 
 * Las rutas con :id se convierten a regex para matching flexible.
 * 
 * Ejemplos:
 * - /dashboard/activities/edit/123 → /dashboard/activities/edit
 * - /dashboard/applications/abc/edit → /dashboard/applications/edit
 * - /dashboard/contracts/xyz → /dashboard/contracts
 */
export const dynamicRoutePatterns: Record<string, string> = {
  // Actividades
  '/dashboard/activities/edit/:id': '/dashboard/activities/edit',
  
  // Solicitudes (Applications)
  '/dashboard/applications/:id': '/dashboard/applications/detail',
  '/dashboard/applications/:id/edit': '/dashboard/applications/edit',
  
  // Contratos
  '/dashboard/contracts/:id': '/dashboard/contracts/detail',
  '/dashboard/contracts/:id/edit': '/dashboard/contracts/edit',
  
  // Usuarios
  '/dashboard/users/:id': '/dashboard/users/detail',
  '/dashboard/users/:id/edit': '/dashboard/users/edit',
  
  // Empresas
  '/dashboard/companies/:id': '/dashboard/companies/detail',
  '/dashboard/companies/:id/edit': '/dashboard/companies/edit',

  // Impresión de credenciales
  '/print/credential/:id': '/print/credential/detail',
};

/**
 * Busca coincidencias de rutas dinámicas y retorna la clave de permiso.
 * 
 * @param path - Ruta actual (ej: /dashboard/activities/edit/123)
 * @returns Clave de permiso si hay match, null si no hay coincidencia
 * 
 * @example
 * matchDynamicRoute('/dashboard/activities/edit/123')
 * // Retorna: '/dashboard/activities/edit'
 * 
 * matchDynamicRoute('/dashboard/unknown/path')
 * // Retorna: null
 */
export function matchDynamicRoute(path: string): string | null {
  for (const [pattern, permissionKey] of Object.entries(dynamicRoutePatterns)) {
    // Convertir patrón con :id a regex
    // Ejemplo: /dashboard/activities/edit/:id → /^\/dashboard\/activities\/edit\/[^/]+$/
    const regexPattern = '^' + pattern.replace(/:\w+/g, '[^/]+') + '$';
    const regex = new RegExp(regexPattern);
    
    if (regex.test(path)) {
      return permissionKey;
    }
  }
  
  return null;
}

/**
 * Extrae el ID de una ruta dinámica.
 * 
 * @param path - Ruta con ID (ej: /dashboard/applications/abc123/edit)
 * @returns ID extraído o null si no se encuentra
 * 
 * @example
 * extractRouteId('/dashboard/applications/abc123/edit')
 * // Retorna: 'abc123'
 * 
 * extractRouteId('/dashboard/activities/edit/12345')
 * // Retorna: '12345'
 */
export function extractRouteId(path: string): string | null {
  // Buscar patrones comunes de IDs en rutas
  const patterns = [
    /\/([a-zA-Z0-9_-]+)\/edit$/,  // /resource/:id/edit
    /\/([a-zA-Z0-9_-]+)$/,         // /resource/:id
  ];
  
  for (const pattern of patterns) {
    const match = path.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  
  return null;
}

/**
 * Verifica si una ruta es dinámica (contiene segmentos variables).
 * 
 * @param path - Ruta a verificar
 * @returns true si es dinámica, false si es estática
 * 
 * @example
 * isDynamicRoute('/dashboard/applications/abc123')
 * // Retorna: true
 * 
 * isDynamicRoute('/dashboard/applications')
 * // Retorna: false
 */
export function isDynamicRoute(path: string): boolean {
  return matchDynamicRoute(path) !== null;
}

/**
 * Helpers para verificación de ownership (recursos propios).
 * 
 * Estos helpers se pueden usar en middleware o server actions
 * para validar que un usuario tenga acceso a un recurso específico.
 */

/**
 * Tipo para funciones de verificación de ownership.
 */
export type OwnershipChecker = (
  userId: string,
  resourceId: string
) => Promise<boolean>;

/**
 * Registro de checkers de ownership por tipo de recurso.
 * 
 * Los server actions pueden registrar sus propios checkers aquí
 * para validación centralizada.
 */
export const ownershipCheckers: Record<string, OwnershipChecker> = {};

/**
 * Registra un checker de ownership para un tipo de recurso.
 * 
 * @param resourceType - Tipo de recurso (ej: 'application', 'contract')
 * @param checker - Función que verifica ownership
 * 
 * @example
 * registerOwnershipChecker('application', async (userId, appId) => {
 *   const app = await db.application.findUnique({
 *     where: { id: appId },
 *     select: { company: { select: { id: true }}}
 *   });
 *   const user = await db.user.findUnique({
 *     where: { id: userId },
 *     select: { companyId: true }
 *   });
 *   return app?.company?.id === user?.companyId;
 * });
 */
export function registerOwnershipChecker(
  resourceType: string,
  checker: OwnershipChecker
): void {
  ownershipCheckers[resourceType] = checker;
}

/**
 * Verifica ownership de un recurso.
 * 
 * @param resourceType - Tipo de recurso
 * @param userId - ID del usuario
 * @param resourceId - ID del recurso
 * @returns true si el usuario es dueño del recurso, false si no
 * 
 * @example
 * const canEdit = await checkOwnership('application', userId, applicationId);
 */
export async function checkOwnership(
  resourceType: string,
  userId: string,
  resourceId: string
): Promise<boolean> {
  const checker = ownershipCheckers[resourceType];
  
  if (!checker) {
    if (process.env.NODE_ENV === 'development') {
      console.warn(`⚠️ No hay checker de ownership para: ${resourceType}`);
    }
    return false;
  }
  
  return await checker(userId, resourceId);
}
