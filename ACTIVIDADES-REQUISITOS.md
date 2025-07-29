# Requisitos por Actividad y Documentación

Este archivo detalla, para cada actividad, la documentación requerida y observaciones específicas. Úsalo como referencia para definir, mantener y validar los requisitos de acreditación.

---

## Lista de actividades

Lista de todas las actividades posibles en el sistema:

- Alzahombre
- Ambulancia
- Armador De Andamio
- Autorizado Para Bloquear
- Bulldozer CAT D10T
- Bulldozer CAT D10T2
- Buses
- Camión Aljibe CAT 773E
- Camión Aljibe CAT 777D
- Camión Aljibe KOM 785 HD-7
- Camión Extracción CAT 785C
- Camión Extracción KOM 830E-1
- Camión Extracción KOM 830E-5
- Camión Frontal CAT 966L
- Camión Frontal CAT 992G
- Camión Frontal CAT 994F
- Camión Frontal CAT 994K
- Cama Baja Mack
- Camioneta Combustible
- Camioneta Polvorinera
- Camioneta Rescate/Emergencia
- Camioneta Triple Cabina
- Camión 3/4
- Camión Aljibe
- Camión Ampliroll
- Camión Articulado Dumper
- Camión Aspirador Alto Vacio
- Camión CAEX Komatsu 730
- Camión Caex 773
- Camión Caex 777
- Camión Caex 789
- Camión Cama Baja
- Camión Catodos
- Camión Combustible
- Camión Desobstructor
- Camión Fosero
- Camión Fábrica
- Camión Hidrolavador
- Camión Lubricador
- Camión Lubricador/Pluma
- Camión Pluma Solo Camión
- Camión Pluma Y Grua Pluma
- Camión Polvorín
- Camión Rampla (plano)
- Camión Rotainer
- Camión Sonda
- Camión Tolva
- Camión De Sevicio
- Camión De Emergencia
- Camión Ácido
- Cargador Frontal Otras Marcas
- Cargador WA900
- D-75-KS
- Enrolla Cable CAT 980
- Enrolla Cable Kom WA 600
- Equipo Radiactivo 1era, 2da Y 3era
- Espacios Confinados
- Excavadora Balde/Pica Roca
- Excavadora Liebherr Modelo 984
- Excavadoras PC 5500
- Furgon
- Grua Portal
- Grúa Horquilla
- Grúa Móvil
- Grúa Pluma Solo Grúa
- Grúa Puente
- KOMATSU WD600-6R
- Lainera
- Limpiadora De Vapor “OPTIMA”
- Manipulador Telescópico
- Manipulador De Neumáticos CF
- Manipulador De Neumáticos GH
- Martillo Pica Roca
- Minibus
- Minicargador
- Motoniveladora CAT 16
- Motoniveladora CAT 16M
- Pala 4100 XPC AC
- Perfolodos WS 1400
- Perforadora D755K
- Perforadora DM50
- Perforadora DMM2
- Perforadora MD6240
- Perforadora MD6380
- Perforadora Roc L8
- ROCL8
- Retroexcavadoras
- Rigger
- Rodillo
- Rotopala / Spreader
- Soldador
- Sonda
- Tapapozos
- Thunderbolt
- Trabajo Altura Física
- Tracto Camión
- Tractor De Orugas
- Tractor De Ruedas
- Traslado Palas
- Traslado Perforadora
- Uso Cuchillo OLFA
- Vehículo Liviano
- Welldozer WD900
- Wheeldozer CAT 834G
- Wheeldozer CAT 854K

### Estructura de base de datos y relaciones

```prisma
model Activity {
  id            Int                      @id @default(autoincrement())
  name          String                   @unique
  // ...otros campos
  activityDocumentations ActivityDocumentation[]
}
```

Cada actividad puede estar relacionada con múltiples documentaciones a través de la tabla pivote `ActivityDocumentation`.

**Estructura en base de datos:**

```prisma
model Activity {
  id                     String                  @id @default(cuid())
  name                   String
  imageUrl               String?
  requiredDriverLicense  String?
  applications           application[]           @relation("ActivityApplications")
  requiredDocumentations ActivityDocumentation[]
}
```

---

## Lista de documentaciones

Lista oficial de tipos de documentación requeridos (usar solo estos):

- Licencia Municipal
- Sicosensotécnico
- Certificado Examen Práctico
- Hoja de vida conductor
- Certificado Curso Conducción a la defensiva
- Curso Específico Equipo que va a Operar
- Curso Específico Actividad que va a Realizar
- Capacitación teórica práctica - Zona Roja
- Certificado Médico Trabajo Altura Física
- DS 160 Curso Sustancia Peligrosa
- Licencia de Manipulador de Explosivos

> **Nota:** Solo se deben utilizar estos tipos de documentación para la acreditación de actividades. Si se requiere agregar uno nuevo, debe ser validado por el equipo responsable.

### Estructura de base de datos y relaciones

```prisma
model Documentation {
  id            Int                      @id @default(autoincrement())
  name          String                   @unique
  isSpecific    Boolean                  @default(false)
  // ...otros campos
  activityDocumentations ActivityDocumentation[]
}
```

Cada tipo de documentación puede estar asociada a múltiples actividades mediante la tabla pivote `ActivityDocumentation`.

**Estructura en base de datos:**

```prisma
model Documentation {
  id         String                  @id @default(cuid())
  name       String
  isGlobal   Boolean                 @default(false)
  activities ActivityDocumentation[]
}
```

---

## Relación actividad-documentación

| Actividad                          | Documentación requerida                   |
| ---------------------------------- | ----------------------------------------- |
| Alzahombre                         | No requiere licencia                      |
| Ambulancia                         | Licencia clase A-1, A-2, A-3, A-4, A-5    |
| Armador De Andamio                 | No requiere licencia                      |
| Autorizado Para Bloquear           | No requiere licencia                      |
| Bulldozer CAT D10T                 | Licencia clase D                          |
| Bulldozer CAT D10T2                | Licencia clase D                          |
| Buses                              | Licencia clase A-1, A-3                   |
| Camión Aljibe CAT 773E             | Licencia clase D                          |
| Camión Aljibe CAT 777D             | Licencia clase D                          |
| Camión Aljibe KOM 785 HD-7         | Licencia clase D                          |
| Camión Extracción CAT 785C         | Licencia clase D                          |
| Camión Extracción KOM 830E-1       | Licencia clase D                          |
| Camión Extracción KOM 830E-5       | Licencia clase D                          |
| Camión Frontal CAT 966L            | Licencia clase D                          |
| Camión Frontal CAT 992G            | Licencia clase D                          |
| Camión Frontal CAT 994F            | Licencia clase D                          |
| Camión Frontal CAT 994K            | Licencia clase D                          |
| Cama Baja Mack                     | Licencia clase A-1, A-2, A-3, A-4, A-5    |
| Camioneta Combustible              | Licencia clase B                          |
| Camioneta Polvorinera              | Licencia clase B                          |
| Camioneta Rescate/Emergencia       | Licencia clase B                          |
| Camioneta Triple Cabina            | Licencia clase B                          |
| Camión 3/4                         | Licencia clase A-1, A-2, A-3, A-4, A-5    |
| Camión Aljibe                      | Licencia clase A-1, A-2, A-3, A-4, A-5    |
| Camión Ampliroll                   | Licencia clase A-1, A-2, A-3, A-4, A-5    |
| Camión Articulado Dumper           | Licencia clase D                          |
| Camión Aspirador Alto Vacio        | Licencia clase A-1, A-2, A-3, A-4, A-5    |
| Camión CAEX Komatsu 730            | Licencia clase D                          |
| Camión Caex 773                    | Licencia clase D                          |
| Camión Caex 777                    | Licencia clase D                          |
| Camión Caex 789                    | Licencia clase D                          |
| Camión Cama Baja                   | Licencia clase A-1, A-2, A-3, A-4, A-5    |
| Camión Catodos                     | Licencia clase A-1, A-2, A-3, A-4, A-5    |
| Camión Combustible                 | Licencia clase A-1, A-2, A-3, A-4, A-5    |
| Camión Desobstructor               | Licencia clase A-1, A-2, A-3, A-4, A-5    |
| Camión Fosero                      | Licencia clase A-1, A-2, A-3, A-4, A-5    |
| Camión Fábrica                     | Licencia clase A-1, A-2, A-3, A-4, A-5    |
| Camión Hidrolavador                | Licencia clase A-1, A-2, A-3, A-4, A-5    |
| Camión Lubricador                  | Licencia clase A-1, A-2, A-3, A-4, A-5    |
| Camión Lubricador/Pluma            | Licencia clase A-1, A-2, A-3, A-4, A-5    |
| Camión Pluma Solo Camión           | Licencia clase A-1, A-2, A-3, A-4, A-5    |
| Camión Pluma Y Grua Pluma          | Licencia clase A-1, A-2, A-3, A-4, A-5    |
| Camión Polvorín                    | Licencia clase A-1, A-2, A-3, A-4, A-5    |
| Camión Rampla (plano)              | Licencia clase A-1, A-2, A-3, A-4, A-5    |
| Camión Rotainer                    | Licencia clase A-1, A-2, A-3, A-4, A-5    |
| Camión Sonda                       | Licencia clase A-1, A-2, A-3, A-4, A-5    |
| Camión Tolva                       | Licencia clase A-1, A-2, A-3, A-4, A-5    |
| Camión De Sevicio                  | Licencia clase A-1, A-2, A-3, A-4, A-5    |
| Camión De Emergencia               | Licencia clase A-1, A-2, A-3, A-4, A-5    |
| Camión Ácido                       | Licencia clase A-1, A-2, A-3, A-4, A-5    |
| Cargador Frontal Otras Marcas      | Licencia clase D                          |
| Cargador WA900                     | Licencia clase D                          |
| D-75-KS                            | Licencia clase D                          |
| Enrolla Cable CAT 980              | Licencia clase D                          |
| Enrolla Cable Kom WA 600           | Licencia clase D                          |
| Equipo Radiactivo 1era, 2da Y 3era | No requiere licencia                      |
| Espacios Confinados                | No requiere licencia                      |
| Excavadora Balde/Pica Roca         | Licencia clase D                          |
| Excavadora Liebherr Modelo 984     | Licencia clase D                          |
| Excavadoras PC 5500                | Licencia clase D                          |
| Furgon                             | Licencia clase A-1, A-2, A-3              |
| Grua Portal                        | No requiere licencia                      |
| Grúa Horquilla                     | Licencia clase D                          |
| Grúa Móvil                         | Licencia clase D                          |
| Grúa Pluma Solo Grúa               | No requiere licencia                      |
| Grúa Puente                        | Licencia clase D                          |
| KOMATSU WD600-6R                   | Licencia clase D                          |
| Lainera                            | No requiere licencia                      |
| Limpiadora De Vapor “OPTIMA”       | Licencia clase A-1, A-2, A-3, A-4, A-5, B |
| Manipulador Telescópico            | Licencia clase D                          |
| Manipulador De Neumáticos CF       | Licencia clase D                          |
| Manipulador De Neumáticos GH       | Licencia clase D                          |
| Martillo Pica Roca                 | No requiere licencia                      |
| Minibus                            | Licencia clase A-1, A-2, A-3              |
| Minicargador                       | Licencia clase D                          |
| Motoniveladora CAT 16              | Licencia clase D                          |
| Motoniveladora CAT 16M             | Licencia clase D                          |
| Pala 4100 XPC AC                   | Licencia clase D                          |
| Perfolodos WS 1400                 | Licencia clase A-1, A-2, A-3, A-4, A-5    |
| Perforadora D755K                  | Licencia clase D                          |
| Perforadora DM50                   | Licencia clase D                          |
| Perforadora DMM2                   | Licencia clase D                          |
| Perforadora MD6240                 | Licencia clase D                          |
| Perforadora MD6380                 | Licencia clase D                          |
| Perforadora Roc L8                 | Licencia clase D                          |
| ROCL8                              | Licencia clase D                          |
| Retroexcavadoras                   | Licencia clase D                          |
| Rigger                             | No requiere licencia                      |
| Rodillo                            | Licencia clase D                          |
| Rotopala / Spreader                | No requiere licencia                      |
| Soldador                           | No requiere licencia                      |
| Sonda                              | No requiere licencia                      |
| Tapapozos                          | Licencia clase D                          |
| Thunderbolt                        | No requiere licencia                      |
| Trabajo Altura Física              | No requiere licencia                      |
| Tracto Camión                      | Licencia clase A-1, A-2, A-3, A-4, A-5    |
| Tractor De Orugas                  | Licencia clase D                          |
| Tractor De Ruedas                  | Licencia clase D                          |
| Traslado Palas                     | Licencia clase D                          |
| Traslado Perforadora               | Licencia clase D                          |
| Uso Cuchillo OLFA                  | No requiere licencia                      |
| Vehículo Liviano                   | Licencia clase A-1, A-2, A-3, A-4, A-5, B |
| Welldozer WD900                    | Licencia clase D                          |
| Wheeldozer CAT 834G                | Licencia clase D                          |
| Wheeldozer CAT 854K                | Licencia clase D                          |

