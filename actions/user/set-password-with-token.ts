'use server';

import { setPasswordWithSetupToken } from '@/lib/security/password-setup';

export async function setPasswordWithToken(
  email: string,
  token: string,
  password: string
) {
  if (!email || !token) {
    return { success: false, error: 'El enlace es inválido o está incompleto' };
  }

  return setPasswordWithSetupToken(email, token, password);
}