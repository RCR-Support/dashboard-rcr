# Plan de Implementación: Módulo de Solicitudes de Acreditación (ACTUALIZADO)

## Orden de Implementación

1. ⚡ Base de Datos y Modelos
   - Preparar estructura base
   - Optimizar consultas
   - Establecer relaciones

2. 🔍 Validaciones y Helpers
   - Funciones de validación
   - Utilidades comunes
   - Tipos y interfaces

3. 🎨 Interfaz de Usuario
   - Implementar stepper
   - Formularios y validación
   - Flujo de usuario

4. 🔒 Flujo de Aprobación
   - Vista AdminContractor
   - Vista SHEQ
   - Estados y transiciones

5. 📱 Sistema QR
   - Página pública
   - Generación de códigos
   - Validaciones

6. 📧 Notificaciones
   - Emails
   - Notificaciones en sistema
   - Historial

7. 🔧 Testing y Documentación
   - Tests unitarios
     - Validaciones
     - Helpers
     - Componentes UI
   - Tests de integración
     - Flujo completo
     - Aprobaciones
     - QR y verificación
   - Tests E2E
     - Proceso completo
     - Casos borde
     - Performance
   - Documentación
     - Guía técnica
     - Manual de usuario
     - Diagramas de flujo
   - Mantenibilidad
     - Refactorización
     - Optimizaciones
     - Revisión de código

## Fase 1: Análisis y Configuración de Base de Datos

### Paso 1.1: Actualización del Modelo Application [Commit 1]

- [x] Revisar modelo `application` actual
- [x] Agregar modelo `ApplicationQR`:

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

- [x] Agregar índices de optimización:
  ```prisma
  // Índices importantes implementados:
  @@index([stateAc, userAcId], name: "idx_ac_review")
  @@index([stateSheq, userSheqId], name: "idx_sheq_review")
  @@index([workerRun], name: "idx_worker_run")
  @@index([companyId, status], name: "idx_company_status")
  @@index([contractId, createdAt], name: "idx_contract_date")
  ```
- [x] Commit: "feat(db): add application qr model and indexes"

### Paso 1.2: Sistema de Notificaciones [Commit 2]

- [x] Implementar modelo de notificaciones:

  ```prisma
  model Notification {
    id        String           @id @default(cuid())
    userId    String
    type      NotificationType
    message   String
    read      Boolean          @default(false)
    createdAt DateTime         @default(now())
    user      User?           @relation(fields: [userId], references: [id])
  }

  enum NotificationType {
    INACTIVE_REQUEST
    REASSIGNMENT
    REQUEST_APPROVED
    REQUEST_REJECTED
  }
  ```

- [x] Commit: "feat(db): add notification system"

### Paso 1.3: Optimización de Consultas [Commit 3]

- [x] Índices compuestos implementados
- [x] Relaciones optimizadas con cascada donde es necesario
- [x] Queries documentados en schema
- [x] Commit: "perf(db): optimize database queries and relations"

## Fase 2: Implementación del Stepper

### Paso 2.1: Paso de Contrato [Commit 3]

- [ ] Implementar ContractStep:
  - Auto-selección si hay un solo contrato
  - Mostrar datos completos:
    - Número y nombre de contrato
    - Fechas inicio/término
    - Datos del AdminContractor
- [ ] Commit: "feat(ui): implement contract step"

### Paso 2.2: Paso de Datos del Trabajador [Commit 4]

- [ ] Implementar WorkerStep:
  - Formulario de datos personales
  - Validación de RUN
  - Campos requeridos
- [ ] Commit: "feat(ui): implement worker step"

### Paso 2.3: Paso de Actividades [Commit 5]

- [ ] Implementar ActivitiesStep:
  - Selección múltiple de actividades
  - Validación de licencias requeridas
  - Actualización dinámica de documentos
- [ ] Commit: "feat(ui): implement activities step"

### Paso 2.4: Paso de Documentos [Commit 6]

- [ ] Implementar DocumentsStep:
  - Upload de PDFs
  - Validación de tamaño (3 páginas máx)
  - Preview de documentos
- [ ] Commit: "feat(ui): implement documents step"

## Fase 3: Sistema de QR y Verificación

### Paso 3.1: Página Pública de Verificación [Commit 7]

- [ ] Crear ruta pública `/credential/[id]`:
  - Vista de información aprobada
  - Validaciones de estado
  - Cache de datos
- [ ] Implementar rate limiting
- [ ] Commit: "feat(public): add credential verification page"

### Paso 3.2: Generación de QR [Commit 8]

- [ ] Implementar generación automática post-aprobación
- [ ] Vista previa en dashboard
- [ ] Sistema de desactivación
- [ ] Commit: "feat(qr): implement qr generation system"

## Fase 4: Flujo de Aprobación

### Paso 4.1: Vista AdminContractor [Commit 9]

- [ ] Dashboard de solicitudes pendientes
- [ ] Sistema de revisión de documentos
- [ ] Acciones de aprobación/rechazo
- [ ] Commit: "feat(admin): implement contractor review"

### Paso 4.2: Vista SHEQ [Commit 10]

- [ ] Dashboard de solicitudes aprobadas por AC
- [ ] Sistema de revisión final
- [ ] Generación automática de QR al aprobar
- [ ] Commit: "feat(sheq): implement sheq review"

## Fase 5: Sistema de Notificaciones

### Paso 5.1: Notificaciones por Email [Commit 11]

- [ ] Notificación a AC de nueva solicitud
- [ ] Notificaciones de cambios de estado
- [ ] Plantillas de email
- [ ] Commit: "feat(notify): implement email notifications"

### Paso 5.2: Notificaciones en Sistema [Commit 12]

- [ ] Notificaciones en tiempo real
- [ ] Centro de notificaciones
- [ ] Historial de cambios
- [ ] Commit: "feat(notify): implement system notifications"

## Fase 6: Testing y Optimización

### Paso 6.1: Tests E2E [Commit 13]

- [ ] Tests de flujo completo
- [ ] Tests de generación de QR
- [ ] Tests de permisos
- [ ] Commit: "test: add e2e tests"

### Paso 6.2: Optimización [Commit 14]

- [ ] Implementar caché
- [ ] Optimizar carga de documentos
- [ ] Mejoras de rendimiento
- [ ] Commit: "perf: optimize application system"

## Checkpoints de Revisión

Por cada commit:

1. ✅ Verificar funcionalidad
2. ✅ Validar permisos
3. ✅ Comprobar rendimiento
4. ✅ Actualizar documentación

## Consideraciones de Seguridad

- Rate limiting en endpoints públicos
- Validación de documentos PDF
- Registro de accesos a datos públicos
- Permisos por rol

## Consideraciones de Rendimiento

- Caché de datos públicos
- Optimización de carga de imágenes
- Paginación de listados
- Lazy loading de documentos

## Documentación

- Mantener actualizada la documentación técnica
- Documentar decisiones de diseño
- Actualizar guías de usuario
- Registrar cambios en el sistema
