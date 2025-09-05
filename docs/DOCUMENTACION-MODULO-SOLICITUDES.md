# Documentación del Módulo de Solicitudes (Create-New-Two)

## 1. Estructura General

### 1.1 Objetivo

Implementar un módulo de solicitudes que permita a los usuarios crear, gestionar y dar seguimiento a diferentes tipos de solicitudes en el sistema.

### 1.2 Componentes Principales

- Formulario de creación de solicitudes
- Lista de solicitudes
- Vista detallada de solicitud
- Panel de gestión de estados

## 2. Estructura de Datos

### 2.1 Modelo de Solicitud (Prisma Schema)

```prisma
model Request {
  id            String      @id @default(cuid())
  title         String
  description   String
  status        RequestStatus
  type          RequestType
  priority      Priority
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt
  userId        String
  assignedTo    String?
  comments      Comment[]
  attachments   Attachment[]
  user          User        @relation(fields: [userId], references: [id])
}

enum RequestStatus {
  PENDING
  IN_REVIEW
  APPROVED
  REJECTED
  IN_PROGRESS
  COMPLETED
}

enum RequestType {
  MAINTENANCE
  SUPPORT
  ACCESS
  OTHER
}

enum Priority {
  LOW
  MEDIUM
  HIGH
  URGENT
}

model Comment {
  id          String    @id @default(cuid())
  content     String
  createdAt   DateTime  @default(now())
  requestId   String
  userId      String
  request     Request   @relation(fields: [requestId], references: [id])
  user        User      @relation(fields: [userId], references: [id])
}

model Attachment {
  id          String    @id @default(cuid())
  filename    String
  url         String
  createdAt   DateTime  @default(now())
  requestId   String
  request     Request   @relation(fields: [requestId], references: [id])
}
```

## 3. Interfaces TypeScript

### 3.1 Interfaces Principales

```typescript
interface Request {
  id: string;
  title: string;
  description: string;
  status: RequestStatus;
  type: RequestType;
  priority: Priority;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  assignedTo?: string;
  comments?: Comment[];
  attachments?: Attachment[];
  user: User;
}

interface Comment {
  id: string;
  content: string;
  createdAt: Date;
  requestId: string;
  userId: string;
  user: User;
}

interface Attachment {
  id: string;
  filename: string;
  url: string;
  createdAt: Date;
  requestId: string;
}
```

## 4. Componentes UI Necesarios

### 4.1 Formularios

- RequestForm (`components/requests/RequestForm.tsx`)
- CommentForm (`components/requests/CommentForm.tsx`)

### 4.2 Vistas

- RequestList (`app/dashboard/requests/page.tsx`)
- RequestDetail (`app/dashboard/requests/[id]/page.tsx`)
- NewRequest (`app/dashboard/requests/new/page.tsx`)

### 4.3 Componentes Compartidos

- StatusBadge (`components/ui/StatusBadge.tsx`)
- PriorityIndicator (`components/ui/PriorityIndicator.tsx`)
- AttachmentUploader (`components/ui/AttachmentUploader.tsx`)
- CommentList (`components/requests/CommentList.tsx`)

## 5. Acciones del Servidor

### 5.1 Gestión de Solicitudes

```typescript
// actions/requests/request-actions.ts
export async function createRequest(data: CreateRequestDTO);
export async function updateRequest(id: string, data: UpdateRequestDTO);
export async function deleteRequest(id: string);
export async function getRequest(id: string);
export async function getRequests(params: RequestFilterParams);
```

### 5.2 Gestión de Comentarios

```typescript
// actions/requests/comment-actions.ts
export async function addComment(requestId: string, data: CreateCommentDTO);
export async function deleteComment(id: string);
```

### 5.3 Gestión de Archivos

```typescript
// actions/requests/attachment-actions.ts
export async function uploadAttachment(requestId: string, file: File);
export async function deleteAttachment(id: string);
```

