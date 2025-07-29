import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// Eliminar una actividad
export async function deleteActivity(id: string) {
  return await prisma.activity.delete({ where: { id } });
}