### Actividades que requieren **Licencia Municipal**

| Actividad                     | Documentación requerida |
| ----------------------------- | ----------------------- |
| Camión Extracción KOM 830E-1  | Licencia Municipal      |
| Buses                         | Licencia Municipal      |
| Camión Ampliroll              | Licencia Municipal      |
| Camión Articulado Dumper      | Licencia Municipal      |
| Camión Aspirador Alto Vacio   | Licencia Municipal      |
| Camión Fosero                 | Licencia Municipal      |
| Camión Pluma Y Grua Pluma     | Licencia Municipal      |
| Cargador Frontal Otras Marcas | Licencia Municipal      |
| Grúa Horquilla                | Licencia Municipal      |
| Grúa Móvil                    | Licencia Municipal      |
| Manipulador Telescópico       | Licencia Municipal      |
| Minicargador                  | Licencia Municipal      |
| Perforadora MD6240            | Licencia Municipal      |
| Perforadora DM50              | Licencia Municipal      |
| Perforadora D755K             | Licencia Municipal      |
| Perforadora DMM2              | Licencia Municipal      |
| Retroexcavadoras              | Licencia Municipal      |
| Rodillo                       | Licencia Municipal      |
| Grúa Puente                   | Licencia Municipal      |
| Camión Aljibe CAT 773E        | Licencia Municipal      |
| Camión Combustible            | Licencia Municipal      |
| Excavadora Balde/Pica Roca    | Licencia Municipal      |
| Ambulancia                    | Licencia Municipal      |
| Perfolodos WS 1400            | Licencia Municipal      |
| Camión Ácido                  | Licencia Municipal      |
| Tracto Camión                 | Licencia Municipal      |
| Camión Catodos                | Licencia Municipal      |
| Camión 3/4                    | Licencia Municipal      |
| Camión Hidrolavador           | Licencia Municipal      |
| Camión Pluma Solo Camión      | Licencia Municipal      |
| Camión Tolva                  | Licencia Municipal      |
| Camión Rampla (plano)         | Licencia Municipal      |
| Camión Rotainer               | Licencia Municipal      |
| Camión Desobstructor          | Licencia Municipal      |
| Camioneta Combustible         | Licencia Municipal      |
| Camioneta Triple Cabina       | Licencia Municipal      |
| Furgon                        | Licencia Municipal      |
| Minibus                       | Licencia Municipal      |
| Camión De Sevicio             | Licencia Municipal      |
| Cama Baja Mack                | Licencia Municipal      |
| Camión Lubricador             | Licencia Municipal      |
| Camioneta Polvorinera         | Licencia Municipal      |
| Camioneta Rescate/Emergencia  | Licencia Municipal      |
| Vehículo Liviano              | Licencia Municipal      |
| Camión Caex 773               | Licencia Municipal      |
| Camión Caex 777               | Licencia Municipal      |
| Traslado Perforadora          | Licencia Municipal      |
| Traslado Palas                | Licencia Municipal      |
| Camión Extracción CAT 785C    | Licencia Municipal      |
| Camión Caex 789               | Licencia Municipal      |
| Camión Fábrica                | Licencia Municipal      |
| Camión Polvorín               | Licencia Municipal      |
| Camión Sonda                  | Licencia Municipal      |
| Camión Frontal CAT 992G       | Licencia Municipal      |
| Camión Frontal CAT 994F       | Licencia Municipal      |
| Excavadoras PC 5500           | Licencia Municipal      |
| Manipulador De Neumáticos CF  | Licencia Municipal      |
| Manipulador De Neumáticos GH  | Licencia Municipal      |
| Motoniveladora CAT 16M        | Licencia Municipal      |
| Sonda                         | Licencia Municipal      |
| Tractor De Orugas             | Licencia Municipal      |
| Tractor De Ruedas             | Licencia Municipal      |
| Tapapozos                     | Licencia Municipal      |
| Wheeldozer CAT 834G           | Licencia Municipal      |
| Cargador WA900                | Licencia Municipal      |
| Camión Aljibe KOM 785 HD-7    | Licencia Municipal      |
| Welldozer WD900               | Licencia Municipal      |

### Actividades que requieren **Sicosensotécnico**

| Actividad                     | Documentación requerida |
| ----------------------------- | ----------------------- |
| Lainera                       | Sicosensotécnico        |
| Thunderbolt                   | Sicosensotécnico        |
| Camión Extracción KOM 830E-1  | Sicosensotécnico        |
| Buses                         | Sicosensotécnico        |
| Camión Ampliroll              | Sicosensotécnico        |
| Camión Articulado Dumper      | Sicosensotécnico        |
| Camión Aspirador Alto Vacio   | Sicosensotécnico        |
| Camión Fosero                 | Sicosensotécnico        |
| Camión Pluma Y Grua Pluma     | Sicosensotécnico        |
| Cargador Frontal Otras Marcas | Sicosensotécnico        |
| Grúa Horquilla                | Sicosensotécnico        |
| Grúa Móvil                    | Sicosensotécnico        |
| Manipulador Telescópico       | Sicosensotécnico        |
| Minicargador                  | Sicosensotécnico        |
| Perforadora MD6240            | Sicosensotécnico        |
| Perforadora DM50              | Sicosensotécnico        |
| Perforadora D755K             | Sicosensotécnico        |
| Perforadora DMM2              | Sicosensotécnico        |
| Retroexcavadoras              | Sicosensotécnico        |
| Rodillo                       | Sicosensotécnico        |
| Grúa Pluma Solo Grúa          | Sicosensotécnico        |
| Grúa Puente                   | Sicosensotécnico        |
| Martillo Pica Roca            | Sicosensotécnico        |
| Rotopala / Spreader           | Sicosensotécnico        |
| Camión Aljibe CAT 773E        | Sicosensotécnico        |
| Camión Combustible            | Sicosensotécnico        |
| Excavadora Balde/Pica Roca    | Sicosensotécnico        |
| Ambulancia                    | Sicosensotécnico        |
| Perfolodos WS 1400            | Sicosensotécnico        |
| Camión Ácido                  | Sicosensotécnico        |
| Tracto Camión                 | Sicosensotécnico        |
| Camión Catodos                | Sicosensotécnico        |
| Camión 3/4                    | Sicosensotécnico        |
| Camión Hidrolavador           | Sicosensotécnico        |
| Camión Pluma Solo Camión      | Sicosensotécnico        |
| Camión Tolva                  | Sicosensotécnico        |
| Camión Rampla (plano)         | Sicosensotécnico        |
| Camión Rotainer               | Sicosensotécnico        |
| Camión Desobstructor          | Sicosensotécnico        |
| Camioneta Combustible         | Sicosensotécnico        |
| Camioneta Triple Cabina       | Sicosensotécnico        |
| Furgon                        | Sicosensotécnico        |
| Minibus                       | Sicosensotécnico        |
| Camión De Sevicio             | Sicosensotécnico        |
| Cama Baja Mack                | Sicosensotécnico        |
| Camión Lubricador             | Sicosensotécnico        |
| Camioneta Polvorinera         | Sicosensotécnico        |
| Camioneta Rescate/Emergencia  | Sicosensotécnico        |
| Vehículo Liviano              | Sicosensotécnico        |
| Camión Caex 773               | Sicosensotécnico        |
| Camión Caex 777               | Sicosensotécnico        |
| Traslado Perforadora          | Sicosensotécnico        |
| Traslado Palas                | Sicosensotécnico        |
| Camión Extracción CAT 785C    | Sicosensotécnico        |
| Camión Caex 789               | Sicosensotécnico        |
| Camión Fábrica                | Sicosensotécnico        |
| Camión Polvorín               | Sicosensotécnico        |
| Camión Sonda                  | Sicosensotécnico        |
| Camión Frontal CAT 992G       | Sicosensotécnico        |
| Camión Frontal CAT 994F       | Sicosensotécnico        |
| Excavadora Balde/Pica Roca    | Sicosensotécnico        |
| Excavadoras PC 5500           | Sicosensotécnico        |
| Manipulador De Neumáticos CF  | Sicosensotécnico        |
| Manipulador De Neumáticos GH  | Sicosensotécnico        |
| Motoniveladora CAT 16M        | Sicosensotécnico        |
| Sonda                         | Sicosensotécnico        |
| Tractor De Orugas             | Sicosensotécnico        |
| Tractor De Ruedas             | Sicosensotécnico        |
| Tapapozos                     | Sicosensotécnico        |
| Wheeldozer CAT 834G           | Sicosensotécnico        |
| Cargador WA900                | Sicosensotécnico        |
| Camión Aljibe KOM 785 HD-7    | Sicosensotécnico        |
| Welldozer WD900               | Sicosensotécnico        |

### Actividades que requieren **Certificado Examen Práctico**

