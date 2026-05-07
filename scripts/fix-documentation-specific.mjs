/**
 * Script para corregir el campo isSpecific en ActivityDocumentation
 * 
 * Este script identifica documentos que están marcados como "específicos"
 * pero que aparecen en múltiples actividades, y los marca como NO específicos.
 */

import { db } from '../lib/db.ts';

async function main() {
  console.log('🔍 Iniciando corrección de documentos...\n');

  // 1. Obtener todos los documentos y sus relaciones
  const allDocs = await db.activityDocumentation.findMany({
    include: {
      documentation: true,
      activity: true,
    },
  });

  // 2. Agrupar por documentationId para ver cuántas actividades usan cada documento
  const docsByDocId = new Map();
  
  allDocs.forEach(doc => {
    const docId = doc.documentationId;
    if (!docsByDocId.has(docId)) {
      docsByDocId.set(docId, []);
    }
    docsByDocId.get(docId).push(doc);
  });

  console.log('📊 Análisis de documentos:\n');
  
  const toUpdate = [];
  const alreadyCorrect = [];
  const trulySpecific = [];

  // 3. Analizar cada documento
  for (const [docId, docs] of docsByDocId.entries()) {
    const docName = docs[0].documentation.name;
    const activityCount = docs.length;
    const allMarkedAsSpecific = docs.every(d => d.isSpecific);
    const allMarkedAsGlobal = docs.every(d => !d.isSpecific);

    if (activityCount === 1) {
      // Solo está en UNA actividad
      if (docs[0].isSpecific) {
        trulySpecific.push({
          docId,
          name: docName,
          activity: docs[0].activity.name,
        });
      }
    } else if (activityCount > 1) {
      // Está en MÚLTIPLES actividades
      if (allMarkedAsSpecific) {
        // ❌ ERROR: Marcado como específico pero está en varias actividades
        toUpdate.push({ docId, name: docName, count: activityCount });
      } else if (allMarkedAsGlobal) {
        // ✅ CORRECTO: Ya está marcado como global
        alreadyCorrect.push({ docId, name: docName, count: activityCount });
      } else {
        // ⚠️ INCONSISTENTE: Algunas actividades lo tienen como específico y otras no
        console.log(`⚠️  "${docName}" tiene valores inconsistentes de isSpecific`);
        toUpdate.push({ docId, name: docName, count: activityCount });
      }
    }
  }

  // 4. Mostrar resultados
  console.log('✅ Documentos ya correctos (globales):');
  if (alreadyCorrect.length === 0) {
    console.log('   Ninguno\n');
  } else {
    alreadyCorrect.forEach(d => {
      console.log(`   - ${d.name} (usado en ${d.count} actividades)`);
    });
    console.log('');
  }

  console.log('✅ Documentos realmente específicos (solo 1 actividad):');
  if (trulySpecific.length === 0) {
    console.log('   Ninguno\n');
  } else {
    trulySpecific.forEach(d => {
      console.log(`   - ${d.name} (actividad: ${d.activity})`);
    });
    console.log('');
  }

  console.log('❌ Documentos que NECESITAN corrección:');
  if (toUpdate.length === 0) {
    console.log('   ¡Ninguno! Todo está correcto 🎉\n');
    return;
  }

  toUpdate.forEach(d => {
    console.log(`   - ${d.name} (usado en ${d.count} actividades, marcado como específico)`);
  });
  console.log('');

  // 5. Confirmar actualización
  console.log('🔧 Se actualizarán los siguientes documentos a isSpecific=false:\n');
  
  const docIdsToUpdate = toUpdate.map(d => d.docId);

  // 6. Realizar la actualización
  console.log('Ejecutando actualización...\n');
  
  const result = await db.activityDocumentation.updateMany({
    where: {
      documentationId: {
        in: docIdsToUpdate,
      },
    },
    data: {
      isSpecific: false,
    },
  });

  console.log(`✅ Actualización completada: ${result.count} registros actualizados\n`);

  // 7. Verificar resultados
  console.log('📋 Verificación final:\n');
  
  const updated = await db.activityDocumentation.findMany({
    where: {
      documentationId: {
        in: docIdsToUpdate,
      },
    },
    include: {
      documentation: true,
      activity: true,
    },
  });

  const byDoc = new Map();
  updated.forEach(doc => {
    const name = doc.documentation.name;
    if (!byDoc.has(name)) {
      byDoc.set(name, []);
    }
    byDoc.get(name).push(doc);
  });

  byDoc.forEach((docs, name) => {
    console.log(`   ${name}:`);
    docs.forEach(d => {
      console.log(`      - ${d.activity.name}: isSpecific=${d.isSpecific} ✅`);
    });
  });

  console.log('\n✨ ¡Corrección completada exitosamente!\n');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    process.exit(0);
  });
