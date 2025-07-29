import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export async function deleteDocumentation(id: string) {
  return await prisma.documentation.delete({ where: { id } });
}
