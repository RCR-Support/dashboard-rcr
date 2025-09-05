import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const documentations = [
  'Licencia Municipal',
  'Sicosensotécnico',
  'Certificado Examen Práctico',
  'Hoja de vida conductor',
  'Certificado Curso Conducción a la defensiva',
  'Curso Específico Equipo que va a Operar',
  'Curso Específico Actividad que va a Realizar',
  'Capacitación teórica práctica - Zona Roja',
  'Certificado Médico Trabajo Altura Física',
  'DS 160 Curso Sustancia Peligrosa',
  'Licencia de Manipulador de Explosivos',
];

const activities = [
  // Extraído de ACTIVIDADES-REQUISITOS.md (solo nombres)
  'Alzahombre',
  'Ambulancia',
  'Armador De Andamio',
  'Autorizado Para Bloquear',
  'Bulldozer CAT D10T',
  'Bulldozer CAT D10T2',
  'Buses',
  'Camión Aljibe CAT 773E',
  'Camión Aljibe CAT 777D',
  'Camión Aljibe KOM 785 HD-7',
  'Camión Extracción CAT 785C',
  'Camión Extracción KOM 830E-1',
  'Camión Extracción KOM 830E-5',
  'Camión Frontal CAT 966L',
  'Camión Frontal CAT 992G',
  'Camión Frontal CAT 994F',
  'Camión Frontal CAT 994K',
  'Cama Baja Mack',
  'Camioneta Combustible',
  'Camioneta Polvorinera',
  'Camioneta Rescate/Emergencia',
  'Camioneta Triple Cabina',
  'Camión 3/4',
  'Camión Aljibe',
  'Camión Ampliroll',
  'Camión Articulado Dumper',
  'Camión Aspirador Alto Vacio',
  'Camión CAEX Komatsu 730',
  'Camión Caex 773',
  'Camión Caex 777',
  'Camión Caex 789',
  'Camión Cama Baja',
  'Camión Catodos',
  'Camión Combustible',
  'Camión Desobstructor',
  'Camión Fosero',
  'Camión Fábrica',
  'Camión Hidrolavador',
  'Camión Lubricador',
  'Camión Lubricador/Pluma',
  'Camión Pluma Solo Camión',
  'Camión Pluma Y Grua Pluma',
  'Camión Polvorín',
  'Camión Rampla (plano)',
  'Camión Rotainer',
  'Camión Sonda',
  'Camión Tolva',
  'Camión De Sevicio',
  'Camión De Emergencia',
  'Camión Ácido',
  'Cargador Frontal Otras Marcas',
  'Cargador WA900',
  'D-75-KS',
  'Enrolla Cable CAT 980',
  'Enrolla Cable Kom WA 600',
  'Equipo Radiactivo 1era, 2da Y 3era',
  'Espacios Confinados',
  'Excavadora Balde/Pica Roca',
  'Excavadora Liebherr Modelo 984',
  'Excavadoras PC 5500',
  'Furgon',
  'Grua Portal',
  'Grúa Horquilla',
  'Grúa Móvil',
  'Grúa Pluma Solo Grúa',
  'Grúa Puente',
  'KOMATSU WD600-6R',
  'Lainera',
  'Limpiadora De Vapor “OPTIMA”',
  'Manipulador Telescópico',
  'Manipulador De Neumáticos CF',
  'Manipulador De Neumáticos GH',
  'Martillo Pica Roca',
  'Minibus',
  'Minicargador',
  'Motoniveladora CAT 16',
  'Motoniveladora CAT 16M',
  'Pala 4100 XPC AC',
  'Perfolodos WS 1400',
  'Perforadora D755K',
  'Perforadora DM50',
  'Perforadora DMM2',
  'Perforadora MD6240',
  'Perforadora MD6380',
  'Perforadora Roc L8',
  'ROCL8',
  'Retroexcavadoras',
  'Rigger',
  'Rodillo',
  'Rotopala / Spreader',
  'Soldador',
  'Sonda',
  'Tapapozos',
  'Thunderbolt',
  'Trabajo Altura Física',
  'Tracto Camión',
  'Tractor De Orugas',
  'Tractor De Ruedas',
  'Traslado Palas',
  'Traslado Perforadora',
  'Uso Cuchillo OLFA',
  'Vehículo Liviano',
  'Welldozer WD900',
  'Wheeldozer CAT 834G',
  'Wheeldozer CAT 854K',
];

async function main() {
  // Seed documentations
  for (const name of documentations) {
    await prisma.documentation.upsert({
      where: { name: name },
      update: {},
      create: { name },
    });
  }
  // Seed activities
  for (const name of activities) {
    await prisma.activity.upsert({
      where: { name: name },
      update: {},
      create: { name },
    });
  }
  console.log('Documentaciones y actividades insertadas');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
