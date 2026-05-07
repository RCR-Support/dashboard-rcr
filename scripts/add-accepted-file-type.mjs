import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔧 Agregando campo acceptedFileType a Documentation...\n');

  try {
    // 1. Crear el enum AcceptedFileType si no existe
    console.log('1️⃣ Creando enum AcceptedFileType...');
    await prisma.$executeRaw`
      DO $$ BEGIN
        CREATE TYPE "AcceptedFileType" AS ENUM ('PDF', 'IMAGE', 'DOCUMENT', 'ANY');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `;
    console.log('✅ Enum creado o ya existía\n');

    // 2. Agregar la columna acceptedFileType con valor por defecto
    console.log('2️⃣ Agregando columna acceptedFileType...');
    await prisma.$executeRaw`
      ALTER TABLE "Documentation" 
      ADD COLUMN IF NOT EXISTS "acceptedFileType" "AcceptedFileType" NOT NULL DEFAULT 'PDF'::"AcceptedFileType";
    `;
    console.log('✅ Columna agregada\n');

    // 3. Actualizar "Foto credencial" para que acepte solo imágenes
    console.log('3️⃣ Actualizando documento "Foto credencial"...');
    const result = await prisma.$executeRaw`
      UPDATE "Documentation" 
      SET "acceptedFileType" = 'IMAGE'::"AcceptedFileType"
      WHERE "name" = 'Foto credencial';
    `;
    console.log(`✅ Actualizado: ${result} registro(s)\n`);

    // 4. Verificar el cambio
    console.log('4️⃣ Verificando cambios...');
    const fotoCredencial = await prisma.documentation.findFirst({
      where: { name: 'Foto credencial' }
    });
    
    if (fotoCredencial) {
      console.log('✅ Documento encontrado:');
      console.log(`   ID: ${fotoCredencial.id}`);
      console.log(`   Nombre: ${fotoCredencial.name}`);
      console.log(`   Tipo aceptado: ${fotoCredencial.acceptedFileType}`);
    } else {
      console.log('⚠️  Documento "Foto credencial" no encontrado en la base de datos');
    }

    console.log('\n✨ Migración completada exitosamente!');
  } catch (error) {
    console.error('❌ Error durante la migración:', error);
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