| Actividad                     | Documentación requerida     |
| ----------------------------- | --------------------------- |
| Camión Extracción KOM 830E-1  | Certificado Examen Práctico |
| Buses                         | Certificado Examen Práctico |
| Camión Ampliroll              | Certificado Examen Práctico |
| Camión Articulado Dumper      | Certificado Examen Práctico |
| Camión Aspirador Alto Vacio   | Certificado Examen Práctico |
| Camión Fosero                 | Certificado Examen Práctico |
| Camión Pluma Y Grua Pluma     | Certificado Examen Práctico |
| Cargador Frontal Otras Marcas | Certificado Examen Práctico |
| Grúa Horquilla                | Certificado Examen Práctico |
| Grúa Móvil                    | Certificado Examen Práctico |
| Manipulador Telescópico       | Certificado Examen Práctico |
| Minicargador                  | Certificado Examen Práctico |
| Perforadora MD6240            | Certificado Examen Práctico |
| Perforadora DM50              | Certificado Examen Práctico |
| Perforadora D755K             | Certificado Examen Práctico |
| Perforadora DMM2              | Certificado Examen Práctico |
| Retroexcavadoras              | Certificado Examen Práctico |
| Rodillo                       | Certificado Examen Práctico |
| Grúa Pluma Solo Grúa          | Certificado Examen Práctico |
| Grúa Puente                   | Certificado Examen Práctico |
| Martillo Pica Roca            | Certificado Examen Práctico |
| Rotopala / Spreader           | Certificado Examen Práctico |
| Camión Aljibe CAT 773E        | Certificado Examen Práctico |
| Camión Combustible            | Certificado Examen Práctico |
| Excavadora Balde/Pica Roca    | Certificado Examen Práctico |
| Alzahombre                    | Certificado Examen Práctico |
| Espacios Confinados           | Certificado Examen Práctico |
| Ambulancia                    | Certificado Examen Práctico |
| Perfolodos WS 1400            | Certificado Examen Práctico |
| Camión Ácido                  | Certificado Examen Práctico |
| Tracto Camión                 | Certificado Examen Práctico |
| Camión Catodos                | Certificado Examen Práctico |
| Camión 3/4                    | Certificado Examen Práctico |
| Camión Hidrolavador           | Certificado Examen Práctico |
| Camión Pluma Solo Camión      | Certificado Examen Práctico |
| Camión Tolva                  | Certificado Examen Práctico |
| Camión Rampla (plano)         | Certificado Examen Práctico |
| Camión Rotainer               | Certificado Examen Práctico |
| Camión Desobstructor          | Certificado Examen Práctico |
| Camioneta Combustible         | Certificado Examen Práctico |
| Camioneta Triple Cabina       | Certificado Examen Práctico |
| Furgon                        | Certificado Examen Práctico |
| Minibus                       | Certificado Examen Práctico |
| Camión De Sevicio             | Certificado Examen Práctico |
| Cama Baja Mack                | Certificado Examen Práctico |
| Camión Lubricador             | Certificado Examen Práctico |
| Camioneta Polvorinera         | Certificado Examen Práctico |
| Camioneta Rescate/Emergencia  | Certificado Examen Práctico |
| Vehículo Liviano              | Certificado Examen Práctico |
| Camión Caex 773               | Certificado Examen Práctico |
| Camión Caex 777               | Certificado Examen Práctico |
| Traslado Perforadora          | Certificado Examen Práctico |
| Traslado Palas                | Certificado Examen Práctico |
| Camión Extracción CAT 785C    | Certificado Examen Práctico |
| Camión Caex 789               | Certificado Examen Práctico |
| Camión Fábrica                | Certificado Examen Práctico |
| Camión Polvorín               | Certificado Examen Práctico |
| Camión Sonda                  | Certificado Examen Práctico |
| Camión Frontal CAT 992G       | Certificado Examen Práctico |
| Camión Frontal CAT 994F       | Certificado Examen Práctico |
| Excavadora Balde/Pica Roca    | Certificado Examen Práctico |
| Excavadoras PC 5500           | Certificado Examen Práctico |
| Manipulador De Neumáticos CF  | Certificado Examen Práctico |
| Manipulador De Neumáticos GH  | Certificado Examen Práctico |
| Motoniveladora CAT 16M        | Certificado Examen Práctico |
| Sonda                         | Certificado Examen Práctico |
| Tractor De Orugas             | Certificado Examen Práctico |
| Tractor De Ruedas             | Certificado Examen Práctico |
| Tapapozos                     | Certificado Examen Práctico |
| Wheeldozer CAT 834G           | Certificado Examen Práctico |
| Cargador WA900                | Certificado Examen Práctico |
| Camión Aljibe KOM 785 HD-7    | Certificado Examen Práctico |
| Welldozer WD900               | Certificado Examen Práctico |

### Actividades que requieren **Hoja de vida conductor**

| Actividad                     | Documentación requerida |
| ----------------------------- | ----------------------- |
| Camión Extracción KOM 830E-1  | Hoja de vida conductor  |
| Buses                         | Hoja de vida conductor  |
| Camión Ampliroll              | Hoja de vida conductor  |
| Camión Articulado Dumper      | Hoja de vida conductor  |
| Camión Aspirador Alto Vacio   | Hoja de vida conductor  |
| Camión Fosero                 | Hoja de vida conductor  |
| Camión Pluma Y Grua Pluma     | Hoja de vida conductor  |
| Cargador Frontal Otras Marcas | Hoja de vida conductor  |
| Grúa Horquilla                | Hoja de vida conductor  |
| Grúa Móvil                    | Hoja de vida conductor  |
| Manipulador Telescópico       | Hoja de vida conductor  |
| Minicargador                  | Hoja de vida conductor  |
| Perforadora MD6240            | Hoja de vida conductor  |
| Perforadora DM50              | Hoja de vida conductor  |
| Perforadora D755K             | Hoja de vida conductor  |
| Perforadora DMM2              | Hoja de vida conductor  |
| Retroexcavadoras              | Hoja de vida conductor  |
| Rodillo                       | Hoja de vida conductor  |
| Grúa Pluma Solo Grúa          | Hoja de vida conductor  |
| Grúa Puente                   | Hoja de vida conductor  |
| Martillo Pica Roca            | Hoja de vida conductor  |
| Rotopala / Spreader           | Hoja de vida conductor  |
| Camión Aljibe CAT 773E        | Hoja de vida conductor  |
| Camión Combustible            | Hoja de vida conductor  |
| Excavadora Balde/Pica Roca    | Hoja de vida conductor  |
| Ambulancia                    | Hoja de vida conductor  |
| Perfolodos WS 1400            | Hoja de vida conductor  |
| Camión Ácido                  | Hoja de vida conductor  |
| Tracto Camión                 | Hoja de vida conductor  |
| Camión Catodos                | Hoja de vida conductor  |
| Camión 3/4                    | Hoja de vida conductor  |
| Camión Hidrolavador           | Hoja de vida conductor  |
| Camión Pluma Solo Camión      | Hoja de vida conductor  |
| Camión Tolva                  | Hoja de vida conductor  |
| Camión Rampla (plano)         | Hoja de vida conductor  |
| Camión Rotainer               | Hoja de vida conductor  |
| Camión Desobstructor          | Hoja de vida conductor  |
| Camioneta Combustible         | Hoja de vida conductor  |
| Camioneta Triple Cabina       | Hoja de vida conductor  |
| Furgon                        | Hoja de vida conductor  |
| Minibus                       | Hoja de vida conductor  |
| Camión De Sevicio             | Hoja de vida conductor  |
| Cama Baja Mack                | Hoja de vida conductor  |
| Camión Lubricador             | Hoja de vida conductor  |
| Camioneta Polvorinera         | Hoja de vida conductor  |
| Camioneta Rescate/Emergencia  | Hoja de vida conductor  |
| Vehículo Liviano              | Hoja de vida conductor  |
| Camión Caex 773               | Hoja de vida conductor  |
| Camión Caex 777               | Hoja de vida conductor  |
| Traslado Perforadora          | Hoja de vida conductor  |
| Traslado Palas                | Hoja de vida conductor  |
| Camión Extracción CAT 785C    | Hoja de vida conductor  |
| Camión Caex 789               | Hoja de vida conductor  |
| Camión Fábrica                | Hoja de vida conductor  |
| Camión Polvorín               | Hoja de vida conductor  |
| Camión Sonda                  | Hoja de vida conductor  |
| Camión Frontal CAT 992G       | Hoja de vida conductor  |
| Camión Frontal CAT 994F       | Hoja de vida conductor  |
| Excavadora Balde/Pica Roca    | Hoja de vida conductor  |
| Excavadoras PC 5500           | Hoja de vida conductor  |
| Manipulador De Neumáticos CF  | Hoja de vida conductor  |
| Manipulador De Neumáticos GH  | Hoja de vida conductor  |
| Motoniveladora CAT 16M        | Hoja de vida conductor  |
| Sonda                         | Hoja de vida conductor  |
| Tractor De Orugas             | Hoja de vida conductor  |
| Tractor De Ruedas             | Hoja de vida conductor  |
| Tapapozos                     | Hoja de vida conductor  |
| Wheeldozer CAT 834G           | Hoja de vida conductor  |
| Cargador WA900                | Hoja de vida conductor  |
| Camión Aljibe KOM 785 HD-7    | Hoja de vida conductor  |
| Welldozer WD900               | Hoja de vida conductor  |

### Actividades que requieren **Certificado Curso Conducción a la defensiva**

| Actividad                     | Documentación requerida                     |
| ----------------------------- | ------------------------------------------- |
| Camión Extracción KOM 830E-1  | Certificado Curso Conducción a la defensiva |
| Buses                         | Certificado Curso Conducción a la defensiva |
| Camión Ampliroll              | Certificado Curso Conducción a la defensiva |
| Camión Articulado Dumper      | Certificado Curso Conducción a la defensiva |
| Camión Aspirador Alto Vacio   | Certificado Curso Conducción a la defensiva |
| Camión Fosero                 | Certificado Curso Conducción a la defensiva |
| Camión Pluma Y Grua Pluma     | Certificado Curso Conducción a la defensiva |
| Cargador Frontal Otras Marcas | Certificado Curso Conducción a la defensiva |
| Grúa Horquilla                | Certificado Curso Conducción a la defensiva |
| Grúa Móvil                    | Certificado Curso Conducción a la defensiva |
| Manipulador Telescópico       | Certificado Curso Conducción a la defensiva |
| Minicargador                  | Certificado Curso Conducción a la defensiva |
| Perforadora MD6240            | Certificado Curso Conducción a la defensiva |
| Perforadora DM50              | Certificado Curso Conducción a la defensiva |
| Perforadora D755K             | Certificado Curso Conducción a la defensiva |
| Perforadora DMM2              | Certificado Curso Conducción a la defensiva |
| Retroexcavadoras              | Certificado Curso Conducción a la defensiva |
| Rodillo                       | Certificado Curso Conducción a la defensiva |
| Ambulancia                    | Certificado Curso Conducción a la defensiva |
| Perfolodos WS 1400            | Certificado Curso Conducción a la defensiva |
| Camión Ácido                  | Certificado Curso Conducción a la defensiva |
| Tracto Camión                 | Certificado Curso Conducción a la defensiva |
| Camión Catodos                | Certificado Curso Conducción a la defensiva |
| Camión 3/4                    | Certificado Curso Conducción a la defensiva |
| Camión Combustible            | Certificado Curso Conducción a la defensiva |
| Excavadora Balde/Pica Roca    | Certificado Curso Conducción a la defensiva |
| Camión Hidrolavador           | Certificado Curso Conducción a la defensiva |
| Camión Pluma Solo Camión      | Certificado Curso Conducción a la defensiva |
| Camión Tolva                  | Certificado Curso Conducción a la defensiva |
| Camión Rampla (plano)         | Certificado Curso Conducción a la defensiva |
| Camión Rotainer               | Certificado Curso Conducción a la defensiva |
| Camión Desobstructor          | Certificado Curso Conducción a la defensiva |
| Camioneta Combustible         | Certificado Curso Conducción a la defensiva |
| Camioneta Triple Cabina       | Certificado Curso Conducción a la defensiva |
| Furgon                        | Certificado Curso Conducción a la defensiva |
| Minibus                       | Certificado Curso Conducción a la defensiva |
| Camión De Sevicio             | Certificado Curso Conducción a la defensiva |
| Cama Baja Mack                | Certificado Curso Conducción a la defensiva |
| Camión Lubricador             | Certificado Curso Conducción a la defensiva |
| Camioneta Polvorinera         | Certificado Curso Conducción a la defensiva |
| Camioneta Rescate/Emergencia  | Certificado Curso Conducción a la defensiva |
| Vehículo Liviano              | Certificado Curso Conducción a la defensiva |
| Camión Caex 773               | Certificado Curso Conducción a la defensiva |
| Camión Caex 777               | Certificado Curso Conducción a la defensiva |
| Traslado Perforadora          | Certificado Curso Conducción a la defensiva |
| Traslado Palas                | Certificado Curso Conducción a la defensiva |
| Camión Extracción CAT 785C    | Certificado Curso Conducción a la defensiva |
| Camión Caex 789               | Certificado Curso Conducción a la defensiva |
| Camión Fábrica                | Certificado Curso Conducción a la defensiva |
| Camión Polvorín               | Certificado Curso Conducción a la defensiva |
| Camión Sonda                  | Certificado Curso Conducción a la defensiva |
| Camión Frontal CAT 992G       | Certificado Curso Conducción a la defensiva |
| Camión Frontal CAT 994F       | Certificado Curso Conducción a la defensiva |
| Excavadora Balde/Pica Roca    | Certificado Curso Conducción a la defensiva |
| Excavadoras PC 5500           | Certificado Curso Conducción a la defensiva |
| Manipulador De Neumáticos CF  | Certificado Curso Conducción a la defensiva |
| Manipulador De Neumáticos GH  | Certificado Curso Conducción a la defensiva |
| Motoniveladora CAT 16M        | Certificado Curso Conducción a la defensiva |
| Sonda                         | Certificado Curso Conducción a la defensiva |
| Tractor De Orugas             | Certificado Curso Conducción a la defensiva |
| Tractor De Ruedas             | Certificado Curso Conducción a la defensiva |
| Tapapozos                     | Certificado Curso Conducción a la defensiva |
| Camión Aljibe CAT 773E        | Certificado Curso Conducción a la defensiva |
| Wheeldozer CAT 834G           | Certificado Curso Conducción a la defensiva |
| Cargador WA900                | Certificado Curso Conducción a la defensiva |
| Camión Aljibe KOM 785 HD-7    | Certificado Curso Conducción a la defensiva |
| Welldozer WD900               | Certificado Curso Conducción a la defensiva |

