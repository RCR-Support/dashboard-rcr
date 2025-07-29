import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const zones = [
  "Verde",
  "Amarilla",
  "Despacho",
  "Roja"
];

async function main() {
  for (const name of zones) {
    await prisma.zone.create({ data: { name } });
  }
  console.log('Seed de zonas completado');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
