# Guía de Buenas Prácticas para el Proyecto RCR-Support

## Estructura y Documentación de Componentes

### 1. Componentes de Interfaz Reutilizables

#### ViewButtons

Un componente para alternar entre vistas de tarjetas y tabla.

```tsx
// Uso
import { CardViewButton, TableViewButton } from './ViewButtons';

// En tu componente
<div className="flex gap-4 items-center">
  <CardViewButton currentView={view} onToggle={toggleView} />
  <TableViewButton currentView={view} onToggle={toggleView} />
</div>;
```

**Características:**

- Tooltips integrados para mejor UX
- Estado activo con color personalizado
- Integración con parámetros de URL
- Consistente con el diseño del sistema

**Configuración requerida:**

- Importar tipos desde interfaces.ts
- Definir constantes de colores en interfaces.ts
- Configurar el enrutamiento con searchParams

#### Implementación de Vistas Duales

Para implementar vistas duales (tarjetas/tabla):

1. Definir tipos en interfaces.ts:

```typescript
export type ViewType = 'cards' | 'table';
export const VIEW_TYPES = {
  CARDS: 'cards' as ViewType,
  TABLE: 'table' as ViewType,
};
```

2. Usar searchParams para persistencia:

```typescript
const view = searchParams?.get('view') || VIEW_TYPES.CARDS;
```

3. Implementar el toggle:

```typescript
const toggleView = (newView: ViewType) => {
  const params = new URLSearchParams(searchParams?.toString());
  params.set('view', newView);
  router.push(`?${params.toString()}`, { scroll: false });
};
```

### 2. Encabezado de Documentación

Todos los componentes y páginas deben incluir un encabezado de documentación con el siguiente formato:

```tsx
/**
 * @name ComponentName
 * @description Breve descripción de la funcionalidad
 *
 * @permissions Lista de roles que pueden acceder
 * @dependencies Dependencias importantes
 * @related Componentes relacionados
 *
 * @example
 * // Ejemplo de uso
 *
 * @changelog
 * - Fecha: Autor - Cambio
 */
```

### 2. Protección de Componentes y Rutas

#### Componentes del lado del cliente

Todos los componentes que representan páginas deben estar protegidos con el HOC `withPermission`:

```tsx
const ProtectedComponent = withPermission(Component, '/ruta/a/proteger');
export default ProtectedComponent;
```

#### Definición de Permisos

Cada nueva ruta debe tener su correspondiente entrada en el archivo de permisos:

```typescript
// config/permissions.ts
'/dashboard/nueva-ruta': {
  roles: [RoleEnum.admin, RoleEnum.user],
  description: 'Descripción de la página'
}
```

### 3. Estructura de Carpetas

- **Páginas**: `/app/dashboard/[feature]/page.tsx`
- **Componentes Cliente**: `/app/dashboard/[feature]/[Feature]ClientPage.tsx`
- **Componentes UI**: `/components/ui/dashboard/[feature]/[ComponentName].tsx`
- **Acciones**: `/actions/[feature]/[action-name].ts`

### 4. Lista de Verificación al Crear Nuevos Componentes

✅ Documentación completa en el encabezado
✅ Protección con `withPermission` si es necesario
✅ Definición de permisos en `config/permissions.ts`
✅ Prueba de acceso con diferentes roles
✅ Verificación de acceso directo por URL

## Recursos

- **Plantillas**: Usar las plantillas en `/templates`
- **Scripts**: Usar los scripts de generación en `/scripts`
- **Snippets**: Usar los snippets de VS Code disponibles (prefijos: `rcp`, `npcp`)

## Proceso de Revisión

Antes de solicitar revisión de código, asegúrate de que:

1. La documentación está completa
2. Los permisos están correctamente configurados
3. Has probado el acceso con todos los roles relevantes
4. Has verificado el acceso directo por URL
