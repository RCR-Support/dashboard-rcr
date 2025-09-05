# Plan de Implementación: Módulo de Solicitudes de Acreditación (REVISADO)

## Fase 1: Análisis y Validación de Estructura Existente

### Paso 1.1: Documentación del Modelo Actual [Commit 1]

- [ ] Analizar y documentar modelo `application`:
  ```prisma
  // Estructura actual
  model application {
    // Datos básicos
    id, status, createdAt, updatedAt
    // Datos del trabajador
    workerName, workerPaternal, workerMaternal, workerRun
    // Estados y flujo
    stateAc, stateSheq
    // Relaciones principales
    activities, documentationFiles, contract
  }
  ```
- [ ] Mapear enums existentes:
  - Status (primeraVez/renovacion)
  - StateAc (aprobado/pendiente/adjuntar)
  - StateSheq (aprobado/pendiente/rechazado)
- [ ] Commit: "docs: document current application model"

### Paso 1.2: Validación contra Requerimientos [Commit 2]

- [ ] Verificar soporte para flujo de 4 pasos:
  1. Ingreso de contrato
     - Campos requeridos
     - Validaciones necesarias
  2. Datos del trabajador
     - Campos personales
     - Validaciones de formato
  3. Actividades
     - Relación con Activity
     - Manejo de múltiples actividades
  4. Documentos
     - Estructura DocumentationFile
     - Validaciones por actividad
- [ ] Commit: "docs: validate model against business flow"

### Paso 1.3: Optimizaciones del Modelo [Commit 3]

- [ ] Revisar y optimizar índices
- [ ] Verificar integridad referencial
- [ ] Documentar queries principales
- [ ] Commit: "feat(db): optimize application model"

## Fase 2: Implementación del Formulario Multi-paso

### Paso 2.1: Estructura Base del Stepper [Commit 4]

- [ ] Crear componentes base:
  ```typescript
  // Estructura de carpetas
  /components/applications/
    ├── ApplicationStepper.tsx
    ├── steps/
    │   ├── ContractStep.tsx
    │   ├── WorkerDataStep.tsx
    │   ├── ActivitiesStep.tsx
    │   └── DocumentsStep.tsx
    └── shared/
        ├── StepHeader.tsx
        └── StepNavigation.tsx
  ```
- [ ] Commit: "feat(ui): add application stepper structure"

### Paso 2.2: Implementación de Pasos [Commits 5-8]

- [ ] Paso 1: ContractStep
  - Selección de contrato
  - Validaciones
  - Carga de adminContractor
- [ ] Paso 2: WorkerDataStep
  - Formulario de datos personales
  - Validaciones RUN
  - Campos requeridos
- [ ] Paso 3: ActivitiesStep
  - Selección múltiple
  - Validaciones de licencias
  - Actualización de documentos
- [ ] Paso 4: DocumentsStep
  - Upload de archivos
  - Validación por tipo
  - Preview de documentos

## Fase 3: Implementación de Acciones del Servidor

### Paso 3.1: Acciones Base [Commit 9]

- [ ] Crear/Actualizar:
  ```typescript
  /actions/applications/
    ├── create-application.ts
    ├── update-application.ts
    ├── get-application.ts
    └── list-applications.ts
  ```
- [ ] Implementar validaciones Zod
- [ ] Manejar permisos por rol

### Paso 3.2: Acciones de Flujo [Commit 10]

- [ ] Implementar:
  - Aprobación AC
  - Aprobación SHEQ
  - Rechazo con comentarios
  - Historial de cambios

## Fase 4: Vistas de Revisión

### Paso 4.1: Vista AdminContractor [Commit 11]

- [ ] Lista de solicitudes pendientes
- [ ] Detalle de solicitud
- [ ] Acciones de aprobación/rechazo

### Paso 4.2: Vista SHEQ [Commit 12]

- [ ] Lista de solicitudes aprobadas por AC
- [ ] Validación de documentación
- [ ] Acciones finales

## Fase 5: Notificaciones y Seguimiento

### Paso 5.1: Sistema de Notificaciones [Commit 13]

- [ ] Notificar cambios de estado
- [ ] Alertas de rechazo
- [ ] Recordatorios de revisión

### Paso 5.2: Dashboard de Usuario [Commit 14]

- [ ] Estado de solicitudes
- [ ] Historial de cambios
- [ ] Acciones disponibles

## Checkpoints de Revisión

Por cada commit:

1. ✅ Verificar alineación con modelo existente
2. ✅ Validar contra flujo de negocio
3. ✅ Confirmar permisos correctos
4. ✅ Documentar cambios
5. ✅ Actualizar tests

## Notas Importantes

- Utilizar modelo `application` existente
- Mantener compatibilidad con datos actuales
- Seguir flujo de 4 pasos exactamente
- Respetar roles y permisos existentes
