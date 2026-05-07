// Cargar variables de entorno desde .env al ejecutar con node/ts-node
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

async function main() {
  const apps = await prisma.application.findMany({
    where: { statusToken: null },
    select: { id: true }
  });

  console.log('Found applications to backfill:', apps.length);

  for (const a of apps) {
    const token = uuidv4();
    await prisma.application.update({
      where: { id: a.id },
      data: { statusToken: token }
    });
  }

  console.log('Backfill complete:', apps.length);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
