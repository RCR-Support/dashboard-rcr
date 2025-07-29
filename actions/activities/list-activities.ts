import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// Listar todas las actividades
export async function listActivities() {
  return await prisma.activity.findMany({
    include: {
      requiredDocumentations: {
        include: {
          documentation: true
        }
      }
    }
  });
}
