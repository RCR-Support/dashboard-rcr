import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// Obtener una actividad por ID
export async function getActivityById(id: string) {
  if (!id) throw new Error("ID es obligatorio");
  
  return await prisma.activity.findUnique({
    where: { id },
    include: {
      requiredDocumentations: {
        include: {
          documentation: true
        }
      }
    }
  });
}
