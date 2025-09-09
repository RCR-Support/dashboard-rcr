# RCR Support - Sistema de Gestión

Este proyecto es un sistema de gestión basado en [Next.js](https://nextjs.org/) con control de roles y permisos para diferentes funcionalidades.

## Configuración Inicial

Para iniciar el servidor de desarrollo:

```bash
npm run dev
```

Para compilar el proyecto para producción:

```bash
npm run build
```

Para iniciar el servidor en modo producción:

```bash
npm run start
```

## Estructura del Proyecto

- `/app`: Páginas de la aplicación (Next.js App Router)
  - `/(auth)`: Rutas relacionadas con autenticación
  - `/(web)`: Rutas públicas del sitio
  - `/dashboard`: Panel de administración con control de acceso
  - `/api`: Endpoints de API
- `/actions`: Operaciones de servidor (Server Actions)
- `/components`: Componentes reutilizables
- `/config`: Configuraciones, incluyendo permisos
- `/context`: Contextos de React
- `/hooks`: Custom hooks
- `/interfaces`: Interfaces TypeScript
- `/lib`: Utilidades y funciones auxiliares
- `/prisma`: Schema de base de datos y migraciones
- `/public`: Archivos estáticos
- `/scripts`: Scripts utilitarios para desarrollo
- `/templates`: Plantillas para generación de código

## Sistema de Permisos

El proyecto utiliza un sistema de control de acceso basado en roles:

- **Middleware**: Verificación de permisos a nivel de servidor
- **withPermission HOC**: Control de acceso en el cliente
- **config/permissions.ts**: Configuración central de permisos

### Roles disponibles

- `admin`: Acceso completo a todas las funcionalidades
- `sheq`: Acceso a revisión y gestión de seguridad
- `adminContractor`: Administración de contratistas
- `user`: Usuario estándar con acceso limitado
- `credential`: Acceso mínimo solo para credenciales

## Herramientas para Desarrolladores

Hemos implementado varias herramientas para facilitar el desarrollo:

### Plantillas y Generadores

- **Plantilla de Componente**: `/templates/component-template.tsx`
- **Generador de Componentes**: `npm run create:component`
- **Snippets de VSCode**: `.vscode/snippets/typescript.json`

### Verificación de Código

- **Pre-commit Hook**: Verificación de documentación y permisos
  - Para omitir temporalmente: `git commit --no-verify -m "mensaje"`
- **Verificador de Permisos**: `npm run check:permissions`
- **Recordatorios**: Mensajes automáticos al iniciar el desarrollo

## Documentación

Para obtener más información sobre el desarrollo del proyecto, consulta:

- [GUIA-DESARROLLO.md](./GUIA-DESARROLLO.md): Guía completa de desarrollo
- [GUIA-DOCUMENTACION.md](./GUIA-DOCUMENTACION.md): Sistema de documentación y permisos
- [USO-APLICACION.md](./USO-APLICACION.md): Manual de uso de la aplicación

## Base de Datos

El proyecto utiliza Prisma ORM con PostgreSQL. Para aplicar migraciones:

```bash
npx prisma migrate dev
```

Para ver la base de datos con Prisma Studio:

```bash
npm run prisma:studio
```

## Documentación de Módulos

- [Módulo de Solicitudes](./docs/MODULO-SOLICITUDES.md): Sistema de solicitudes de acreditación
- [Módulo de Actividades](./docs/MODULO-ACTIVIDADES.md): Gestión de actividades

El sistema incluye un módulo completo para la gestión de actividades con las siguientes características:

### Funcionalidades

- **Listado de Actividades**: Vista en tarjetas y tabla
- **Creación/Edición de Actividades**: Formularios con validación
- **Control de acceso**: Protección basada en roles
  - `admin`: Puede crear, editar y eliminar actividades
  - `sheq`, `adminContractor`, `user`: Pueden ver actividades
  - `credential`: Sin acceso al módulo de actividades

### Archivos Principales

- `app/dashboard/activities/page.tsx`: Página principal de actividades
- `app/dashboard/activities/ActivitiesClientPage.tsx`: Componente cliente con protección
- `components/ui/dashboard/activity/CardActivity.tsx`: Vista de tarjetas
- `components/ui/dashboard/activity/TablaActivity.tsx`: Vista de tabla
- `config/permissions.ts`: Configuración de permisos para actividades

### Protección de Rutas

Todas las páginas del módulo están protegidas tanto a nivel de servidor (middleware) como de cliente (withPermission HOC).

## Contribución

Para contribuir al proyecto:

1. Asegúrate de seguir la guía de desarrollo
2. Documenta los permisos de los componentes
3. Utiliza el HOC `withPermission` para proteger las páginas
4. Actualiza `config/permissions.ts` con cualquier nueva ruta
5. Ejecuta las pruebas antes de enviar cambios
