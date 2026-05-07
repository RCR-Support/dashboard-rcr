# 🔐 DOCUMENTACIÓN DE ROLES Y PERMISOS

**Fecha:** 2 de enero de 2026  
**Estado:** Actualizado con Fases 1-2 completadas  
**Versión:** 2.0

---

## 📑 ÍNDICE

1. [Roles del Sistema](#roles-del-sistema)
2. [Matriz de Permisos](#matriz-de-permisos)
3. [Flujos de Aprobación](#flujos-de-aprobación)
4. [Ejemplos de Validación](#ejemplos-de-validación)
5. [Guía de Implementación](#guía-de-implementación)

---

## 1. ROLES DEL SISTEMA

### Admin (Administrador del Sistema)

**Descripción:** Administrador con acceso total al sistema.

**Responsabilidades:**

- Gestión completa de usuarios, empresas, contratos
- Supervisión de todas las solicitudes
- Gestión de actividades del sistema
- Acceso a auditoría completa

**Permisos especiales:**

- Puede ver todas las solicitudes sin restricción
- Puede editar cualquier solicitud en cualquier estado
- Puede eliminar solicitudes
- Puede crear empresas, contratos y actividades

---

### SHEQ (Administrador de Contrato / AC)

**Descripción:** Responsable de la aprobación final de documentos de seguridad.

**Responsabilidades:**

- Revisar documentos de solicitudes asignadas
- Aprobar/rechazar documentos de seguridad
- Verificar cumplimiento normativo
- Acceso a auditoría de solicitudes

**Restricciones:**

- Solo ve solicitudes asignadas específicamente a él
- No puede crear ni editar solicitudes
- No puede eliminar nada

---

### AdminContractor (Administrador de Contrato)

**Descripción:** Administrador de contrato asignado a una empresa contratista.

**Responsabilidades:**

- Revisar documentos de solicitudes de su contrato
- Aprobar/rechazar documentos
- Gestionar usuarios de su empresa contratista
- Ver solicitudes de empresas bajo su contrato

**Restricciones:**

- Solo ve solicitudes de contratos asignados
- No puede crear solicitudes
- No puede editar solicitudes
- No puede eliminar nada

---

### User (Usuario de Empresa Contratista)

**Descripción:** Usuario de una empresa contratista que crea solicitudes.

**Responsabilidades:**

- Crear solicitudes de acreditación
- Editar solicitudes rechazadas
- Subir documentación requerida
- Ver estado de sus solicitudes

**Restricciones:**

- Solo puede ver solicitudes de su empresa
- Solo puede editar solicitudes en estado RECHAZADO
- No puede aprobar ni rechazar documentos
- No puede eliminar solicitudes

---

### Credential (Credenciales)

**Descripción:** Usuario encargado de generar credenciales físicas.

**Responsabilidades:**

- Generar credenciales de trabajadores aprobados
- Imprimir credenciales
- Gestionar credenciales activas/vencidas

**Restricciones:**

- No puede ver/editar solicitudes
- Solo acceso al módulo de credenciales

---

## 2. MATRIZ DE PERMISOS

### 2.1 Solicitudes (Applications)

| Acción      | Admin    | SHEQ         | AdminContractor | User          | Validación Adicional        |
| ----------- | -------- | ------------ | --------------- | ------------- | --------------------------- |
| Ver lista   | ✅ Todas | ✅ Asignadas | ✅ Su contrato  | ✅ Su empresa | -                           |
| Ver detalle | ✅ Todas | ✅ Asignadas | ✅ Su contrato  | ✅ Su empresa | -                           |
| Crear       | ✅       | ❌           | ❌              | ✅            | Debe tener empresa asignada |
| Editar      | ✅ Todas | ❌           | ❌              | ✅ Propias    | Solo si estado = RECHAZADO  |
| Eliminar    | ✅       | ❌           | ❌              | ❌            | -                           |

### 2.2 Documentos

| Acción        | Admin | SHEQ | AdminContractor | User | Validación Adicional                           |
| ------------- | ----- | ---- | --------------- | ---- | ---------------------------------------------- |
| Ver/Descargar | ✅    | ✅   | ✅              | ✅   | -                                              |
| Subir         | ✅    | ❌   | ❌              | ✅   | -                                              |
| Aprobar       | ✅    | ✅   | ✅              | ❌   | Solo si estado = PENDIENTE                     |
| Rechazar      | ✅    | ✅   | ✅              | ❌   | Solo si estado = PENDIENTE + razón obligatoria |

### 2.3 Empresas

| Acción    | Admin | SHEQ | AdminContractor | User |
| --------- | ----- | ---- | --------------- | ---- |
| Ver lista | ✅    | ❌   | ❌              | ❌   |
| Crear     | ✅    | ❌   | ❌              | ❌   |
| Editar    | ✅    | ❌   | ❌              | ❌   |
| Eliminar  | ✅    | ❌   | ❌              | ❌   |

### 2.4 Contratos

| Acción      | Admin    | SHEQ | AdminContractor | User |
| ----------- | -------- | ---- | --------------- | ---- |
| Ver lista   | ✅ Todos | ❌   | ✅ Asignados    | ❌   |
| Ver detalle | ✅       | ❌   | ✅ Asignados    | ❌   |
| Crear       | ✅       | ❌   | ❌              | ❌   |
| Editar      | ✅ Todos | ❌   | ✅ Asignados    | ❌   |
| Eliminar    | ✅       | ❌   | ❌              | ❌   |

### 2.5 Actividades

| Acción    | Admin | SHEQ | AdminContractor | User |
| --------- | ----- | ---- | --------------- | ---- |
| Ver lista | ✅    | ✅   | ✅              | ✅   |
| Crear     | ✅    | ❌   | ❌              | ❌   |
| Editar    | ✅    | ❌   | ❌              | ❌   |
| Eliminar  | ✅    | ❌   | ❌              | ❌   |

### 2.6 Usuarios

| Acción    | Admin | SHEQ | AdminContractor | User |
| --------- | ----- | ---- | --------------- | ---- |
| Ver lista | ✅    | ❌   | ❌              | ❌   |
| Crear     | ✅    | ❌   | ❌              | ❌   |
| Editar    | ✅    | ❌   | ❌              | ❌   |
| Eliminar  | ✅    | ❌   | ❌              | ❌   |

### 2.7 Auditoría

| Acción   | Admin | SHEQ | AdminContractor | User |
| -------- | ----- | ---- | --------------- | ---- |
| Ver logs | ✅    | ✅   | ❌              | ❌   |

---

## 3. FLUJOS DE APROBACIÓN

### 3.1 Flujo Normal: Solicitud Aprobada

```
┌─────────────────────────────────────────────────────────┐
│ FLUJO DE APROBACIÓN EXITOSO                            │
└─────────────────────────────────────────────────────────┘

1. USER (Empresa Contratista)
   │
   ├─ Crea solicitud de acreditación
   ├─ Sube documentos requeridos
   │  (certificados, exámenes, etc.)
   │
   └─→ Estado: PENDIENTE
       │
       │
2. ADMINCONTRACTOR (Administrador de Contrato)
   │
   ├─ Recibe notificación
   ├─ Revisa documentos
   ├─ Verifica cumplimiento
   │
   ├─ ✅ Aprueba todos los documentos
   │
   └─→ Pasa a SHEQ
       │
       │
3. SHEQ (Aprobación Final)
   │
   ├─ Recibe notificación
   ├─ Revisa aprobación de AC
   ├─ Verifica normativa
   │
   ├─ ✅ Aprueba solicitud completa
   │
   └─→ Estado: APROBADO
       │
       │
4. RESULTADO
   │
   └─ ✅ Trabajador puede ingresar a faena
      └─ Se puede generar credencial física
```

### 3.2 Flujo con Rechazo: Corrección y Reenvío

```
┌─────────────────────────────────────────────────────────┐
│ FLUJO CON RECHAZO Y CORRECCIÓN                         │
└─────────────────────────────────────────────────────────┘

1. USER
   │
   └─ Crea solicitud → Estado: PENDIENTE
       │
       │
2. ADMINCONTRACTOR
   │
   ├─ Revisa documentos
   │
   ├─ ❌ Rechaza documento (ej: foto borrosa)
   │     Razón: "La fotografía no es legible,
   │              por favor subir imagen de mejor calidad"
   │
   └─→ Estado: RECHAZADO
       │
       │
3. USER
   │
   ├─ Recibe notificación de rechazo
   ├─ Ve razón del rechazo
   ├─ Puede editar la solicitud (solo si RECHAZADO)
   │
   ├─ Sube nuevo documento corregido
   │
   └─→ Estado: PENDIENTE (nuevamente)
       │
       │
4. ADMINCONTRACTOR
   │
   ├─ Revisa documento corregido
   │
   ├─ ✅ Aprueba documento
   │
   └─→ Continúa flujo normal → SHEQ
```

### 3.3 Estados de una Solicitud

```
PENDIENTE
  └─ Solicitud creada, esperando revisión
     AdminContractor puede aprobar/rechazar documentos

RECHAZADO
  └─ Uno o más documentos rechazados
     User puede editar y reenviar
     AdminContractor/SHEQ pueden aprobar/rechazar

APROBADO
  └─ Todos los documentos aprobados por SHEQ
     No se puede editar (excepto Admin)
     Se puede generar credencial

ELIMINADO
  └─ Solicitud eliminada (soft delete)
     Solo Admin puede eliminar
```

---

## 4. EJEMPLOS DE VALIDACIÓN

### 4.1 Validación de Edición de Solicitud

**Escenario:** User intenta editar una solicitud

```typescript
// actions/applications/update-application.ts
export async function updateApplication(id: string, data: any) {
  const session = await auth();

  // 1️⃣ Verificar autenticación
  if (!session?.user) {
    return { error: 'No autenticado' };
  }

  // 2️⃣ Verificar permisos de acción
  const canEditAny = hasActionPermission(
    'applications:edit:any',
    session.user.roles
  );
  const canEditOwn = hasActionPermission(
    'applications:edit:own',
    session.user.roles
  );

  if (!canEditAny && !canEditOwn) {
    return { error: 'No tienes permiso para editar solicitudes' };
  }

  // 3️⃣ Obtener solicitud
  const application = await db.application.findUnique({
    where: { id },
    include: { company: true },
  });

  if (!application) {
    return { error: 'Solicitud no encontrada' };
  }

  // 4️⃣ Validar ownership (si no es admin)
  if (!canEditAny) {
    const isOwner = application.company.id === session.user.companyId;
    if (!isOwner) {
      return { error: 'No puedes editar solicitudes de otra empresa' };
    }

    // 5️⃣ Validar estado (solo RECHAZADO para users)
    if (application.status !== 'RECHAZADO') {
      return { error: 'Solo puedes editar solicitudes rechazadas' };
    }
  }

  // 6️⃣ Ejecutar actualización
  await db.application.update({
    where: { id },
    data,
  });

  return { success: true };
}
```

### 4.2 Validación de Aprobación de Documento

**Escenario:** AdminContractor aprueba un documento

```typescript
// actions/applications/approve-document.ts
export async function approveDocument(documentId: string) {
  const session = await auth();

  // 1️⃣ Verificar autenticación
  if (!session?.user) {
    return { error: 'No autenticado' };
  }

  // 2️⃣ Verificar permisos
  if (!hasActionPermission('documents:approve', session.user.roles)) {
    return { error: 'No tienes permiso para aprobar documentos' };
  }

  // 3️⃣ Obtener documento
  const document = await db.documentationFile.findUnique({
    where: { id: documentId },
  });

  if (!document) {
    return { error: 'Documento no encontrado' };
  }

  // 4️⃣ Validar estado
  if (document.approvalStatus === 'APROBADO') {
    return { error: 'El documento ya está aprobado' };
  }

  if (document.approvalStatus === 'RECHAZADO') {
    return {
      error: 'No se puede aprobar un documento rechazado, debe resubirse',
    };
  }

  // 5️⃣ Aprobar documento
  await db.documentationFile.update({
    where: { id: documentId },
    data: {
      approvalStatus: 'APROBADO',
      approvedById: session.user.id,
      approvedAt: new Date(),
    },
  });

  return { success: true };
}
```

### 4.3 Filtrado de Listados por Rol

**Escenario:** Listar solicitudes según el rol del usuario

```typescript
// actions/applications/list-applications.ts
export async function listApplications() {
  const session = await auth();

  if (!session?.user) {
    return { error: 'No autenticado' };
  }

  const userRoles = session.user.roles;

  // Construir query según permisos
  let whereClause = {};

  if (hasActionPermission('applications:view:all', userRoles)) {
    // Admin: ve todas las solicitudes
    whereClause = {};
  } else if (hasActionPermission('applications:view:assigned', userRoles)) {
    // SHEQ/AdminContractor: solo asignadas
    if (userRoles.includes(RoleEnum.sheq)) {
      whereClause = { userSheqId: session.user.id };
    }
    if (userRoles.includes(RoleEnum.adminContractor)) {
      whereClause = { userAcId: session.user.id };
    }
  } else if (hasActionPermission('applications:view:own', userRoles)) {
    // User: solo de su empresa
    whereClause = { companyId: session.user.companyId };
  } else {
    return { error: 'No tienes permiso para ver solicitudes' };
  }

  const applications = await db.application.findMany({
    where: whereClause,
    include: {
      company: true,
      contract: true,
    },
  });

  return { applications };
}
```

---

## 5. GUÍA DE IMPLEMENTACIÓN

### 5.1 Proteger una Server Action

**Pasos:**

1. Importar dependencias
2. Obtener sesión
3. Validar autenticación
4. Validar permisos con `hasActionPermission()`
5. Validar ownership si es necesario
6. Ejecutar lógica de negocio

**Template:**

```typescript
import { auth } from '@/auth';
import { hasActionPermission } from '@/config/action-permissions';

export async function myAction(params: any) {
  // 1. Obtener sesión
  const session = await auth();

  // 2. Validar autenticación
  if (!session?.user) {
    return { error: 'No autenticado' };
  }

  // 3. Validar permisos
  if (!hasActionPermission('resource:action', session.user.roles)) {
    return { error: 'Sin permisos' };
  }

  // 4. Validar ownership (si aplica)
  // ...

  // 5. Ejecutar acción
  // ...

  return { success: true };
}
```

### 5.2 Proteger Componente con Botones Condicionales

**Ejemplo:**

```tsx
'use client';
import { usePermissions } from '@/hooks/usePermissions';

export function MyComponent() {
  const { can } = usePermissions();

  return (
    <div>
      <h1>Mi Componente</h1>

      {/* Botón visible solo si tiene permiso */}
      {can('applications:create') && (
        <Button onClick={handleCreate}>Crear Solicitud</Button>
      )}

      {/* Botón de aprobar (solo SHEQ/Admin/AC) */}
      {can('documents:approve') && (
        <Button onClick={handleApprove}>Aprobar Documento</Button>
      )}

      {/* Botón de editar (condicional complejo) */}
      {(can('applications:edit:any') ||
        (can('applications:edit:own') && status === 'RECHAZADO')) && (
        <Button onClick={handleEdit}>Editar</Button>
      )}
    </div>
  );
}
```

### 5.3 Agregar Nueva Acción al Sistema

**Pasos:**

1. Agregar entrada en `config/action-permissions.ts`
2. Usar en server actions con `hasActionPermission()`
3. Usar en UI con `can()` del hook `usePermissions`

**Ejemplo: Agregar permiso para "revocar credenciales"**

```typescript
// 1. En config/action-permissions.ts
export const actionPermissions = {
  // ... permisos existentes ...

  'credentials:revoke': {
    roles: [RoleEnum.admin],
    description: 'Revocar credenciales de trabajadores'
  },
};

// 2. En server action
export async function revokeCredential(credentialId: string) {
  const session = await auth();

  if (!hasActionPermission('credentials:revoke', session.user.roles)) {
    return { error: 'Sin permisos para revocar credenciales' };
  }

  // ... lógica ...
}

// 3. En UI
function CredentialActions() {
  const { can } = usePermissions();

  return (
    <>
      {can('credentials:revoke') && (
        <Button onClick={handleRevoke}>Revocar</Button>
      )}
    </>
  );
}
```

---

## 6. TESTING

### Checklist de Testing por Rol

**Admin:**

- [ ] Puede ver todas las solicitudes
- [ ] Puede editar cualquier solicitud (cualquier estado)
- [ ] Puede eliminar solicitudes
- [ ] Puede aprobar/rechazar documentos
- [ ] Puede crear empresas, contratos, usuarios

**SHEQ:**

- [ ] Solo ve solicitudes asignadas a él
- [ ] Puede aprobar/rechazar documentos
- [ ] No puede crear/editar solicitudes
- [ ] Puede ver auditoría

**AdminContractor:**

- [ ] Solo ve solicitudes de sus contratos
- [ ] Puede aprobar/rechazar documentos
- [ ] No puede crear/editar solicitudes
- [ ] No puede ver auditoría

**User:**

- [ ] Solo ve solicitudes de su empresa
- [ ] Puede crear solicitudes
- [ ] Solo puede editar solicitudes RECHAZADAS
- [ ] No puede aprobar/rechazar documentos

---

**Fin de la documentación**

Última actualización: 2 de enero de 2026
