import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export async function createDocumentation(name: string, isGlobal: boolean) {
  return await prisma.documentation.create({
    data: { name, isGlobal }
  });
}