### Actividades que requieren **Curso Específico Equipo que va a Operar**

| Actividad                     | Documentación requerida                 |
| ----------------------------- | --------------------------------------- |
| Uso Cuchillo OLFA             | Curso Específico Equipo que va a Operar |
| Grua Portal                   | Curso Específico Equipo que va a Operar |
| Camión Extracción KOM 830E-1  | Curso Específico Equipo que va a Operar |
| Buses                         | Curso Específico Equipo que va a Operar |
| Camión Ampliroll              | Curso Específico Equipo que va a Operar |
| Camión Articulado Dumper      | Curso Específico Equipo que va a Operar |
| Camión Aspirador Alto Vacio   | Curso Específico Equipo que va a Operar |
| Camión Fosero                 | Curso Específico Equipo que va a Operar |
| Camión Pluma Y Grua Pluma     | Curso Específico Equipo que va a Operar |
| Cargador Frontal Otras Marcas | Curso Específico Equipo que va a Operar |
| Grúa Horquilla                | Curso Específico Equipo que va a Operar |
| Grúa Móvil                    | Curso Específico Equipo que va a Operar |
| Manipulador Telescópico       | Curso Específico Equipo que va a Operar |
| Minicargador                  | Curso Específico Equipo que va a Operar |
| Perforadora MD6240            | Curso Específico Equipo que va a Operar |
| Perforadora DM50              | Curso Específico Equipo que va a Operar |
| Perforadora D755K             | Curso Específico Equipo que va a Operar |
| Perforadora DMM2              | Curso Específico Equipo que va a Operar |
| Retroexcavadoras              | Curso Específico Equipo que va a Operar |
| Rodillo                       | Curso Específico Equipo que va a Operar |
| Grúa Pluma Solo Grúa          | Curso Específico Equipo que va a Operar |
| Grúa Puente                   | Curso Específico Equipo que va a Operar |
| Martillo Pica Roca            | Curso Específico Equipo que va a Operar |
| Rotopala / Spreader           | Curso Específico Equipo que va a Operar |
| Camión Aljibe CAT 773E        | Curso Específico Equipo que va a Operar |
| Excavadora Balde/Pica Roca    | Curso Específico Equipo que va a Operar |
| Camión Caex 773               | Curso Específico Equipo que va a Operar |
| Camión Caex 777               | Curso Específico Equipo que va a Operar |
| Traslado Perforadora          | Curso Específico Equipo que va a Operar |
| Traslado Palas                | Curso Específico Equipo que va a Operar |
| Camión Extracción CAT 785C    | Curso Específico Equipo que va a Operar |
| Camión Caex 789               | Curso Específico Equipo que va a Operar |
| Camión Fábrica                | Curso Específico Equipo que va a Operar |
| Camión Polvorín               | Curso Específico Equipo que va a Operar |
| Camión Sonda                  | Curso Específico Equipo que va a Operar |
| Camión Frontal CAT 992G       | Curso Específico Equipo que va a Operar |
| Camión Frontal CAT 994F       | Curso Específico Equipo que va a Operar |
| Excavadora Balde/Pica Roca    | Curso Específico Equipo que va a Operar |
| Excavadoras PC 5500           | Curso Específico Equipo que va a Operar |
| Manipulador De Neumáticos CF  | Curso Específico Equipo que va a Operar |
| Manipulador De Neumáticos GH  | Curso Específico Equipo que va a Operar |
| Motoniveladora CAT 16M        | Curso Específico Equipo que va a Operar |
| Sonda                         | Curso Específico Equipo que va a Operar |
| Tractor De Orugas             | Curso Específico Equipo que va a Operar |
| Tractor De Ruedas             | Curso Específico Equipo que va a Operar |
| Tapapozos                     | Curso Específico Equipo que va a Operar |
| Wheeldozer CAT 834G           | Curso Específico Equipo que va a Operar |
| Cargador WA900                | Curso Específico Equipo que va a Operar |
| Camión Aljibe KOM 785 HD-7    | Curso Específico Equipo que va a Operar |
| Welldozer WD900               | Curso Específico Equipo que va a Operar |

### Actividades que requieren **Curso Específico Actividad que va a Realizar**

| Actividad                          | Documentación requerida                      |
| ---------------------------------- | -------------------------------------------- |
| Alzahombre                         | Curso Específico Actividad que va a Realizar |
| Equipo Radiactivo 1era, 2da Y 3era | Curso Específico Actividad que va a Realizar |
| Espacios Confinados                | Curso Específico Actividad que va a Realizar |
| Armador De Andamio                 | Curso Específico Actividad que va a Realizar |
| Autorizado Para Bloquear           | Curso Específico Actividad que va a Realizar |
| Rigger                             | Curso Específico Actividad que va a Realizar |
| Soldador                           | Curso Específico Actividad que va a Realizar |

### Actividades que requieren **Capacitación teórica práctica - Zona Roja**

| Actividad                    | Documentación requerida                   |
| ---------------------------- | ----------------------------------------- |
| Camión Extracción KOM 830E-1 | Capacitación teórica práctica - Zona Roja |
| Cama Baja Mack               | Capacitación teórica práctica - Zona Roja |
| Camión Lubricador            | Capacitación teórica práctica - Zona Roja |
| Camioneta Polvorinera        | Capacitación teórica práctica - Zona Roja |
| Camioneta Rescate/Emergencia | Capacitación teórica práctica - Zona Roja |
| Vehículo Liviano             | Capacitación teórica práctica - Zona Roja |
| Camión Caex 773              | Capacitación teórica práctica - Zona Roja |
| Camión Caex 777              | Capacitación teórica práctica - Zona Roja |
| Traslado Perforadora         | Capacitación teórica práctica - Zona Roja |
| Traslado Palas               | Capacitación teórica práctica - Zona Roja |
| Camión Extracción CAT 785C   | Capacitación teórica práctica - Zona Roja |
| Camión Caex 789              | Capacitación teórica práctica - Zona Roja |
| Camión Fábrica               | Capacitación teórica práctica - Zona Roja |
| Camión Polvorín              | Capacitación teórica práctica - Zona Roja |
| Camión Sonda                 | Capacitación teórica práctica - Zona Roja |
| Camión Frontal CAT 992G      | Capacitación teórica práctica - Zona Roja |
| Camión Frontal CAT 994F      | Capacitación teórica práctica - Zona Roja |
| Excavadora Balde/Pica Roca   | Capacitación teórica práctica - Zona Roja |
| Excavadoras PC 5500          | Capacitación teórica práctica - Zona Roja |
| Manipulador De Neumáticos CF | Capacitación teórica práctica - Zona Roja |
| Manipulador De Neumáticos GH | Capacitación teórica práctica - Zona Roja |
| Motoniveladora CAT 16M       | Capacitación teórica práctica - Zona Roja |
| Sonda                        | Capacitación teórica práctica - Zona Roja |
| Tractor De Orugas            | Capacitación teórica práctica - Zona Roja |
| Tractor De Ruedas            | Capacitación teórica práctica - Zona Roja |
| Tapapozos                    | Capacitación teórica práctica - Zona Roja |
| Camión Aljibe CAT 773E       | Capacitación teórica práctica - Zona Roja |
| Camión Combustible           | Capacitación teórica práctica - Zona Roja |
| Wheeldozer CAT 834G          | Capacitación teórica práctica - Zona Roja |
| Cargador WA900               | Capacitación teórica práctica - Zona Roja |
| Camión Aljibe KOM 785 HD-7   | Capacitación teórica práctica - Zona Roja |
| Welldozer WD900              | Capacitación teórica práctica - Zona Roja |

### Actividades que requieren **Licencia de Manipulador de Explosivos**

| Actividad       | Documentación requerida               |
| --------------- | ------------------------------------- |
| Camión Fábrica  | Licencia de Manipulador de Explosivos |
| Camión Polvorín | Licencia de Manipulador de Explosivos |
| Tapapozos       | Licencia de Manipulador de Explosivos |

### Actividades que requieren **DS 160 Curso Sustancia Peligrosa**

| Actividad          | Documentación requerida          |
| ------------------ | -------------------------------- |
| Camión Combustible | DS 160 Curso Sustancia Peligrosa |

### Actividades que requieren **Certificado Médico Trabajo Altura Física**

| Actividad          | Documentación requerida                  |
| ------------------ | ---------------------------------------- |
| Armador De Andamio | Certificado Médico Trabajo Altura Física |

## Notas y requisitos adicionales por actividad

> Este apartado detalla requisitos, cursos, exámenes y observaciones específicas que deben cumplirse antes de adjuntar la documentación para cada actividad.

<!-- INICIO DE NOTAS GENERADAS AUTOMÁTICAMENTE -->

---

## Revisión técnica y sugerencias de mejoras pendientes

### Resumen de análisis del modelo y requisitos

- El sistema actual modela correctamente las entidades principales: **Actividad**, **Documentación**, la relación **ActivityDocumentation**, **Zona** y **application**.
- Se implementaron formularios y lógica backend para crear, editar y eliminar actividades y documentación.
- Se eliminaron los campos de expiración en la documentación, simplificando el modelo.
- El archivo **ACTIVIDADES-REQUISITOS.md** contiene la lista de actividades, tipos de documentación y las tablas de relación, además de notas y requisitos adicionales.
- Se automatizó la generación de tablas de requisitos y la limpieza de columnas innecesarias.

#### Posibles mejoras y campos/tablas faltantes

