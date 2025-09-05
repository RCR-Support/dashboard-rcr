# Análisis del Modelo Application y QR

## 1. Modelo Principal (application)

### 1.1 Estructura Completa

```prisma
model application {
  // Identificador
  id                 String              @id @default(cuid())

  // Datos del trabajador
  workerName         String
  workerPaternal     String
  workerMaternal     String
  workerRun          String
  displayWorkerName  String

  // Licencia
  license            License?
  licenseExpiration  DateTime?

  // Estados y Control
  status             Status              @default(primeraVez)
  stateAc            StateAc
  stateSheq          StateSheq
  lastReviewedAt     DateTime?
  reviewDeadline     DateTime?

  // Timestamps
  createdAt          DateTime            @default(now())
  updatedAt          DateTime            @updatedAt

  // Relaciones principales
  companyId          String?
  company            Company?            @relation(fields: [companyId], references: [id])
  contractId         String?
  contract           Contract?           @relation(fields: [contractId], references: [id])

  // Usuarios relacionados
  userId             String?
  user               User?               @relation("UserApplications", fields: [userId], references: [id])
  userAcId           String?
  userAc             User?               @relation("AdminContractorApplications", fields: [userAcId], references: [id])
  userSheqId         String?
  userSheq           User?               @relation("SheqApplications", fields: [userSheqId], references: [id])

  // Relaciones con actividades y zonas
  activities         Activity[]          @relation("ActivityApplications")
  zones              Zone[]              @relation("ZoneApplications")

  // Documentación y QR
  documentationFiles DocumentationFile[]
  qr                 ApplicationQR?

  // Auditoría
  audits             ApplicationAudit[]

  // Índices de optimización
  @@index([stateAc, userAcId], name: "idx_ac_review")
  @@index([stateSheq, userSheqId], name: "idx_sheq_review")
  @@index([workerRun], name: "idx_worker_run")
  @@index([companyId, status], name: "idx_company_status")
  @@index([contractId, createdAt], name: "idx_contract_date")
}
```

### 1.2 Modelo QR Actual

```prisma
model ApplicationQR {
  id            String      @id @default(cuid())
  applicationId String      @unique
  token         String      @unique @default(cuid()) // Token único para acceso público
  createdAt     DateTime    @default(now())
  expiresAt     DateTime?   // Fecha de expiración del QR
  isActive      Boolean     @default(true)
  application   application @relation(fields: [applicationId], references: [id], onDelete: Cascade)

  @@index([token])
}
```

### 1.3 Modelo de Auditoría

```prisma
model ApplicationAudit {
  id            String      @id @default(cuid())
  applicationId String
  action        AuditAction
  changedById   String
  changedAt     DateTime    @default(now())
  details       String?
  application   application @relation(fields: [applicationId], references: [id])
  changedBy     User        @relation("UserApplicationAudits", fields: [changedById], references: [id])
}

enum AuditAction {
  CREACION
  EDICION
  APROBACION
  RECHAZO
  OBSERVACION
  ELIMINACION
}
```

### 1.4 Documentación de Archivos

```prisma
model DocumentationFile {
  id              String         @id @default(cuid())
  applicationId   String
  activityId      String?
  documentationId String?
  url             String
  type            FileType
  uploadedAt      DateTime       @default(now())
  application     application    @relation(fields: [applicationId], references: [id])
  activity        Activity?      @relation(fields: [activityId], references: [id])
  documentation   Documentation? @relation(fields: [documentationId], references: [id])

  @@index([applicationId, activityId, documentationId])
}

enum FileType {
  PDF
  IMG
  DOC
  OTHER
}
```

## 2. Validaciones y Estados

### 2.1 Validación de RUN

```typescript
// Implementar en lib/validations.ts
export const validateRun = (run: string): boolean => {
  // Implementar validación según fórmula existente
  // Revisar implementación actual en utils
};
```

### 2.2 Validación de Documentos

```typescript
// Implementar en lib/validations.ts
export const validatePDF = async (file: File): Promise<ValidationResult> => {
  const validations = {
    format: file.type === 'application/pdf',
    size: file.size <= MAX_FILE_SIZE, // Definir tamaño máximo
    pages: (await countPDFPages(file)) <= 3,
  };

  return {
    isValid: Object.values(validations).every(Boolean),
    errors: Object.entries(validations)
      .filter(([_, valid]) => !valid)
      .map(([key]) => key),
  };
};
```

