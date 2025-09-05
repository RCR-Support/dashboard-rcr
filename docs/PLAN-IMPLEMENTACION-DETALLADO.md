# Plan de Implementación Detallado: Módulo de Solicitudes de Acreditación

## Fase 1: Análisis y Preparación

### Paso 1.1: Validación de Modelos Existentes [Commit 1]

- [ ] Revisar modelo `application`:
  ```prisma
  model application {
    // Datos del trabajador
    workerName, workerRun, etc.
    // Estados y flujo
    status, stateAc, stateSheq
    // Relaciones
    activities, documentationFiles
  }
  ```
- [ ] Validar campos necesarios para QR
- [ ] Verificar índices de búsqueda
- [ ] Commit: "docs: validate application model structure"

### Paso 1.2: Configuración de Validaciones [Commit 2]

- [ ] Implementar validadores:
  - [ ] RUN del trabajador
  - [ ] Formato PDF y tamaño (máx 3 páginas)
  - [ ] Límite de tamaño de archivos
  - [ ] Fechas de contratos
- [ ] Commit: "feat: add application validators"

## Fase 2: Implementación del Stepper

### Paso 2.1: Estructura Base [Commit 3]

- [ ] Crear componentes base:
  ```typescript
  /components/applications/
    ├── ApplicationStepper/
    │   ├── index.tsx
    │   ├── StepperContext.tsx
    │   └── StepperProgress.tsx
    ├── steps/
    │   ├── ContractStep/
    │   ├── WorkerStep/
    │   ├── ActivitiesStep/
    │   └── DocumentsStep/
    └── shared/
  ```
- [ ] Commit: "feat: add stepper base structure"

### Paso 2.2: ContractStep [Commit 4]

- [ ] Implementar selección/visualización de contrato:
  - [ ] Carga automática si hay un solo contrato
  - [ ] Mostrar:
    - Número de contrato
    - Nombre del contrato
    - Fecha inicio/término
    - Datos del AdminContractor
      - Nombre
      - ID (interno)
      - Correo
      - Teléfono
- [ ] Commit: "feat: implement contract step"

### Paso 2.3: WorkerStep [Commit 5]

- [ ] Formulario de datos del trabajador:
  - [ ] Validación de RUN
  - [ ] Campos personales completos
  - [ ] Formato estandarizado
- [ ] Commit: "feat: implement worker data step"

### Paso 2.4: ActivitiesStep [Commit 6]

- [ ] Implementar selección de actividades:
  - [ ] Lista según ACTIVIDADES-REQUISITOS.md
  - [ ] Validación de licencias requeridas
  - [ ] Actualización automática de documentos necesarios
  - [ ] Estructura preparada para futura limitación
- [ ] Commit: "feat: implement activities step"

### Paso 2.5: DocumentsStep [Commit 7]

- [ ] Sistema de carga de documentos:
  - [ ] Validación de PDF
  - [ ] Control de tamaño y páginas
  - [ ] Preview de documentos
  - [ ] Agrupación por actividad
- [ ] Commit: "feat: implement documents step"

## Fase 3: Flujo de Aprobación

### Paso 3.1: Vista AdminContractor [Commit 8]

- [ ] Implementar dashboard de revisión:
  - [ ] Lista de solicitudes pendientes
  - [ ] Vista detallada de documentos
  - [ ] Sistema de observaciones
  - [ ] Acciones:
    - Aprobar (envía a SHEQ)
    - Rechazar (vuelve a usuario)
- [ ] Commit: "feat: implement admin contractor review"

### Paso 3.2: Vista SHEQ [Commit 9]

- [ ] Implementar dashboard SHEQ:
  - [ ] Lista de solicitudes aprobadas por AC
  - [ ] Validación final de documentos
  - [ ] Sistema de observaciones
  - [ ] Acciones:
    - Aprobar final
    - Rechazar (vuelve a usuario)
- [ ] Commit: "feat: implement sheq review"

## Fase 4: Notificaciones y Seguimiento

### Paso 4.1: Sistema de Notificaciones [Commit 10]

- [ ] Implementar notificaciones:
  - [ ] Email al AdminContractor
  - [ ] Notificaciones de estado
  - [ ] Alertas de rechazo
- [ ] Commit: "feat: implement notification system"

### Paso 4.2: Sistema de QR [Commit 11]

- [ ] Implementar sistema QR:
  - [ ] Generación de QR único
  - [ ] Página de detalle público
  - [ ] Vista de actividades aprobadas
- [ ] Commit: "feat: implement qr system"

## Fase 5: Testing y Optimización

### Paso 5.1: Pruebas de Flujo [Commit 12]

- [ ] Testing completo:
  - [ ] Flujo de creación
  - [ ] Proceso de aprobación
  - [ ] Validaciones de documentos
  - [ ] Sistema QR
- [ ] Commit: "test: add e2e tests"

### Paso 5.2: Optimizaciones [Commit 13]

- [ ] Optimizar:
  - [ ] Carga de documentos
  - [ ] Validaciones asíncronas
  - [ ] Caché de datos
- [ ] Commit: "perf: optimize application flow"

## Checkpoints de Validación

### Por cada commit:

1. ✅ Verificar alineación con modelo existente
2. ✅ Probar casos de uso principales
3. ✅ Validar permisos y seguridad
4. ✅ Documentar cambios
5. ✅ Actualizar tests

## Consideraciones Técnicas

- PDF: máximo 3 páginas
- Validaciones síncronas y asíncronas
- Permisos por rol
- Trazabilidad de cambios
- Backup de documentos

## Notas de Seguridad

- Validar permisos en cada paso
- Sanitizar datos de entrada
- Verificar integridad de documentos
- Registrar acciones sensibles
