import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();

async function cleanupOrphanDocuments() {
  try {
    console.log('🔍 Buscando documentos huérfanos...');
    
    // Buscar documentos PDF sin documentationId
    const orphans = await db.documentationFile.findMany({
      where: {
        documentationId: null,
        type: 'PDF',
      },
      select: {
        id: true,
        applicationId: true,
        url: true,
      },
    });

    console.log(`📦 Encontrados ${orphans.length} documentos huérfanos`);
    
    if (orphans.length === 0) {
      console.log('✅ No hay documentos huérfanos para limpiar');
      return;
    }

    // Mostrar algunos ejemplos
    console.log('Ejemplos:', orphans.slice(0, 3));

    // Eliminar
    const result = await db.documentationFile.deleteMany({
      where: {
        documentationId: null,
        type: 'PDF',
      },
    });

    console.log(`✅ Eliminados ${result.count} documentos huérfanos de la BD`);
    console.log('⚠️ Los archivos en Cloudinary permanecen (puedes limpiarlos después)');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await db.$disconnect();
  }
}

cleanupOrphanDocuments();
