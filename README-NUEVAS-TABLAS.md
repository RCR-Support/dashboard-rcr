# TODO y guía para nuevas tablas de acreditación

Este archivo es la referencia principal para el desarrollo de la funcionalidad de acreditación de trabajadores y la creación de actividades/documentaciones.

---

## Resumen funcional

- Un usuario (representante de empresa contratista) crea solicitudes para acreditar a sus trabajadores.
- Cada solicitud (application) incluye:
  - Datos del trabajador (Nombre, Apellido Paterno, Apellido Materno, RUN)
  - Número de contrato (de la empresa del usuario - select)
  - Empresa contratista (del usuario logueado)
  - Zona de trabajo (puede seleccionar una o varias)
  - Actividades que realizará el trabajador (multi-select)
  - Documentación requerida para cada actividad (definida por el admin)
  - AdminContractor responsable de revisar la solicitud (se obtiene desde el número de contrato, no desde la empresa)
- Un trabajador puede realizar varias actividades.
- Una actividad puede requerir varias documentaciones.
- Una documentación puede servir para varias actividades.
- Algunas documentaciones son únicas (sirven para todas las actividades), otras son específicas y pueden requerir varias instancias.
- Algunas documentaciones pueden requerir fecha de expiración (el admin lo define al crear la documentación).
- Algunas actividades requieren licencia de conducir específica.

---

## Modelos y relaciones a crear

```prisma
model Activity {
  id          String        @id @default(cuid())
  name        String
  imageUrl    String?       // URL de imagen referencial para mostrar en el frontend
  requiredDriverLicense String?   // Si la actividad requiere licencia de conducir específica
  applications application[]
  requiredDocumentations ActivityDocumentation[]
}

model Documentation {
  id          String        @id @default(cuid())
  name        String
  isGlobal    Boolean       @default(false) // Si sirve para todas las actividades
  expires     Boolean       @default(false) // Si requiere fecha de expiración
  activities  ActivityDocumentation[]
}

model ActivityDocumentation {
  id               String   @id @default(cuid())
  activityId       String
  documentationId  String
  quantity         Int      // cantidad requerida para la actividad
  isSpecific       Boolean  @default(false) // Si la documentación es específica para la actividad
  activity         Activity      @relation(fields: [activityId], references: [id])
  documentation    Documentation @relation(fields: [documentationId], references: [id])
}

model application {
  // ...existing code...
  activities Activity[]
  zones      Zone[] // Si se requiere zona como entidad
}

model Zone {
  id   String   @id @default(cuid())
  name String
  applications application[]
}
```

---

## Checklist de desarrollo

- [ ] Crear el modelo `Activity` en `schema.prisma`.
- [ ] Crear el modelo `Documentation` en `schema.prisma` (con campo `expires`).
- [ ] Crear la tabla intermedia `ActivityDocumentation`.
- [ ] Crear el modelo `Zone` si se requiere zonas dinámicas.
- [ ] Agregar la relación en el modelo `application`.
- [ ] Realizar migración Prisma.
- [ ] Crear formulario en el admin para crear actividades y documentaciones.
- [ ] Actualizar backend y frontend para soportar actividades y documentaciones.
- [ ] Documentar ejemplos de uso y queries.
- [ ] Definir y documentar lógica de licencias de conducir.

---

## Lista de nombres de actividades (para mockup o seed)

```
Alzahombre
Ambulancia
Armador De Andamio
Autorizado Para Bloquear
Bulldozer CAT D10T
Bulldozer CAT D10T2
Buses
Camión Aljibe CAT 773E
Camión Aljibe CAT 777D
Camión Aljibe KOM 785 HD-7
Camión Extracción CAT 785C
Camión Extracción KOM 830E-1
Camión Extracción KOM 830E-5
Camión Frontal CAT 966L
Camión Frontal CAT 992G
Camión Frontal CAT 994F
Camión Frontal CAT 994K
Cama Baja Mack
Camioneta Combustible
Camioneta Polvorinera
Camioneta Rescate/Emergencia
Camioneta Triple Cabina
Camión 3/4
Camión Aljibe
Camión Ampliroll
Camión Articulado Dumper
Camión Aspirador Alto Vacio
Camión CAEX Komatsu 730
Camión Caex 773
Camión Caex 777
Camión Caex 789
Camión Cama Baja
Camión Catodos
Camión Combustible
Camión Desobstructor
Camión Fosero
Camión Fábrica
Camión Hidrolavador
Camión Lubricador
Camión Lubricador/Pluma
Camión Pluma Solo Camión
Camión Pluma Y Grua Pluma
Camión Polvorín
Camión Rampla (plano)
Camión Rotainer
Camión Sonda
Camión Tolva
Camión De Sevicio
Camión De Emergencia
Camión Ácido
Cargador Frontal Otras Marcas
Cargador WA900
D-75-KS
Enrolla Cable CAT 980
Enrolla Cable Kom WA 600
Equipo Radiactivo 1era, 2da Y 3era
Espacios Confinados
Excavadora Balde/Pica Roca
Excavadora Liebherr Modelo 984
Excavadoras PC 5500
Furgon
Grua Portal
Grúa Horquilla
Grúa Móvil
Grúa Pluma Solo Grúa
Grúa Puente
KOMATSU WD600-6R
Lainera
Limpiadora De Vapor “OPTIMA”
Manipulador Telescópico
Manipulador De Neumáticos CF
Manipulador De Neumáticos GH
Martillo Pica Roca
Minibus
Minicargador
Motoniveladora CAT 16
Motoniveladora CAT 16M
Pala 4100 XPC AC
Perfolodos WS 1400
Perforadora D755K
Perforadora DM50
Perforadora DMM2
Perforadora MD6240
Perforadora MD6380
Perforadora Roc L8
ROCL8
Retroexcavadoras
Rigger
Rodillo
Rotopala / Spreader
Soldador
Sonda
Tapapozos
Thunderbolt
Trabajo Altura Física
Tracto Camión
Tractor De Orugas
Tractor De Ruedas
Traslado Palas
Traslado Perforadora
Uso Cuchillo OLFA
Vehículo Liviano
Welldozer WD900
Wheeldozer CAT 834G
Wheeldozer CAT 854K
```

---

Este archivo es la referencia principal para el desarrollo. Si tienes dudas sobre la lógica, revisa aquí antes de modificar el esquema o la funcionalidad.