- **Usuarios y roles**: Falta modelar explícitamente los usuarios (trabajadores) y sus roles/acreditaciones individuales.
- **Estado de acreditación**: No existe una tabla/relación para registrar el estado de acreditación de cada trabajador respecto a cada actividad/documento (pendiente, aprobado, rechazado, vencido, etc.).
- **Historial y auditoría**: No se almacena el historial de cambios, renovaciones o rechazos de acreditaciones/documentos.
- **Adjuntos/archivos**: No hay un modelo para almacenar los archivos adjuntos (PDF, imágenes) de los documentos subidos por los usuarios.
- **Vigencia y fechas**: Si bien se eliminó la expiración global, podría ser útil registrar fechas de emisión/vencimiento específicas para ciertos documentos.
- **Observaciones y comentarios**: No hay un campo estructurado para observaciones/comentarios por acreditación o documento.
- **Validaciones automáticas**: No se han implementado validaciones automáticas de requisitos cruzados (por ejemplo, antigüedad mínima, cursos previos, etc.).
- **Notificaciones**: No existe lógica para alertar sobre vencimientos o requisitos próximos a vencer.
- **Zonas y restricciones**: El modelo de zonas existe, pero no se detalla cómo se relaciona con actividades/documentos/acreditaciones.
- **Configuración dinámica**: No hay un sistema para parametrizar requisitos que puedan cambiar sin migraciones (por ejemplo, agregar/quitar documentación requerida por actividad desde el panel de admin).

---

## TODO (pendiente de implementación y mejoras sugeridas)

- [ ] Modelar la entidad **Usuario** y su relación con actividades/acreditaciones.
- [ ] Crear tabla de **Acreditación** (o similar) para registrar el estado de cada trabajador respecto a cada actividad/documento.
- [ ] Agregar historial/auditoría de cambios y renovaciones de acreditaciones/documentos.
- [ ] Implementar almacenamiento y gestión de archivos adjuntos (documentos subidos).
- [ ] Permitir registrar fechas de emisión/vencimiento por documento/acreditación cuando aplique.
- [ ] Añadir campo de observaciones/comentarios en acreditaciones y documentos.
- [ ] Implementar validaciones automáticas de requisitos (antigüedad, cursos previos, etc.).
- [ ] Desarrollar sistema de notificaciones para vencimientos y requisitos próximos a vencer.
- [ ] Relacionar zonas con actividades/documentos/acreditaciones de forma explícita.
- [ ] Permitir configuración dinámica de requisitos desde el panel de administración.
- [ ] Mejorar la experiencia de usuario para la gestión individual de acreditaciones.
- [ ] Documentar flujos de acreditación y casos de uso en este archivo.

---

### Notas: Espacios Confinados

- Certificado Médico para Espacios Confinados
- Curso específico para la actividad que va a realizar

### Notas: Lainera

- Examen Sicosensotécnico Anual \*

### Notas: Thunderbolt

- Examen Sicosensotécnico Anual \*

### Notas: Alzahombres(PTA) Manlif

- Examen Práctico.(Solo la primera vez)
- Curso específico para la actividad que va a realizar (vigencia 4 años)

### Notas: Equipo Radiactivo 1era, 2da y 3era

- Examen Práctico.(Solo la primera vez)
- Curso específico para la actividad que va a realizar (vigencia 4 años)

### Notas: Ambulancia

- Antigüedad mínima 18 meses
- Examen Sicosensotécnico Anual _
  (_ Certificado emitido por institución reconocida por MC. Ver Instructivo específico.)
- Examen Práctico.(Solo la primera vez)
- No tener faltas con suspensión de licencia municipal en últimos 12 meses. Para la suspenciones mas antiguas presentar Carta de Compromiso.
- Curso de Conducción a la Defensiva cargado en Webcontrol.

### Notas: Perfolodos WS 1400

- Antigüedad mínima 18 meses
- Examen Sicosensotécnico Anual _
  (_ Certificado emitido por institución reconocida por MC. Ver Instructivo específico.)
- Examen Práctico.(Solo la primera vez)
- No tener faltas con suspensión de licencia municipal en últimos 12 meses. Para la suspenciones mas antiguas presentar Carta de Compromiso.
- Curso de Conducción a la Defensiva cargado en Webcontrol.

### Notas: Armador de Andamios

- Curso específico para la actividad que va a realizar (vigencia 4 años)
- Certificado Médico acreditando aptitud para trabajo en altura física

### Notas: Autorizado para Bloquear

- Curso específico para la actividad que va a realizar (vigencia 4 años)

### Notas: Buses

- Transporte pasajeros > 17 ocupantes. Lic A3 (Ley 19495) o A1 (ley 18290)
- Antigüedad mínima 18 meses
- Sicosensotécnico: Cada 1 año. Certificado emitido por institución reconocida por MC. Ver Instructivo específico.
- Examen Práctico.(Solo la primera vez)
- No tener faltas con suspensión de licencia municipal en últimos 12 meses.
  Para la suspenciones mas antiguas presentar Carta de Compromiso.
- Curso de Conducción a la Defensiva cargado en Webcontrol.
- Curso específico para el equipo que va a operar (vigencia 4 años )

### Notas: Camión Ácido

- Antigüedad mínima 18 meses
- Sicosensotécnico: Cada 1 año. Certificado emitido por institución reconocida por MC. Ver Instructivo específico.
- Examen Práctico.(Solo la primera vez)
- No tener faltas con suspensión de licencia municipal en últimos 12 meses. Para la suspenciones mas antiguas presentar Carta de Compromiso.
- Curso de Conducción a la Defensiva cargado en Webcontrol.

### Notas: Camión Aljibe Agua CAT 773

- Antigüedad mínima 18 meses
- Sicosensotécnico: Cada 1 año. Certificado emitido por institución reconocida por MC. Ver Instructivo específico.
- Examen Práctico.(Solo la primera vez)
- No tener faltas con suspensión de licencia municipal en últimos 12 meses. Para la suspenciones mas antiguas presentar Carta de Compromiso.
- Curso de Conducción a la Defensiva cargado en Webcontrol.
- Capacitación teórica práctica realizada por Gerencia Mina si equipo operará en Zona Roja.
- Curso específico para el equipo que va a operar (vigencia 4 años )

### Notas: Camion Aljibe

- Antigüedad mínima 18 meses
- Sicosensotécnico: Cada 1 año. Certificado emitido por institución reconocida por MC. Ver Instructivo específico.
- Examen Práctico.(Solo la primera vez)
- No tener faltas con suspensión de licencia municipal en últimos 12 meses. Para la suspenciones mas antiguas presentar Carta de Compromiso.
- Curso de Conducción a la Defensiva cargado en Webcontrol.

### Notas: Tracto Camión

- Antigüedad mínima 18 meses
- Sicosensotécnico: Cada 1 año. Certificado emitido por institución reconocida por MC. Ver Instructivo específico.
- Examen Práctico.(Solo la primera vez)
- No tener faltas con suspensión de licencia municipal en últimos 12 meses. Para la suspenciones mas antiguas presentar Carta de Compromiso.
- Curso de Conducción a la Defensiva cargado en Webcontrol.

### Notas: Camión Ampliroll

- Antigüedad mínima 18 meses
- Sicosensotécnico: Cada 1 año. Certificado emitido por institución reconocida por MC. Ver Instructivo específico.
- Examen Práctico.(Solo la primera vez)
- No tener faltas con suspensión de licencia municipal en últimos 12 meses. Para la suspenciones mas antiguas presentar Carta de Compromiso.
- Curso de Conducción a la Defensiva cargado en Webcontrol.
- Curso específico para el equipo que va a operar (vigencia 4 años )

### Notas: Camión Articulado Dumper

- Antigüedad mínima 18 meses
- Sicosensotécnico: Cada 1 año. Certificado emitido por institución reconocida por MC. Ver Instructivo específico.
- Examen Práctico.(Solo la primera vez)
- No tener faltas con suspensión de licencia municipal en últimos 12 meses. Para la suspenciones mas antiguas presentar Carta de Compromiso.
- Curso de Conducción a la Defensiva cargado en Webcontrol.
- Curso específico para el equipo que va a operar (vigencia 4 años )

### Notas: Camión Aspirador alto vacio

- Antigüedad mínima 18 meses
- Sicosensotécnico: Cada 1 año. Certificado emitido por institución reconocida por MC. Ver Instructivo específico.
- Examen Práctico.(Solo la primera vez)
- No tener faltas con suspensión de licencia municipal en últimos 12 meses. Para la suspenciones mas antiguas presentar Carta de Compromiso.
- Curso de Conducción a la Defensiva cargado en Webcontrol.
- Curso específico para el equipo que va a operar (vigencia 4 años )

### Notas: Camión Cama Baja

- Antigüedad mínima 18 meses
- Sicosensotécnico: Cada 1 año. Certificado emitido por institución reconocida por MC. Ver Instructivo específico.
- Examen Práctico.(Solo la primera vez)
- No tener faltas con suspensión de licencia municipal en últimos 12 meses. Para la suspenciones mas antiguas presentar Carta de Compromiso.
- Curso de Conducción a la Defensiva cargado en Webcontrol.
- Capacitación teórica práctica realizada por Gerencia Mina si equipo operará en Zona Roja.

### Notas: Camión Combustible

- Antigüedad mínima 18 meses
- Sicosensotécnico: Cada 1 año. Certificado emitido por institución reconocida por MC. Ver Instructivo específico.
- Examen Práctico.(Solo la primera vez)
- No tener faltas con suspensión de licencia municipal en últimos 12 meses. Para la suspenciones mas antiguas presentar Carta de Compromiso.
- Curso de Conducción a la Defensiva cargado en Webcontrol.
- Capacitación teórica práctica realizada por Gerencia Mina si equipo operará en Zona Roja.
- DS 160 Curso de Sustancias Peligrosas emitido por Carabineros, Automovil Club, otras.

### Notas: Camion Catodos

- Antigüedad mínima 18 meses
- Sicosensotécnico: Cada 1 año. Certificado emitido por institución reconocida por MC. Ver Instructivo específico.
- Examen Práctico.(Solo la primera vez)
- No tener faltas con suspensión de licencia municipal en últimos 12 meses. Para la suspenciones mas antiguas presentar Carta de Compromiso.
- Curso de Conducción a la Defensiva cargado en Webcontrol.

### Notas: Camion 3/4

- Antigüedad mínima 18 meses
- Sicosensotécnico: Cada 1 año. Certificado emitido por institución reconocida por MC. Ver Instructivo específico.
- Examen Práctico.(Solo la primera vez)
- No tener faltas con suspensión de licencia municipal en últimos 12 meses. Para la suspenciones mas antiguas presentar Carta de Compromiso.
- Curso de Conducción a la Defensiva cargado en Webcontrol.

### Notas: Camión de Extracción 773

- Antigüedad mínima 18 meses
- Sicosensotécnico: Cada 1 año. Certificado emitido por institución reconocida por MC. Ver Instructivo específico.
- Examen Práctico.(Solo la primera vez)
- No tener faltas con suspensión de licencia municipal en últimos 12 meses. Para la suspenciones mas antiguas presentar Carta de Compromiso.
- Curso de Conducción a la Defensiva cargado en Webcontrol.
- Capacitación teórica práctica realizada por Gerencia Mina si equipo operará en Zona Roja.
- Curso específico para el equipo que va a operar (vigencia 4 años )

### Notas: Camión de Extracción 777

- Antigüedad mínima 18 meses
- Sicosensotécnico: Cada 1 año. Certificado emitido por institución reconocida por MC. Ver Instructivo específico.
- Examen Práctico.(Solo la primera vez)
- No tener faltas con suspensión de licencia municipal en últimos 12 meses. Para la suspenciones mas antiguas presentar Carta de Compromiso.
- Curso de Conducción a la Defensiva cargado en Webcontrol.
- Capacitación teórica práctica realizada por Gerencia Mina si equipo operará en Zona Roja.
- Curso específico para el equipo que va a operar (vigencia 4 años )

### Notas: Traslado Perforadora

