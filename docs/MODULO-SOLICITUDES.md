# Módulo de Solicitudes de Acreditación

## Componentes Principales

### 1. Stepper (Paso a Paso)

Ubicación: `/app/dashboard/applications/create/stepper.tsx`

El stepper maneja la navegación entre los diferentes pasos del formulario de solicitud:

1. Selección de Contrato
2. Información del Trabajador
3. Selección de Actividades
4. Documentos

### 2. Selección de Contrato

Ubicación: `/app/dashboard/applications/create/steps/ContractStep.tsx`

- Muestra los contratos disponibles para la empresa
- Permite seleccionar un contrato para continuar
- Manejo de estado:
  ```typescript
  const handleSelect = (contract: Contract) => {
    setSelectedContract(contract);
    onNext(contract);
  };
  ```

**Notas importantes:**

- La lógica de navegación está centralizada en el stepper
- El componente mantiene un diseño simple y delegado
- Se preservan los datos del trabajador al cambiar de contrato para permitir corregir errores sin perder información

### 3. Información del Trabajador

Ubicación: `/app/dashboard/applications/create/steps/WorkerStep.tsx`

- Formulario para ingresar datos del trabajador
- Validación de campos requeridos
- Manejo de navegación entre pasos

### 4. Store (Estado Global)

Ubicación: `/store/application-form-store.ts`

Maneja el estado global de la aplicación usando Zustand:

```typescript
interface ApplicationFormState {
  currentStep: number;
  contract: Contract | null;
  workerData: WorkerFormValues | null;
  selectedActivities: Activity[];
  // ...
}
```

## Estado Actual

### Completado

1. ✅ Navegación básica entre pasos
2. ✅ Selección de contrato funcional
3. ✅ Formulario de información del trabajador
4. ✅ Persistencia de datos entre pasos
5. ✅ Validaciones básicas

### Pendiente

1. Implementación de selección de actividades
2. Gestión de documentos
3. Validaciones avanzadas
4. Mejoras en la navegación:
   - Preservación de datos al cambiar de contrato
   - Consistencia en la navegación al volver atrás

### Detalles Conocidos

1. Al volver desde información del trabajador y seleccionar un nuevo contrato, ocasionalmente puede navegar al paso incorrecto
2. Se mantienen los datos del trabajador al cambiar de contrato (comportamiento intencional)

## Próximos Pasos

1. Implementar selección de actividades
   - Diseñar interfaz de selección
   - Integrar con el contrato seleccionado
   - Manejar selección múltiple

2. Desarrollar gestión de documentos
   - Upload de archivos
   - Validación de documentos
   - Previsualización
