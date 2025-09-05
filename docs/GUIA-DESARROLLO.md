# Guía de Buenas Prácticas para el Proyecto RCR-Support

## Estructura y Documentación de Componentes

### 1. Encabezado de Documentación

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
