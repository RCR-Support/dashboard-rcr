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

async function main() {
  for (const name of documentations) {
    await prisma.documentation.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }
  console.log('Documentaciones insertadas');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
