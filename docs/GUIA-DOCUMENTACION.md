# Guía de Documentación y Permisos

Este documento explica en detalle cómo funciona el sistema de documentación y permisos implementado en el proyecto RCR Support.

## Sistema de Control de Acceso

### 1. Middleware de Protección

El middleware verifica los permisos del usuario en el servidor antes de permitir el acceso a una ruta:

```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Verificación de permisos según la ruta solicitada
  const user = getUser(); // Obtiene usuario de la sesión
  const role = user?.role;

  if (!hasPermission(pathname, role)) {
    return NextResponse.redirect(new URL('/unauthorized', request.url));
  }
}
```

### 2. HOC withPermission

El componente de orden superior `withPermission` proporciona una capa adicional de protección en el cliente:

```tsx
// components/ui/auth/withPermission.tsx
export function withPermission<P extends object>(
  WrappedComponent: ComponentType<P>,
  requiredPath: string
): ComponentType<P> {
  return function ProtectedComponent(props: P) {
    const { hasPermission } = usePermissions();
    const { selectedRole } = useRoleStore();

    if (!hasPermission(requiredPath)) {
      window.location.href = '/unauthorized';
      return null;
    }

    return <WrappedComponent {...props} />;
  };
}
```

### 3. Configuración de Permisos

Los permisos se definen en un archivo central:

```typescript
// config/permissions.ts
export const permissions: PermissionsMapping = {
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
  // ...más permisos
};
```

## Sistema de Documentación de Código

### 1. Encabezado de Documentación

Todos los componentes deben incluir un encabezado con el siguiente formato:

```tsx
/**
 * @name ComponentName
 * @description Breve descripción de la funcionalidad
 *
 * @permissions admin,sheq,adminContractor,user
 * @dependencies usePermissions, withPermission
 * @related OtherComponent, AnotherComponent
 *
 * @example
 * <ComponentName prop="value" />
 *
 * @changelog
 * - 2025-07-29: Autor - Creación inicial
 */
```

### 2. Plantillas y Generadores

#### Plantilla de Componente

Ubicada en `/templates/component-template.tsx`, proporciona una estructura base para nuevos componentes.

#### Generador de Componentes

Script interactivo (`npm run create:component`) que guía en la creación de componentes con documentación adecuada.

#### Snippets para VS Code

Snippets disponibles en `.vscode/snippets/typescript.json`:

- `rcp`: Componente React protegido
- `npcp`: Página Next.js protegida

### 3. Verificación Automática

#### Hook de Pre-commit

Verifica la documentación y permisos antes de cada commit:

```bash
# .git/hooks/pre-commit
# Muestra la lista de verificación y pide confirmación
```

#### Verificador de Permisos

Script Node.js (`npm run check:permissions`) que analiza los archivos para detectar problemas con permisos.

#### Recordatorio Visual

Script que muestra recordatorios al iniciar el desarrollo:

```bash
# Se ejecuta automáticamente con npm run dev
```

## Lista de Verificación

Al crear o modificar componentes:

1. **Documentación**: ¿Incluiste el encabezado con @permissions?
2. **Protección**: ¿Aplicaste withPermission si es necesario?
3. **Configuración**: ¿Actualizaste config/permissions.ts?
4. **Consistencia**: ¿Las rutas en withPermission coinciden con permissions.ts?
5. **Explicación**: ¿Documentaste funciones complejas?

## Cómo Aplicar en Nuevos Componentes

### Ejemplo: Creación de una Página Protegida

```tsx
// app/dashboard/nueva-ruta/page.tsx
import dynamic from 'next/dynamic';

const NuevaRutaClientPage = dynamic(() => import('./NuevaRutaClientPage'), {
  ssr: false,
});

export default async function NuevaRutaPage() {
  const data = await fetchData();
  return <NuevaRutaClientPage data={data} />;
}
```

```tsx
// app/dashboard/nueva-ruta/NuevaRutaClientPage.tsx
/**
 * @name NuevaRutaClientPage
 * @description Página para nueva funcionalidad
 *
 * @permissions admin,sheq
 * @dependencies withPermission
 */
'use client';

import { withPermission } from '@/components/ui/auth/withPermission';

function NuevaRutaClientPage({ data }) {
  return <div>{/* Contenido */}</div>;
}

const ProtectedPage = withPermission(
  NuevaRutaClientPage,
  '/dashboard/nueva-ruta'
);
export default ProtectedPage;
```

Finalmente, actualizar permisos:

```typescript
// config/permissions.ts
'/dashboard/nueva-ruta': {
  roles: [RoleEnum.admin, RoleEnum.sheq],
  description: 'Nueva funcionalidad'
},
```