## 3. Índices Recomendados

### 2.1 Estados Principales

```typescript
enum Status {
  primeraVez
  renovacion
}

enum StateAc {
  aprobado
  pendiente
  adjuntar
}

enum StateSheq {
  aprobado
  pendiente
  rechazado
}

enum License {
  a1
  a2
  a3
  a4
  a5
  b
  c
  d
}
```

### 2.2 Índices Implementados

```prisma
// Índices de Application
@@index([stateAc, userAcId], name: "idx_ac_review")     // Optimiza búsqueda de solicitudes por AdminContractor
@@index([stateSheq, userSheqId], name: "idx_sheq_review") // Optimiza búsqueda de solicitudes por SHEQ
@@index([workerRun], name: "idx_worker_run")            // Facilita búsquedas por RUN del trabajador
@@index([companyId, status], name: "idx_company_status") // Optimiza filtrado por empresa y estado
@@index([contractId, createdAt], name: "idx_contract_date") // Mejora ordenamiento por fecha en contratos

// Índices de ApplicationQR
@@index([token])  // Optimiza búsquedas por token de QR

// Índices de DocumentationFile
@@index([applicationId, activityId, documentationId]) // Optimiza búsqueda de documentos
```

## 3. Flujo de Estados y Validaciones

### 3.1 Flujo de Aprobación

1. **Creación Inicial**
   - Status: `primeraVez`
   - StateAc: `pendiente`
   - StateSheq: `pendiente`
   - Auditoría: `CREACION`

2. **Revisión AdminContractor**
   - StateAc cambia a: `aprobado` | `adjuntar`
   - Se actualiza: `lastReviewedAt`
   - Auditoría: `APROBACION` | `OBSERVACION`

3. **Revisión SHEQ**
   - StateSheq cambia a: `aprobado` | `rechazado`
   - Si es aprobado: Se genera QR
   - Auditoría: `APROBACION` | `RECHAZO`

4. **Proceso de Renovación**
   - Status cambia a: `renovacion`
   - Se reinicia el flujo de aprobación
   - Auditoría: `EDICION`

### 3.2 Validaciones Implementadas

```typescript
// lib/validations.ts
export const applicationSchema = z.object({
  workerRun: z
    .string()
    .min(1)
    .regex(/^[0-9]{1,8}-[0-9kK]{1}$/),
  workerName: z.string().min(2),
  workerPaternal: z.string().min(2),
  workerMaternal: z.string().min(2),
  license: z.enum(['a1', 'a2', 'a3', 'a4', 'a5', 'b', 'c', 'd']).optional(),
  licenseExpiration: z.date().optional(),
  // ... más validaciones
});
```

## 4. Consideraciones de Implementación

### 4.1 Seguridad

- ✅ Validaciones de permisos por rol implementadas
- ✅ Auditoría de cambios automática
- ✅ Tokens únicos para QR
- 🔄 Sanitización de datos de entrada
- 🔄 Límites en tamaño de archivos

### 4.2 Performance

- ✅ Índices optimizados implementados
- ✅ Relaciones eficientes con cascade
- 🔄 Implementar caché para datos estáticos
- 🔄 Paginación en listados

### 4.3 UX/UI

- 🔄 Validaciones en tiempo real
- 🔄 Feedback claro de errores
- 🔄 Previsualización de documentos
- 🔄 Indicadores de progreso en Stepper

## 5. Próximos Pasos

1. **Implementación del Stepper**
   - Diseñar componentes por paso
   - Implementar validaciones client-side
   - Manejar estado del formulario

2. **Sistema de Documentación**
   - Implementar upload de archivos
   - Validar tipos y tamaños
   - Previsualización de documentos

3. **Sistema QR**
   - Generar QRs únicos
   - Implementar página de verificación
   - Manejar expiración de QRs

4. **Testing**
   - Tests unitarios de validaciones
   - Tests de integración del flujo
   - Tests E2E del proceso completo

Leyenda:

- ✅ Implementado
- 🔄 Pendiente de implementación
