import { PrismaClient } from '@prisma/client';
import { activityLicenses } from './activity-license-map';
const prisma = new PrismaClient();

async function main() {
  console.log('Actualizando licencias de conducir para actividades...');

  for (const item of activityLicenses) {
    const activity = await prisma.activity.findUnique({
      where: { name: item.activity },
    });

    if (activity) {
      await prisma.activity.update({
        where: { id: activity.id },
        data: { requiredDriverLicense: item.license },
      });
      console.log(`Actualizada licencia para: ${item.activity}`);
    } else {
      console.log(`No se encontró la actividad: ${item.activity}`);
    }
  }

  console.log('Proceso finalizado.');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
