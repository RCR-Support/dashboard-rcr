# Sistema de Acreditaciones RCR

## 1. Estructura del Proyecto

### 1.1 Modelos Principales

```prisma
// Modelo principal de solicitud
model application {
  id                String    @id @default(cuid())
  status            Status    @default(primeraVez)
  stateAc          StateAc
  stateSheq        StateSheq
  // ... otros campos
}

// Modelo QR
model ApplicationQR {
  id            String   @id @default(cuid())
  token         String   @unique
  // ... otros campos
}
```

### 1.2 Estados y Flujos

1. Estados de Solicitud
   - Primera Vez vs Renovación
   - Estados AC: pendiente → aprobado/adjuntar
   - Estados SHEQ: pendiente → aprobado/rechazado

2. Flujo de Aprobación
   ```mermaid
   graph TD
   A[Nueva Solicitud] --> B{AdminContractor}
   B -->|Aprobado| C{SHEQ}
   B -->|Adjuntar| D[Requiere Docs]
   C -->|Aprobado| E[Genera QR]
   C -->|Rechazado| F[Notifica Rechazo]
   ```

## 2. Implementación por Fases

### 2.1 Fase Actual: Stepper de Creación

- [x] Estructura base del stepper
- [x] Configuración de rutas
- [ ] ContractStep
  - [x] Componente base
  - [x] API de contratos
  - [ ] Filtrado por empresa
- [ ] WorkerStep (Siguiente)
- [ ] ActivityStep
- [ ] ZoneStep
- [ ] DocumentStep
- [ ] ReviewStep

### 2.2 Validaciones Implementadas

```typescript
// Ejemplo de validaciones
const applicationSchema = {
  workerRun: /^[0-9]{1,8}-[0-9kK]{1}$/,
  // ... otras validaciones
};
```

## 3. Tareas Pendientes

### 3.1 Inmediatas

1. [ ] Corregir filtrado de contratos por empresa
2. [ ] Implementar WorkerStep con validaciones
3. [ ] Diseñar transiciones entre pasos

### 3.2 Próximas

1. [ ] Sistema de carga de documentos
2. [ ] Generación de QR
3. [ ] Notificaciones

## 4. Notas Técnicas

### 4.1 Optimizaciones

- Índices implementados para búsquedas frecuentes
- Relaciones optimizadas con cascade where necesario
- Paginación pendiente para listados grandes

### 4.2 Seguridad

- Validación de permisos por rol
- Sanitización de inputs
- Tokens únicos para QR

### 4.3 Mantenimiento

- Tests unitarios pendientes
- Documentación de API en progreso
- Monitoreo de performance pendiente
