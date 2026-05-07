import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🎨 Configurando documento "Foto credencial"...\n');

  try {
    // Verificar si ya existe
    let fotoCredencial = await prisma.documentation.findFirst({
      where: { name: 'Foto credencial' }
    });

    if (fotoCredencial) {
      console.log('✅ Documento "Foto credencial" ya existe');
      console.log(`   ID: ${fotoCredencial.id}`);
      console.log(`   Tipo actual: ${fotoCredencial.acceptedFileType}`);
      
      // Actualizar si no tiene el tipo correcto
      if (fotoCredencial.acceptedFileType !== 'IMAGE') {
        console.log('\n🔄 Actualizando tipo de archivo a IMAGE...');
        fotoCredencial = await prisma.documentation.update({
          where: { id: fotoCredencial.id },
          data: { acceptedFileType: 'IMAGE' }
        });
        console.log('✅ Tipo actualizado correctamente');
      }
    } else {
      console.log('📝 Creando documento "Foto credencial"...');
      fotoCredencial = await prisma.documentation.create({
        data: {
          name: 'Foto credencial',
          acceptedFileType: 'IMAGE'
        }
      });
      console.log('✅ Documento creado correctamente');
      console.log(`   ID: ${fotoCredencial.id}`);
    }

    console.log('\n📊 Información del documento:');
    console.log(`   Nombre: ${fotoCredencial.name}`);
    console.log(`   Tipo: ${fotoCredencial.acceptedFileType}`);
    console.log(`   ID: ${fotoCredencial.id}`);
    
    // Contar actividades relacionadas
    const activityCount = await prisma.activityDocumentation.count({
      where: { documentationId: fotoCredencial.id }
    });
    console.log(`   Actividades: ${activityCount}`);

    console.log('\n💡 Sugerencias:');
    console.log('   • Agrega este documento a las actividades que necesiten foto de credencial');
    console.log('   • Marca como "no específico" (isSpecific=false) si aplica a todas las actividades');
    console.log('   • Los usuarios solo podrán subir imágenes (JPG, PNG, WEBP)');

    console.log('\n✨ Configuración completada!');
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
