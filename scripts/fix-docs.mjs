import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Iniciando corrección de documentos...\n');

  try {
    // PASO 1: Analizar el estado actual
    console.log('📊 PASO 1: Analizando documentos...\n');
    
    const problemDocs = await prisma.$queryRaw`
      SELECT 
        d.name AS documento,
        COUNT(DISTINCT ad."activityId") AS num_actividades,
        BOOL_AND(ad."isSpecific") AS todos_especificos,
        STRING_AGG(DISTINCT a.name, ', ' ORDER BY a.name) AS actividades
      FROM "ActivityDocumentation" ad
      JOIN "Documentation" d ON d.id = ad."documentationId"
      JOIN "Activity" a ON a.id = ad."activityId"
      GROUP BY d.id, d.name
      HAVING COUNT(DISTINCT ad."activityId") > 1 AND BOOL_AND(ad."isSpecific") = true
      ORDER BY num_actividades DESC, d.name
    `;

    if (problemDocs.length === 0) {
      console.log('✅ ¡No hay documentos que corregir! Todo está bien configurado.\n');
      return;
    }

    console.log(`❌ Encontrados ${problemDocs.length} documentos mal configurados:\n`);
    problemDocs.forEach((doc, i) => {
      console.log(`${i + 1}. ${doc.documento}`);
      console.log(`   - Usado en ${doc.num_actividades} actividades: ${doc.actividades}`);
      console.log(`   - Estado actual: isSpecific = true ❌`);
      console.log(`   - Se corregirá a: isSpecific = false ✅\n`);
    });

    // PASO 2: Ejecutar corrección
    console.log('🔧 PASO 2: Aplicando corrección...\n');
    
    const result = await prisma.$executeRaw`
      UPDATE "ActivityDocumentation"
      SET "isSpecific" = false
      WHERE "documentationId" IN (
        SELECT ad."documentationId"
        FROM "ActivityDocumentation" ad
        GROUP BY ad."documentationId"
        HAVING COUNT(DISTINCT ad."activityId") > 1
      )
      AND "isSpecific" = true
    `;

    console.log(`✅ Actualización completada: ${result} registros actualizados\n`);

    // PASO 3: Verificar resultados
    console.log('📋 PASO 3: Verificando resultados...\n');
    
    const verification = await prisma.$queryRaw`
      SELECT 
        d.name AS documento,
        COUNT(DISTINCT ad."activityId") AS num_actividades,
        BOOL_AND(ad."isSpecific") AS todos_especificos,
        BOOL_OR(ad."isSpecific") AS algun_especifico
      FROM "ActivityDocumentation" ad
      JOIN "Documentation" d ON d.id = ad."documentationId"
      GROUP BY d.id, d.name
      HAVING COUNT(DISTINCT ad."activityId") > 1
      ORDER BY num_actividades DESC
    `;

    if (verification.length === 0) {
      console.log('✅ Todos los documentos compartidos ahora tienen isSpecific = false\n');
    } else {
      console.log('Documentos compartidos después de la corrección:\n');
      verification.forEach((doc, i) => {
        const status = doc.todos_especificos ? '❌ true' : '✅ false';
        console.log(`${i + 1}. ${doc.documento} (${doc.num_actividades} actividades) - isSpecific: ${status}`);
      });
      console.log('');
    }

    // PASO 4: Mostrar documentos realmente específicos
    console.log('📌 PASO 4: Documentos realmente específicos (solo en 1 actividad)...\n');
    
    const specificDocs = await prisma.$queryRaw`
      SELECT 
        d.name AS documento,
        a.name AS actividad,
        ad."isSpecific" AS es_especifico
      FROM "ActivityDocumentation" ad
      JOIN "Documentation" d ON d.id = ad."documentationId"
      JOIN "Activity" a ON a.id = ad."activityId"
      WHERE ad."documentationId" IN (
        SELECT ad2."documentationId"
        FROM "ActivityDocumentation" ad2
        GROUP BY ad2."documentationId"
        HAVING COUNT(DISTINCT ad2."activityId") = 1
      )
      ORDER BY d.name
      LIMIT 10
    `;

    if (specificDocs.length > 0) {
      console.log('Ejemplos de documentos específicos:');
      specificDocs.slice(0, 5).forEach((doc, i) => {
        const status = doc.es_especifico ? '✅ true' : '⚠️ false (debería ser true)';
        console.log(`${i + 1}. ${doc.documento} → ${doc.actividad} - isSpecific: ${status}`);
      });
      console.log('');
    }

    console.log('✨ ¡Corrección completada exitosamente!\n');
    console.log('Próximos pasos:');
    console.log('1. Reinicia el servidor: npm run dev');
    console.log('2. Prueba crear una solicitud con múltiples actividades');
    console.log('3. Verifica que los documentos comunes aparezcan solo 1 vez\n');

  } catch (error) {
    console.error('❌ Error durante la corrección:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error('❌ Error fatal:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
