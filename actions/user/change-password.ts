'use server';

import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { auth } from '@/auth';

export interface ChangePasswordResult {
  success: boolean;
  error?: string;
}

export async function changePassword(
  currentPassword: string,
  newPassword: string,
): Promise<ChangePasswordResult> {
  const session = await auth();

  if (!session?.user?.id) {
    return { success: false, error: 'No autenticado' };
  }

  // Validar nueva contraseña en el servidor
  if (newPassword.length < 6) {
    return { success: false, error: 'La contraseña debe tener al menos 6 caracteres' };
  }

  const specialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/;
  if (!specialChar.test(newPassword)) {
    return { success: false, error: 'La contraseña debe contener al menos un carácter especial' };
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { password: true },
  });

  if (!user?.password) {
    return { success: false, error: 'Usuario no encontrado' };
  }

  const isValid = await bcrypt.compare(currentPassword, user.password);
  if (!isValid) {
    return { success: false, error: 'La contraseña actual es incorrecta' };
  }

  const isSame = await bcrypt.compare(newPassword, user.password);
  if (isSame) {
    return { success: false, error: 'La nueva contraseña debe ser diferente a la actual' };
  }

  const hashed = await bcrypt.hash(newPassword, 10);

  await db.user.update({
    where: { id: session.user.id },
    data: { password: hashed },
  });

  return { success: true };
}
