import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🧹 Eliminando relaciones de "Foto credencial" con actividades...\n');

  try {
    // 1. Buscar el documento "Foto credencial"
    const fotoCredencial = await prisma.documentation.findFirst({
      where: { name: 'Foto credencial' }
    });

    if (!fotoCredencial) {
      console.log('⚠️  Documento "Foto credencial" no encontrado');
      return;
    }

    console.log(`✅ Documento encontrado: ${fotoCredencial.name} (ID: ${fotoCredencial.id})\n`);

    // 2. Eliminar todas las relaciones ActivityDocumentation
    console.log('🗑️  Eliminando relaciones con actividades...');
    const deleted = await prisma.activityDocumentation.deleteMany({
      where: {
        documentationId: fotoCredencial.id
      }
    });

    console.log(`✅ Eliminadas ${deleted.count} relaciones\n`);

    console.log('✨ Proceso completado!');
    console.log('\n📝 Nota: Ahora "Foto credencial" se agregará automáticamente');
    console.log('   a cada solicitud como documento independiente de las actividades.');

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