- Antigüedad mínima 18 meses
- Sicosensotécnico: Cada 1 año. Certificado emitido por institución reconocida por MC. Ver Instructivo específico.
- Examen Práctico.(Solo la primera vez)
- No tener faltas con suspensión de licencia municipal en últimos 12 meses. Para la suspenciones mas antiguas presentar Carta de Compromiso.
- Curso de Conducción a la Defensiva cargado en Webcontrol.
- Capacitación teórica práctica realizada por Gerencia Mina si equipo operará en Zona Roja.
- Curso específico para el equipo que va a operar (vigencia 4 años )

### Notas: Traslado Palas

- Antigüedad mínima 18 meses
- Sicosensotécnico: Cada 1 año. Certificado emitido por institución reconocida por MC. Ver Instructivo específico.
- Examen Práctico.(Solo la primera vez)
- No tener faltas con suspensión de licencia municipal en últimos 12 meses. Para la suspenciones mas antiguas presentar Carta de Compromiso.
- Curso de Conducción a la Defensiva cargado en Webcontrol.
- Capacitación teórica práctica realizada por Gerencia Mina si equipo operará en Zona Roja.
- Curso específico para el equipo que va a operar (vigencia 4 años )

### Notas: Camión de Extracción 785

- Antigüedad mínima 18 meses
- Sicosensotécnico: Cada 1 año. Certificado emitido por institución reconocida por MC. Ver Instructivo específico.
- Examen Práctico.(Solo la primera vez)
- No tener faltas con suspensión de licencia municipal en últimos 12 meses. Para la suspenciones mas antiguas presentar Carta de Compromiso.
- Curso de Conducción a la Defensiva cargado en Webcontrol.
- Capacitación teórica práctica realizada por Gerencia Mina si equipo operará en Zona Roja.
- Curso específico para el equipo que va a operar (vigencia 4 años )

### Notas: Camión de Extracción 789

- Antigüedad mínima 18 meses
- Sicosensotécnico: Cada 1 año. Certificado emitido por institución reconocida por MC. Ver Instructivo específico.
- Examen Práctico.(Solo la primera vez)
- No tener faltas con suspensión de licencia municipal en últimos 12 meses. Para la suspenciones mas antiguas presentar Carta de Compromiso.
- Curso de Conducción a la Defensiva cargado en Webcontrol.
- Capacitación teórica práctica realizada por Gerencia Mina si equipo operará en Zona Roja.
- Curso específico para el equipo que va a operar (vigencia 4 años )

### Notas: Camión de Extracción Komatsu 830

- Antigüedad mínima 18 meses
- Sicosensotécnico: Cada 1 año. Certificado emitido por institución reconocida por MC. Ver Instructivo específico.
- Examen Práctico.(Solo la primera vez)
- No tener faltas con suspensión de licencia municipal en últimos 12 meses. Para la suspenciones mas antiguas presentar Carta de Compromiso.
- Curso de Conducción a la Defensiva cargado en Webcontrol.
- Capacitación teórica práctica realizada por Gerencia Mina si equipo operará en Zona Roja.
- Curso específico para el equipo que va a operar (vigencia 4 años )

### Notas: Camión Fábrica

- Antigüedad mínima 18 meses
- Sicosensotécnico: Cada 1 año. Certificado emitido por institución reconocida por MC. Ver Instructivo específico.
- Examen Práctico.(Solo la primera vez)
- No tener faltas con suspensión de licencia municipal en últimos 12 meses. Para la suspenciones mas antiguas presentar Carta de Compromiso.
- Curso de Conducción a la Defensiva cargado en Webcontrol.
- Capacitación teórica práctica realizada por Gerencia Mina si equipo operará en Zona Roja.
- Curso específico para el equipo que va a operar (vigencia 4 años )
- Licencia de Manipulador de Explosivos

### Notas: Camión Fosero

- Antigüedad mínima 18 meses
- Sicosensotécnico: Cada 1 año. Certificado emitido por institución reconocida por MC. Ver Instructivo específico.
- Examen Práctico.(Solo la primera vez)
- No tener faltas con suspensión de licencia municipal en últimos 12 meses. Para la suspenciones mas antiguas presentar Carta de Compromiso.
- Curso de Conducción a la Defensiva cargado en Webcontrol.
- Curso específico para el equipo que va a operar (vigencia 4 años )

### Notas: Camión Hidrolavador

- Antigüedad mínima 18 meses
- Sicosensotécnico: Cada 1 año. Certificado emitido por institución reconocida por MC. Ver Instructivo específico.
- Examen Práctico.(Solo la primera vez)
- No tener faltas con suspensión de licencia municipal en últimos 12 meses. Para la suspenciones mas antiguas presentar Carta de Compromiso.
- Curso de Conducción a la Defensiva cargado en Webcontrol.

### Notas: Camión Lubricador

- Antigüedad mínima 18 meses
- Sicosensotécnico: Cada 1 año. Certificado emitido por institución reconocida por MC. Ver Instructivo específico.
- Examen Práctico.(Solo la primera vez)
- No tener faltas con suspensión de licencia municipal en últimos 12 meses. Para la suspenciones mas antiguas presentar Carta de Compromiso.
- Curso de Conducción a la Defensiva cargado en Webcontrol.
- Capacitación teórica práctica realizada por Gerencia Mina si equipo operará en Zona Roja.

### Notas: Camión Pluma solo camión

- Antigüedad mínima 18 meses
- Sicosensotécnico: Cada 1 año. Certificado emitido por institución reconocida por MC. Ver Instructivo específico.
- Examen Práctico.(Solo la primera vez)
- No tener faltas con suspensión de licencia municipal en últimos 12 meses. Para la suspenciones mas antiguas presentar Carta de Compromiso.
- Curso de Conducción a la Defensiva cargado en Webcontrol.

### Notas: Camión Pluma y grua pluma

- Antigüedad mínima 18 meses
- Sicosensotécnico: Cada 1 año. Certificado emitido por institución reconocida por MC. Ver Instructivo específico.
- Examen Práctico.(Solo la primera vez)
- No tener faltas con suspensión de licencia municipal en últimos 12 meses. Para la suspenciones mas antiguas presentar Carta de Compromiso.
- Curso de Conducción a la Defensiva cargado en Webcontrol.
- Curso específico para el equipo que va a operar (vigencia 4 años )

### Notas: Camión Polvorín

- Antigüedad mínima 18 meses
- Sicosensotécnico: Cada 1 año. Certificado emitido por institución reconocida por MC. Ver Instructivo específico.
- Examen Práctico.(Solo la primera vez)
- No tener faltas con suspensión de licencia municipal en últimos 12 meses. Para la suspenciones mas antiguas presentar Carta de Compromiso.
- Curso de Conducción a la Defensiva cargado en Webcontrol.
- Capacitación teórica práctica realizada por Gerencia Mina si equipo operará en Zona Roja.
- Curso específico para el equipo que va a operar (vigencia 4 años )
- Licencia de Manipulador de Explosivos

### Notas: Camión de Servicio

- Camion plataforma, camion de carga en general sin especificacion
- Antigüedad mínima 18 meses
- Sicosensotécnico: Cada 1 año. Certificado emitido por institución reconocida por MC. Ver Instructivo específico.
- Examen Práctico.(Solo la primera vez)
- No tener faltas con suspensión de licencia municipal en últimos 12 meses. Para la suspenciones mas antiguas presentar Carta de Compromiso.
- Curso de Conducción a la Defensiva cargado en Webcontrol.

### Notas: Camión Sonda

- Antigüedad mínima 18 meses
- Sicosensotécnico: Cada 1 año. Certificado emitido por institución reconocida por MC. Ver Instructivo específico.
- Examen Práctico.(Solo la primera vez)
- No tener faltas con suspensión de licencia municipal en últimos 12 meses. Para la suspenciones mas antiguas presentar Carta de Compromiso.
- Curso de Conducción a la Defensiva cargado en Webcontrol.
- Capacitación teórica práctica realizada por Gerencia Mina si equipo operará en Zona Roja.
- Curso específico para el equipo que va a operar (vigencia 4 años )

### Notas: Camión Tolva

- Camion plataforma, camion de carga en general sin especificacion
- Antigüedad mínima 18 meses
- Sicosensotécnico: Cada 1 año. Certificado emitido por institución reconocida por MC. Ver Instructivo específico.
- Examen Práctico.(Solo la primera vez)
- No tener faltas con suspensión de licencia municipal en últimos 12 meses. Para la suspenciones mas antiguas presentar Carta de Compromiso.
- Curso de Conducción a la Defensiva cargado en Webcontrol.

### Notas: Camioneta Combustible

- Antigüedad mínima 18 meses
- Sicosensotécnico: Cada 4 años. Certificado emitido por institución reconocida por MC. Ver Instructivo específico.
- Examen Práctico.(Solo la primera vez)
- No tener faltas con suspensión de licencia municipal en últimos 12 meses. Para la suspenciones mas antiguas presentar Carta de Compromiso.
- Curso de Conducción a la Defensiva cargado en Webcontrol.

### Notas: Camioneta Polvorinera

- Antigüedad mínima 18 meses
- Sicosensotécnico: Cada 4 años. Certificado emitido por institución reconocida por MC. Ver Instructivo específico.
- Examen Práctico.(Solo la primera vez)
- No tener faltas con suspensión de licencia municipal en últimos 12 meses. Para la suspenciones mas antiguas presentar Carta de Compromiso.
- Curso de Conducción a la Defensiva cargado en Webcontrol.
- Capacitación teórica práctica realizada por Gerencia Mina si equipo operará en Zona Roja.

### Notas: Camioneta Rescate/Emergencia

- Antigüedad mínima 18 meses
- Sicosensotécnico: Cada 4 años. Certificado emitido por institución reconocida por MC. Ver Instructivo específico.
- Examen Práctico.(Solo la primera vez)
- No tener faltas con suspensión de licencia municipal en últimos 12 meses. Para la suspenciones mas antiguas presentar Carta de Compromiso.
- Curso de Conducción a la Defensiva cargado en Webcontrol.
- Capacitación teórica práctica realizada por Gerencia Mina si equipo operará en Zona Roja.

### Notas: Camioneta Triple Cabina

- Antigüedad mínima 18 meses
- Sicosensotécnico: Cada 4 años. Certificado emitido por institución reconocida por MC. Ver Instructivo específico.
- Examen Práctico.(Solo la primera vez)
- No tener faltas con suspensión de licencia municipal en últimos 12 meses. Para la suspenciones mas antiguas presentar Carta de Compromiso.
- Curso de Conducción a la Defensiva cargado en Webcontrol.

### Notas: Cargador Frontal 992

- Antigüedad mínima 18 meses
- Sicosensotécnico: Cada 1 año. Certificado emitido por institución reconocida por MC. Ver Instructivo específico.
- Examen Práctico.(Solo la primera vez)
- No tener faltas con suspensión de licencia municipal en últimos 12 meses. Para la suspenciones mas antiguas presentar Carta de Compromiso.
- Curso de Conducción a la Defensiva cargado en Webcontrol.
- Capacitación teórica práctica realizada por Gerencia Mina si equipo operará en Zona Roja.
- Curso específico para el equipo que va a operar (vigencia 4 años )

### Notas: Cargador Frontal 994

- Antigüedad mínima 18 meses
- Sicosensotécnico: Cada 1 año. Certificado emitido por institución reconocida por MC. Ver Instructivo específico.
- Examen Práctico.(Solo la primera vez)
- No tener faltas con suspensión de licencia municipal en últimos 12 meses. Para la suspenciones mas antiguas presentar Carta de Compromiso.
- Curso de Conducción a la Defensiva cargado en Webcontrol.
- Capacitación teórica práctica realizada por Gerencia Mina si equipo operará en Zona Roja.
- Curso específico para el equipo que va a operar (vigencia 4 años )

