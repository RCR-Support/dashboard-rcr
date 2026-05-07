import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('📸 Agregando "Foto credencial" a todas las actividades...\n');

  try {
    // 1. Buscar el documento "Foto credencial"
    const fotoCredencial = await prisma.documentation.findFirst({
      where: { name: 'Foto credencial' }
    });

    if (!fotoCredencial) {
      console.log('❌ Error: No se encontró el documento "Foto credencial"');
      console.log('   Ejecuta primero: npm run setup:credential');
      process.exit(1);
    }

    console.log('✅ Documento encontrado:');
    console.log(`   ID: ${fotoCredencial.id}`);
    console.log(`   Tipo: ${fotoCredencial.acceptedFileType}\n`);

    // 2. Obtener todas las actividades
    const activities = await prisma.activity.findMany({
      select: {
        id: true,
        name: true
      }
    });

    console.log(`📋 Total de actividades: ${activities.length}\n`);

    // 3. Para cada actividad, verificar si ya tiene la relación
    let added = 0;
    let skipped = 0;

    for (const activity of activities) {
      const existing = await prisma.activityDocumentation.findFirst({
        where: {
          activityId: activity.id,
          documentationId: fotoCredencial.id
        }
      });

      if (existing) {
        console.log(`⏭️  ${activity.name} - ya tiene Foto credencial`);
        skipped++;
      } else {
        await prisma.activityDocumentation.create({
          data: {
            activityId: activity.id,
            documentationId: fotoCredencial.id,
            isSpecific: false, // NO específico = global para todas
            quantity: 1,
            notes: 'Foto tipo carnet para credencial (fondo blanco, rostro frontal)'
          }
        });
        console.log(`✅ ${activity.name} - Foto credencial agregada`);
        added++;
      }
    }

    console.log(`\n📊 Resumen:`);
    console.log(`   ✅ Agregadas: ${added}`);
    console.log(`   ⏭️  Omitidas (ya existían): ${skipped}`);
    console.log(`   📋 Total actividades: ${activities.length}`);

    console.log('\n✨ Proceso completado!');
    console.log('💡 Ahora todas las solicitudes requerirán "Foto credencial" (solo imágenes)');

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
