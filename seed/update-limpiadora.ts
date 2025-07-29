import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  try {
    const LIMPIADORA_ID = 'cmdl1aqwk0027vd50ryt1n4hj'; // ID obtenido de la verificación
    
    console.log(`Actualizando Limpiadora De Vapor "OPTIMA" con ID: ${LIMPIADORA_ID}...`);
    
    // Actualizar licencia para Limpiadora De Vapor "OPTIMA"
    const result = await prisma.activity.update({
      where: { id: LIMPIADORA_ID },
      data: { requiredDriverLicense: 'A-1, A-2, A-3, A-4, A-5, B' }
    });
    
    console.log(`Licencia actualizada para: ${result.name}`);
    console.log(`Nueva licencia: ${result.requiredDriverLicense}`);
  } catch (error) {
    console.error('Error al actualizar la actividad:', error);
  }
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