### Notas: Cargador Frontal otras marcas

- Antigüedad mínima 18 meses
- Sicosensotécnico: Cada 1 año. Certificado emitido por institución reconocida por MC. Ver Instructivo específico.
- Examen Práctico.(Solo la primera vez)
- No tener faltas con suspensión de licencia municipal en últimos 12 meses. Para la suspenciones mas antiguas presentar Carta de Compromiso.
- Curso de Conducción a la Defensiva cargado en Webcontrol.
- Curso específico para el equipo que va a operar (vigencia 4 años )

### Notas: Excadora Balde/Pica Roca

- Antigüedad mínima 18 meses
- Sicosensotécnico: Cada 1 año. Certificado emitido por institución reconocida por MC. Ver Instructivo específico.
- Examen Práctico.(Solo la primera vez)
- No tener faltas con suspensión de licencia municipal en últimos 12 meses. Para la suspenciones mas antiguas presentar Carta de Compromiso.
- Curso de Conducción a la Defensiva cargado en Webcontrol.
- Capacitación teórica práctica realizada por Gerencia Mina si equipo operará en Zona Roja.
- Curso específico para el equipo que va a operar (vigencia 4 años )

### Notas: Excadora PC 5500

- Antigüedad mínima 18 meses
- Sicosensotécnico: Cada 1 año. Certificado emitido por institución reconocida por MC. Ver Instructivo específico.
- Examen Práctico.(Solo la primera vez)
- No tener faltas con suspensión de licencia municipal en últimos 12 meses. Para la suspenciones mas antiguas presentar Carta de Compromiso.
- Curso de Conducción a la Defensiva cargado en Webcontrol.
- Capacitación teórica práctica realizada por Gerencia Mina si equipo operará en Zona Roja.
- Curso específico para el equipo que va a operar (vigencia 4 años )

### Notas: Furgon

- Transporte de pasajeros hasta 9 ocupantes. Lic A3 - A2 Ley 19495 o A1 (Ley 18290)
- Antigüedad mínima 18 meses
- Sicosensotécnico: Cada 4 años. Certificado emitido por institución reconocida por MC. Ver Instructivo específico.
- Examen Práctico.(Solo la primera vez)
- No tener faltas con suspensión de licencia municipal en últimos 12 meses. Para la suspenciones mas antiguas presentar Carta de Compromiso.
- Curso de Conducción a la Defensiva cargado en Webcontrol.

### Notas: Grua Horquilla

- Antigüedad mínima 18 meses
- Sicosensotécnico: Cada 1 año. Certificado emitido por institución reconocida por MC. Ver Instructivo específico.
- Examen Práctico.(Solo la primera vez)
- No tener faltas con suspensión de licencia municipal en últimos 12 meses. Para la suspenciones mas antiguas presentar Carta de Compromiso.
- Curso de Conducción a la Defensiva cargado en Webcontrol.
- Curso específico para el equipo que va a operar (vigencia 4 años )

### Notas: Grua Móvil

- Antigüedad mínima 18 meses
- Sicosensotécnico: Cada 1 año. Certificado emitido por institución reconocida por MC. Ver Instructivo específico.
- Examen Práctico.(Solo la primera vez)
- No tener faltas con suspensión de licencia municipal en últimos 12 meses. Para la suspenciones mas antiguas presentar Carta de Compromiso.
- Curso de Conducción a la Defensiva cargado en Webcontrol.
- Curso específico para el equipo que va a operar (vigencia 4 años )

### Notas: Grúa Pluma solo grúa

- Sicosensotécnico: Cada 4 años. Certificado emitido por institución reconocida por MC. Ver Instructivo específico.
- Examen Práctico.(Solo la primera vez)
- No tener faltas con suspensión de licencia municipal en últimos 12 meses. Para la suspenciones mas antiguas presentar Carta de Compromiso.
- Curso específico para el equipo que va a operar (vigencia 4 años )

### Notas: Grúa Puente

- Sicosensotécnico: Cada 4 años. Certificado emitido por institución reconocida por MC. Ver Instructivo específico.
- Examen Práctico.(Solo la primera vez)
- No tener faltas con suspensión de licencia municipal en últimos 12 meses. Para la suspenciones mas antiguas presentar Carta de Compromiso.
- Curso específico para el equipo que va a operar (vigencia 4 años )

### Notas: Manipulador Neumáticos CF

- Antigüedad mínima 18 meses
- Sicosensotécnico: Cada 1 año. Certificado emitido por institución reconocida por MC. Ver Instructivo específico.
- Examen Práctico.(Solo la primera vez)
- No tener faltas con suspensión de licencia municipal en últimos 12 meses. Para la suspenciones mas antiguas presentar Carta de Compromiso.
- Curso de Conducción a la Defensiva cargado en Webcontrol.
- Capacitación teórica práctica realizada por Gerencia Mina si equipo operará en Zona Roja.
- Curso específico para el equipo que va a operar (vigencia 4 años )

### Notas: Manipulador Neumáticos GH

- Antigüedad mínima 18 meses
- Sicosensotécnico: Cada 1 año. Certificado emitido por institución reconocida por MC. Ver Instructivo específico.
- Examen Práctico.(Solo la primera vez)
- No tener faltas con suspensión de licencia municipal en últimos 12 meses. Para la suspenciones mas antiguas presentar Carta de Compromiso.
- Curso de Conducción a la Defensiva cargado en Webcontrol.
- Capacitación teórica práctica realizada por Gerencia Mina si equipo operará en Zona Roja.
- Curso específico para el equipo que va a operar (vigencia 4 años )

### Notas: Manipulador Telescópico (Manitou, Hercules)

- Antigüedad mínima 18 meses
- Sicosensotécnico: Cada 1 año. Certificado emitido por institución reconocida por MC. Ver Instructivo específico.
- Examen Práctico.(Solo la primera vez)
- No tener faltas con suspensión de licencia municipal en últimos 12 meses. Para la suspensiones más antiguas presentar Carta de Compromiso.
- Curso de Conducción a la Defensiva cargado en Webcontrol.
- Curso específico para el equipo que va a operar (vigencia 4 años )

### Notas: Martillo Pica roca

- Equipo estático de Chancado Primario
- Sicosensotécnico: Cada 4 años. Certificado emitido por institución reconocida por MC. Ver Instructivo específico.
- Examen Práctico.(Solo la primera vez)
- No tener faltas con suspensión de licencia municipal en últimos 12 meses. Para la suspensiones más antiguas presentar Carta de Compromiso.
- Curso específico para el equipo que va a operar (vigencia 4 años )

### Notas: Minibus

- Transporte pasajeros entre 10 y 17 ocupantes. Lic A3 - A2 Ley 19495 o A1 (Ley 18290)
- Antigüedad mínima 18 meses
- Sicosensotécnico: Cada 4 años. Certificado emitido por institución reconocida por MC. Ver Instructivo específico.
- Examen Práctico.(Solo la primera vez)
- No tener faltas con suspensión de licencia municipal en últimos 12 meses. Para la suspensiones más antiguas presentar Carta de Compromiso.
- Curso de Conducción a la Defensiva cargado en Webcontrol.

### Notas: Minicargador

- Antigüedad mínima 18 meses
- Sicosensotécnico: Cada 1 año. Certificado emitido por institución reconocida por MC. Ver Instructivo específico.
- Examen Práctico.(Solo la primera vez)
- No tener faltas con suspensión de licencia municipal en últimos 12 meses. Para la suspensiones más antiguas presentar Carta de Compromiso.
- Curso de Conducción a la Defensiva cargado en Webcontrol.
- Curso específico para el equipo que va a operar (vigencia 4 años )

### Notas: Motoniveladora

- Antigüedad mínima 18 meses
- Sicosensotécnico: Cada 1 año. Certificado emitido por institución reconocida por MC. Ver Instructivo específico.
- Examen Práctico.(Solo la primera vez)
- No tener faltas con suspensión de licencia municipal en últimos 12 meses. Para la suspensiones más antiguas presentar Carta de Compromiso.
- Curso de Conducción a la Defensiva cargado en Webcontrol.
- Capacitación teórica práctica realizada por Gerencia Mina si equipo operará en Zona Roja.
- Curso específico para el equipo que va a operar (vigencia 4 años )

### Notas: Perforadora DM-50E

- Antigüedad mínima 18 meses
- Sicosensotécnico: Cada 1 año. Certificado emitido por institución reconocida por MC. Ver Instructivo específico.
- Examen Práctico.(Solo la primera vez)
- No tener faltas con suspensión de licencia municipal en últimos 12 meses. Para la suspensiones más antiguas presentar Carta de Compromiso.
- Curso de Conducción a la Defensiva cargado en Webcontrol.
- Curso específico para el equipo que va a operar (vigencia 4 años )

### Notas: Perforadora D755K

- Antigüedad mínima 18 meses
- Sicosensotécnico: Cada 1 año. Certificado emitido por institución reconocida por MC. Ver Instructivo específico.
- Examen Práctico.(Solo la primera vez)
- No tener faltas con suspensión de licencia municipal en últimos 12 meses. Para la suspensiones más antiguas presentar Carta de Compromiso.
- Curso de Conducción a la Defensiva cargado en Webcontrol.
- Curso específico para el equipo que va a operar (vigencia 4 años )

### Notas: Perforadora DMM-2

- Antigüedad mínima 18 meses
- Sicosensotécnico: Cada 1 año. Certificado emitido por institución reconocida por MC. Ver Instructivo específico.
- Examen Práctico.(Solo la primera vez)
- No tener faltas con suspensión de licencia municipal en últimos 12 meses. Para la suspensiones más antiguas presentar Carta de Compromiso.
- Curso de Conducción a la Defensiva cargado en Webcontrol.
- Curso específico para el equipo que va a operar (vigencia 4 años )

### Notas: Retroexcavadora

- Antigüedad mínima 18 meses
- Sicosensotécnico: Cada 1 año. Certificado emitido por institución reconocida por MC. Ver Instructivo específico.
- Examen Práctico.(Solo la primera vez)
- No tener faltas con suspensión de licencia municipal en últimos 12 meses. Para la suspensiones más antiguas presentar Carta de Compromiso.
- Curso de Conducción a la Defensiva cargado en Webcontrol.
- Curso específico para el equipo que va a operar (vigencia 4 años )

### Notas: Rigger

- Curso específico para la actividad que va a realizar (vigencia 4 años)

### Notas: Rodillo

- Antigüedad mínima 18 meses
- Sicosensotécnico: Cada 1 año. Certificado emitido por institución reconocida por MC. Ver Instructivo específico.
- Examen Práctico.(Solo la primera vez)
- No tener faltas con suspensión de licencia municipal en últimos 12 meses. Para la suspensiones más antiguas presentar Carta de Compromiso.
- Curso de Conducción a la Defensiva cargado en Webcontrol.
- Curso específico para el equipo que va a operar (vigencia 4 años )

### Notas: Rotopala / Spreader

- Sicosensotécnico: Cada 4 años. Certificado emitido por institución reconocida por MC. Ver Instructivo específico.
- Examen Práctico.(Solo la primera vez)
- No tener faltas con suspensión de licencia municipal en últimos 12 meses. Para la suspensiones más antiguas presentar Carta de Compromiso.
- Curso específico para el equipo que va a operar (vigencia 4 años )

### Notas: Soldador

- Soldadura al arco, torchado, oxiacetilenica, oxicorte, otras técnicas según corresponda
- Curso específico para la actividad que va a realizar (vigencia 4 años)

### Notas: Sonda

