import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // Buscar todas las actividades ordenadas por nombre
  const activities = await prisma.activity.findMany({
    orderBy: {
      name: 'asc'
    }
  });
  
  console.log(`Total de actividades encontradas: ${activities.length}`);
  console.log('-'.repeat(80));
  
  // Buscar actividades sin licencia asignada
  const missingLicenses = activities.filter(act => !act.requiredDriverLicense);
  
  console.log('Actividades sin licencias asignadas:');
  if (missingLicenses.length === 0) {
    console.log('Ninguna - Todas las actividades tienen licencias asignadas');
  } else {
    missingLicenses.forEach(act => {
      console.log(`- ${act.name} (ID: ${act.id})`);
    });
  }
  
  console.log('-'.repeat(80));
  console.log('Detalle de todas las actividades:');
  
  // Mostrar todas las actividades con su detalle
  activities.forEach(activity => {
    console.log(`- ${activity.name}`);
    console.log(`  * ID: ${activity.id}`);
    console.log(`  * Licencia requerida: ${activity.requiredDriverLicense || 'NO ASIGNADA'}`);
    console.log();
  });
  
  // Búsqueda específica de Limpiadora De Vapor "OPTIMA"
  console.log('-'.repeat(80));
  console.log('Búsqueda específica de Limpiadora De Vapor "OPTIMA":');
  
  // Búsqueda más flexible usando includes() o similar para el nombre
  const limpiadora = activities.find(act => 
    act.name.includes('Limpiadora') && act.name.includes('Vapor') && act.name.includes('OPTIMA')
  );
  
  if (limpiadora) {
    console.log(`- ${limpiadora.name}`);
    console.log(`  * ID: ${limpiadora.id}`);
    console.log(`  * Licencia requerida: ${limpiadora.requiredDriverLicense || 'NO ASIGNADA'}`);
  } else {
    console.log('No se encontró la actividad que contenga "Limpiadora", "Vapor" y "OPTIMA"');
    
    // Mostrar nombres similares para depuración
    console.log('\nPosibles coincidencias parciales:');
    activities
      .filter(act => 
        act.name.includes('Limpiadora') || 
        act.name.includes('Vapor') || 
        act.name.includes('OPTIMA')
      )
      .forEach(act => {
        console.log(`- ${act.name} (ID: ${act.id})`);
      });
  }
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
