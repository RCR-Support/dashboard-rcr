# Flujo de Uso: Creación y Aprobación de Solicitudes de Credencial

## 1. Rol del Usuario (User)

- El **usuario** representa a una empresa contratista.
- Puede acceder a la plataforma para **crear solicitudes de acreditación** para uno o varios trabajadores que prestarán servicios a la **empresa mandante "empresa contratista"** (dueña del sistema).

## 2. Creación de la Solicitud

vamos a tener una steep que que mostrata

- PASO 1 Ingreso de numero de contrato
- PASO 2 datos del trabajador
- PASO 3 actividad a realizar
- PASO 4 documentos requeridos

vamos a tener una parte de "Información de la solicitud" que se irá llenando según la información ingresada

- usando los datos del usauario logueado, obtenemos los datos de la empresa, si la empresa posee solo un solo número de contrato,
  se muestrá la iformación de ese contrato (se inicia en el paso 2 ), obetemos el administrador de contrato a quien se enviara la solicitud y
  si tiene mas de uno se muestra el select donde solo puede elegir uno y al elegir pasa al paso 2.

Por cada trabajador, el usuario debe:

- Ingresar los **datos personales del trabajador**.
- Seleccionar una o más **actividades** que realizará. C:\Users\matco\Desktop\Next\rcr-support\docs\ACTIVIDADES-REQUISITOS.md
- Adjuntar la **documentación requerida** para cada actividad:
  - Si una documentación aplica a varias actividades, se solicita solo una vez.
  - Si una actividad requiere documentación exclusiva, se solicita individualmente por cada actividad.

## 3. Envío a adminContractor

- Una vez completada, la solicitud es enviada al **adminContractor** asignado.
- La solicitud queda en estado **pendiente de revisión**.

## 4. Revisión del adminContractor

El **adminContractor** puede:

- **Aceptar** la solicitud: la envía al área **Sheq** para evaluación final.
- **Rechazar** la solicitud: se devuelve al usuario con un **motivo de rechazo** para su corrección.

## 5. Revisión del Sheq

El **Sheq** revisa solicitudes **aprobadas por el adminContractor** y puede:

- **Aceptar**: la solicitud pasa al módulo **credentials** para impresión de la credencial.
- **Rechazar**: la solicitud es devuelta al **usuario y adminContractor**, con el motivo correspondiente.

## 6. Impresión de Credenciales

- El módulo **credentials** accede únicamente a las solicitudes **aprobadas por Sheq**.
- Estas pueden ser **impresas como credenciales oficiales**, indicando:
  - Las **actividades autorizadas** para el trabajador.
  - El **estado aprobado** del proceso de acreditación.

---

# Revisión del Modelo Prisma

## ✅ Puntos fuertes

- **Modelado claro y estructurado** para actividades, documentación, solicitudes y usuarios.
- Soporte completo para **documentación por actividad**, incluyendo casos generales (`isGlobal`) y específicos (`isSpecific`).
- Inclusión de **auditoría** (`ApplicationAudit`) y **notificaciones** (`Notification`) para trazabilidad.
- Manejo robusto de **roles** (`UserRole`) y **reasignaciones** (`ReassignmentLog`).
- Uso adecuado de enums para estados, roles y tipos de licencia.

## 🔍 Validación funcional (vs. flujo de negocio)

| Funcionalidad                        | ¿Modelada? | Comentario                                                         |
| ------------------------------------ | ---------- | ------------------------------------------------------------------ |
| Creación de solicitudes por usuario  | ✅         | `application` y `UserApplications` lo manejan                      |
| Actividades múltiples por solicitud  | ✅         | `activities` en `application` con `ActivityApplications`           |
| Documentos específicos por actividad | ✅         | `ActivityDocumentation` + `DocumentationFile`                      |
| Documentos comunes para varias       | ✅         | `isGlobal` en `Documentation` y campo `isSpecific` controlan esto  |
| Flujo de revisión adminContractor    | ✅         | `userAcId`, `stateAc`, auditoría asociada                          |
| Revisión por SHEQ                    | ✅         | `userSheqId`, `stateSheq`, `ApplicationAudit`                      |
| Envío a módulo credencial            | ✅         | No necesita modelo adicional, se filtra por `stateSheq = aprobado` |
| Reasignaciones de contratos          | ✅         | `ReassignmentLog` + relaciones `PreviousAC`, `NewAC`               |
| Roles diferenciados                  | ✅         | `RoleEnum` + `UserRole` con relaciones                             |

## 🛠️ Sugerencias menores

- **`application.displayWorkerName`**: Podría construirse dinámicamente en frontend (opcional almacenarlo).
- **`VerificationToken`**: Puede omitirse si se usa Supabase Auth exclusivamente.
- **`application.license`**: Si se necesita por actividad, considerar una tabla pivote.
- **Índices útiles sugeridos**:
  ```prisma
  @@index([applicationId, activityId, documentationId]) // en DocumentationFile
  @@index([activityId, documentationId]) // en ActivityDocumentation
  ```

## 📝 TODO técnico y mejoras

- [ ] Agregar índices sugeridos en Prisma (`DocumentationFile`, `ActivityDocumentation`).
- [ ] Revisar si `VerificationToken` se puede eliminar según el sistema de autenticación final.
- [ ] Evaluar si `application.license` debe ser por actividad y crear tabla pivote si es necesario.
- [ ] Validar migraciones y pruebas de los modelos nuevos (`DocumentationFile`, `ApplicationAudit`).
- [ ] Documentar ejemplos de queries para auditoría y archivos/documentos.
- [ ] Revisar y optimizar relaciones inversas en Prisma para queries eficientes.
- [ ] Mejorar documentación técnica y de negocio en el markdown.
- [ ] Validar el flujo completo con datos reales y feedback de usuarios.

---