- Antigüedad mínima 18 meses
- Sicosensotécnico: Cada 1 año. Certificado emitido por institución reconocida por MC. Ver Instructivo específico.
- Examen Práctico.(Solo la primera vez)
- No tener faltas con suspensión de licencia municipal en últimos 12 meses. Para la suspensiones más antiguas presentar Carta de Compromiso.
- Curso de Conducción a la Defensiva cargado en Webcontrol.
- Capacitación teórica práctica realizada por Gerencia Mina si equipo operará en Zona Roja.
- Curso específico para el equipo que va a operar (vigencia 4 años )

### Notas: Tapapozos

- Antigüedad mínima 18 meses
- Sicosensotécnico: Cada 1 año. Certificado emitido por institución reconocida por MC. Ver Instructivo específico.
- Examen Práctico.(Solo la primera vez)
- No tener faltas con suspensión de licencia municipal en últimos 12 meses. Para la suspensiones más antiguas presentar Carta de Compromiso.
- Curso de Conducción a la Defensiva cargado en Webcontrol.
- Capacitación teórica práctica realizada por Gerencia Mina si equipo operará en Zona Roja.
- Curso específico para el equipo que va a operar (vigencia 4 años )
- Licencia de manipulador de Explosivos

### Notas: Trabajo en Altura Física

- Certificado Médico acreditando aptitud para trabajo en altura física

### Notas: Tractor Oruga Bulldozer

- Antigüedad mínima 18 meses
- Sicosensotécnico: Cada 1 año. Certificado emitido por institución reconocida por MC. Ver Instructivo específico.
- Examen Práctico.(Solo la primera vez)
- No tener faltas con suspensión de licencia municipal en últimos 12 meses. Para la suspensiones más antiguas presentar Carta de Compromiso.
- Curso de Conducción a la Defensiva cargado en Webcontrol.
- Capacitación teórica práctica realizada por Gerencia Mina si equipo operará en Zona Roja.
- Curso específico para el equipo que va a operar (vigencia 4 años )

### Notas: Tractor Ruedas Wheeldozer

- Antigüedad mínima 18 meses
- Sicosensotécnico: Cada 1 año. Certificado emitido por institución reconocida por MC. Ver Instructivo específico.
- Examen Práctico.(Solo la primera vez)
- No tener faltas con suspensión de licencia municipal en últimos 12 meses. Para la suspensiones más antiguas presentar Carta de Compromiso.
- Curso de Conducción a la Defensiva cargado en Webcontrol.
- Capacitación teórica práctica realizada por Gerencia Mina si equipo operará en Zona Roja.
- Curso específico para el equipo que va a operar (vigencia 4 años )

### Notas: Vehículo Livianos

- Camionetas, SUV.
- Antigüedad mínima 18 meses
- Sicosensotécnico: Cada 4 años. Certificado emitido por institución reconocida por MC. Ver Instructivo específico.
- Examen Práctico.(Solo la primera vez)
- No tener faltas con suspensión de licencia municipal en últimos 12 meses. Para la suspensiones más antiguas presentar Carta de Compromiso.
- Curso de Conducción a la Defensiva cargado en Webcontrol.
- Capacitación teórica práctica realizada por Gerencia Mina si equipo operará en Zona Roja.

### Notas: Grua Portal

### Notas: Camión Rotainer

- Camion plataforma, camion de carga en general sin especificacion
- Antigüedad mínima 18 meses
- Sicosensotécnico: Cada 1 año. Certificado emitido por institución reconocida por MC. Ver Instructivo específico.
- Examen Práctico.(Solo la primera vez)
- No tener faltas con suspensión de licencia municipal en últimos 12 meses. Para la suspensiones más antiguas presentar Carta de Compromiso.
- Curso de Conducción a la Defensiva cargado en Webcontrol.

### Notas: Camión Desobstructor

- Camion plataforma, camion de carga en general sin especificacion
- Antigüedad mínima 18 meses
- Sicosensotécnico: Cada 1 año. Certificado emitido por institución reconocida por MC. Ver Instructivo específico.
- Examen Práctico.(Solo la primera vez)
- No tener faltas con suspensión de licencia municipal en últimos 12 meses. Para la suspensiones más antiguas presentar Carta de Compromiso.
- Curso de Conducción a la Defensiva cargado en Webcontrol.

### Notas: Uso Cuchillo OLFA

- Curso específico para el equipo que va a operar (vigencia 4 años )

### Notas: Tractor Wheeldozer 834G

- Antigüedad mínima 18 meses
- Sicosensotécnico: Cada 1 año. Certificado emitido por institución reconocida por MC. Ver Instructivo específico.
- Examen Práctico.(Solo la primera vez)
- No tener faltas con suspensión de licencia municipal en últimos 12 meses. Para la suspensiones más antiguas presentar Carta de Compromiso.
- Curso de Conducción a la Defensiva cargado en Webcontrol.
- Capacitación teórica práctica realizada por Gerencia Mina si equipo operará en Zona Roja.
- Curso específico para el equipo que va a operar (vigencia 4 años )

### Notas: Tractor Wheeldozer WD900

- Antigüedad mínima 18 meses
- Sicosensotécnico: Cada 1 año. Certificado emitido por institución reconocida por MC. Ver Instructivo específico.
- Examen Práctico.(Solo la primera vez)
- No tener faltas con suspensión de licencia municipal en últimos 12 meses. Para la suspensiones más antiguas presentar Carta de Compromiso.
- Curso de Conducción a la Defensiva cargado en Webcontrol.
- Capacitación teórica práctica realizada por Gerencia Mina si equipo operará en Zona Roja.
- Curso específico para el equipo que va a operar (vigencia 4 años )

### Notas: Camión Aljibe KOM 785 HD-7

- Antigüedad mínima 18 meses
- Sicosensotécnico: Cada 1 año. Certificado emitido por institución reconocida por MC. Ver Instructivo específico.
- Examen Práctico.(Solo la primera vez)
- No tener faltas con suspensión de licencia municipal en últimos 12 meses. Para la suspensiones más antiguas presentar Carta de Compromiso.
- Curso de Conducción a la Defensiva cargado en Webcontrol.
- Capacitación teórica práctica realizada por Gerencia Mina si equipo operará en Zona Roja.
- Curso específico para el equipo que va a operar (vigencia 4 años )

### Notas: Cargador WA900

- Antigüedad mínima 18 meses
- Sicosensotécnico: Cada 1 año. Certificado emitido por institución reconocida por MC. Ver Instructivo específico.
- Examen Práctico.(Solo la primera vez)
- No tener faltas con suspensión de licencia municipal en últimos 12 meses. Para la suspensiones más antiguas presentar Carta de Compromiso.
- Curso de Conducción a la Defensiva cargado en Webcontrol.
- Capacitación teórica práctica realizada por Gerencia Mina si equipo operará en Zona Roja.
- Curso específico para el equipo que va a operar (vigencia 4 años )

### Notas: Camión Rampla Plano

- Camion plataforma, camion de carga en general sin especificacion
- Antigüedad mínima 18 meses
- Sicosensotécnico: Cada 1 año. Certificado emitido por institución reconocida por MC. Ver Instructivo específico.
- Examen Práctico.(Solo la primera vez)
- No tener faltas con suspensión de licencia municipal en últimos 12 meses. Para la suspensiones más antiguas presentar Carta de Compromiso.
- Curso de Conducción a la Defensiva cargado en Webcontrol.

<!-- FIN DE NOTAS GENERADAS AUTOMÁTICAMENTE -->

### Estructura de base de datos y relaciones

```prisma
model ActivityDocumentation {
  id              Int           @id @default(autoincrement())
  activityId      Int
  documentationId Int
  // ...otros campos (por ejemplo, si es obligatorio, observaciones, etc)
  activity        Activity      @relation(fields: [activityId], references: [id])
  documentation   Documentation @relation(fields: [documentationId], references: [id])
}
```

Esta tabla pivote permite asociar muchas documentaciones a muchas actividades y viceversa, y puede almacenar información adicional sobre la relación.

**Estructura en base de datos:**

```prisma
model ActivityDocumentation {
  id              String        @id @default(cuid())
  activityId      String
  documentationId String
  quantity        Int
  isSpecific      Boolean       @default(false)
  activity        Activity      @relation(fields: [activityId], references: [id])
  documentation   Documentation @relation(fields: [documentationId], references: [id])
}
```

---

## Análisis técnico y TODO

### Análisis de la solución actual

- El sistema modela correctamente las actividades, los tipos de documentación y su relación mediante una tabla pivote (`ActivityDocumentation`).
- Se eliminaron los campos de expiración en la documentación, simplificando la gestión de requisitos.
- El archivo contiene tablas automáticas para cada tipo de documentación, facilitando la consulta cruzada.
- Las notas y requisitos adicionales por actividad están agrupadas y documentadas, permitiendo detallar requisitos especiales, cursos, exámenes y observaciones.
- La estructura Prisma está documentada para cada entidad principal.
- El sistema permite crear, editar y eliminar actividades y documentación desde el frontend.
- El proceso de llenado de tablas y generación de markdown está automatizado.
- Se eliminaron columnas innecesarias en las tablas de requisitos, dejando solo dos columnas por tabla.

### Posibles mejoras y campos/faltantes detectados

- **Usuario y acreditación individual:** Falta modelar la entidad `User` y su relación con actividades/documentos acreditados.
- **Tabla de acreditación:** Se requiere una tabla `Accreditation` para registrar el estado de cada trabajador respecto a cada actividad/documento.
- **Historial y auditoría:** No existe registro de cambios, renovaciones o historial de acreditaciones/documentos.
- **Almacenamiento de archivos:** No se ha implementado la carga y almacenamiento de archivos/documentos (por ejemplo, en Supabase Storage).
- **Fechas de emisión/vencimiento:** Si bien se eliminaron de la documentación, podrían ser necesarias en la acreditación individual.
- **Observaciones/comentarios:** Faltan campos para observaciones por acreditación/documento/actividad.
- **Validaciones automáticas:** No se han implementado validaciones automáticas (antigüedad, cursos previos, etc.).
- **Notificaciones:** No existe sistema de notificaciones para vencimientos o requisitos pendientes.
- **Relación con zonas:** Las zonas no están explícitamente relacionadas con actividades/documentos/acreditaciones.
- **Configuración dinámica:** No hay panel de administración para modificar requisitos dinámicamente.
- **UX de acreditación individual:** Falta mejorar la experiencia de usuario para la gestión de acreditaciones individuales.
- **Flujos y casos de uso:** No se han documentado los flujos de acreditación y casos de uso típicos.

### TODO

- [ ] Modelar la entidad `User` y su relación con actividades/acreditaciones.
- [ ] Crear la tabla `Accreditation` para registrar el estado de cada trabajador respecto a cada actividad/documento.
- [ ] Implementar historial/auditoría de cambios y renovaciones.
- [ ] Implementar almacenamiento de archivos para documentos subidos.
- [ ] Permitir registrar fechas de emisión/vencimiento por documento/acreditación si es necesario.
- [ ] Agregar campos de observaciones/comentarios en acreditaciones y documentos.
- [ ] Implementar validaciones automáticas (antigüedad, cursos previos, etc.).
- [ ] Desarrollar sistema de notificaciones para vencimientos y requisitos.
- [ ] Relacionar zonas con actividades/documentos/acreditaciones según corresponda.
- [ ] Permitir configuración dinámica de requisitos desde el panel de administración.
- [ ] Mejorar la UX para la gestión de acreditaciones individuales.
- [ ] Documentar los flujos de acreditación y casos de uso en este archivo.

---

> **Nota:** Si una actividad requiere documentación global, indícalo en la columna de observaciones.