## 6. Dependencias Necesarias

### 6.1 Principales

```json
{
  "@prisma/client": "^5.x.x",
  "next": "14.x.x",
  "react": "18.x.x",
  "react-dom": "18.x.x",
  "@hookform/resolvers": "^3.x.x",
  "zod": "^3.x.x",
  "react-hook-form": "^7.x.x",
  "@radix-ui/react-dialog": "^1.x.x",
  "@radix-ui/react-select": "^1.x.x",
  "class-variance-authority": "^0.7.x",
  "clsx": "^2.x.x",
  "tailwindcss": "^3.x.x"
}
```

### 6.2 Desarrollo

```json
{
  "typescript": "^5.x.x",
  "prisma": "^5.x.x",
  "@types/react": "^18.x.x",
  "@types/node": "^20.x.x",
  "eslint": "^8.x.x",
  "prettier": "^3.x.x"
}
```

## 7. Estructura de Carpetas

```
📦 rcr-support
 ┣ 📂 actions
 ┃ ┗ 📂 requests
 ┃   ┣ 📜 request-actions.ts
 ┃   ┣ 📜 comment-actions.ts
 ┃   ┗ 📜 attachment-actions.ts
 ┣ 📂 app
 ┃ ┗ 📂 dashboard
 ┃   ┗ 📂 requests
 ┃     ┣ 📜 page.tsx
 ┃     ┣ 📜 new
 ┃     ┗ 📜 [id]
 ┣ 📂 components
 ┃ ┣ 📂 requests
 ┃ ┃ ┣ 📜 RequestForm.tsx
 ┃ ┃ ┣ 📜 CommentForm.tsx
 ┃ ┃ ┗ 📜 CommentList.tsx
 ┃ ┗ 📂 ui
 ┃   ┣ 📜 StatusBadge.tsx
 ┃   ┣ 📜 PriorityIndicator.tsx
 ┃   ┗ 📜 AttachmentUploader.tsx
 ┣ 📂 lib
 ┃ ┣ 📜 validations.ts
 ┃ ┗ 📜 utils.ts
 ┗ 📂 types
   ┗ 📜 requests.d.ts
```

## 8. Flujo de Trabajo

1. **Creación de Solicitud**
   - Usuario accede a /dashboard/requests/new
   - Completa el formulario con datos básicos
   - Opcionalmente agrega archivos adjuntos
   - Sistema asigna automáticamente estado PENDING

2. **Revisión de Solicitud**
   - Administrador/Revisor ve la solicitud en su panel
   - Puede cambiar estado, prioridad y asignar
   - Puede agregar comentarios

3. **Seguimiento**
   - Usuario puede ver estado de su solicitud
   - Recibe notificaciones de cambios
   - Puede agregar comentarios adicionales

4. **Cierre de Solicitud**
   - Solicitud marcada como COMPLETED o REJECTED
   - Se notifica al usuario del cambio
   - La solicitud permanece en historial

## 9. Consideraciones de Seguridad

1. **Autenticación**
   - Usar NextAuth.js para manejo de sesiones
   - Implementar roles: USER, ADMIN, REVIEWER

2. **Autorización**
   - Verificar permisos en cada acción del servidor
   - Filtrar solicitudes según rol del usuario

3. **Validación**
   - Usar Zod para validación de datos
   - Sanitizar entrada de usuario
   - Validar tipos de archivos permitidos

## 10. Próximos Pasos

1. Configuración inicial del proyecto
   - Instalar dependencias
   - Configurar Prisma
   - Configurar autenticación

2. Implementación de modelos de datos
   - Crear schema de Prisma
   - Generar tipos TypeScript

3. Desarrollo de componentes UI
   - Implementar formularios
   - Crear componentes compartidos

4. Implementación de acciones del servidor
   - Desarrollar endpoints
   - Agregar validaciones

5. Pruebas y documentación
   - Probar flujos principales
   - Documentar API y componentes
