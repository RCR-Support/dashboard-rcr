import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Obtener todas las relaciones de actividad-documentación
  const activityDocs = await prisma.activityDocumentation.findMany({
    include: {
      activity: {
        select: {
          name: true,
        },
      },
      documentation: {
        select: {
          name: true,
          isGlobal: true,
        },
      },
    },
  });

  console.log('\nDocumentos y sus relaciones con actividades:');
  activityDocs.forEach(doc => {
    console.log(`\nActividad: ${doc.activity.name}`);
    console.log(`Documento: ${doc.documentation.name}`);
    console.log(`Es específico: ${doc.isSpecific}`);
    console.log(`Es global (en Documentation): ${doc.documentation.isGlobal}`);
    console.log('-------------------------------------------');
  });
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
