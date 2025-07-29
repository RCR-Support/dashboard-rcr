import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export async function listDocumentations() {
  return await prisma.documentation.findMany();
}
