import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export async function editDocumentation(
  id: string,
  name: string,
  isGlobal: boolean
) {
  return await prisma.documentation.update({
    where: { id },
    data: { name, isGlobal },
  });
}
