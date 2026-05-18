'use server';

import { db, withRetry } from '@/lib/db';
import { loginSchema, registerSchema } from '@/lib/zod';
import bcrypt from 'bcryptjs';
import { AuthError } from 'next-auth';
import { z } from 'zod';
import { auth, signIn } from '@/auth';

export const loginAction = async (values: z.infer<typeof loginSchema>) => {
  try {
    const user = await withRetry(() => db.user.findUnique({
      where: {
        email: values.email.toLowerCase(),
      },
      include: {
        company: true,
      },
    }));

    if (!user) {
      return { error: 'Credenciales inválidas' };
    }

    await signIn('credentials', {
      email: values.email.toLowerCase(),
      password: values.password,
    });

    return { success: true };
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: error.cause?.err?.message || 'Error de autenticación' };
    }
    // signIn() lanza NEXT_REDIRECT en éxito — hay que dejarlo pasar
    throw error;
  }
};
