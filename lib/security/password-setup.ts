import { createHash, randomBytes, timingSafeEqual } from 'crypto';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';

const PASSWORD_SETUP_TTL_MS = 24 * 60 * 60 * 1000;

function hashToken(token: string) {
  return createHash('sha256').update(token).digest('hex');
}

export async function createPasswordSetupUrl(email: string) {
  const token = randomBytes(32).toString('hex');

  await db.verificationToken.upsert({
    where: { identifier: email },
    create: {
      identifier: email,
      token: hashToken(token),
      expires: new Date(Date.now() + PASSWORD_SETUP_TTL_MS),
    },
    update: {
      token: hashToken(token),
      expires: new Date(Date.now() + PASSWORD_SETUP_TTL_MS),
    },
  });

  const appUrl = (process.env.APP_URL || '').replace(/\/$/, '');
  return `${appUrl}/set-password?email=${encodeURIComponent(email)}&token=${token}`;
}

export async function setPasswordWithSetupToken(
  email: string,
  token: string,
  password: string
) {
  if (password.length < 6) {
    return { success: false, error: 'La contraseña debe tener al menos 6 caracteres' };
  }

  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    return { success: false, error: 'La contraseña debe contener al menos un carácter especial' };
  }

  const setupToken = await db.verificationToken.findUnique({
    where: { identifier: email },
  });

  if (!setupToken || setupToken.expires < new Date()) {
    return { success: false, error: 'El enlace es inválido o ya venció' };
  }

  const expected = Buffer.from(setupToken.token, 'hex');
  const received = Buffer.from(hashToken(token), 'hex');
  if (expected.length !== received.length || !timingSafeEqual(expected, received)) {
    return { success: false, error: 'El enlace es inválido o ya venció' };
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  await db.$transaction([
    db.user.update({ where: { email }, data: { password: hashedPassword } }),
    db.verificationToken.delete({ where: { identifier: email } }),
  ]);

  return { success: true };
}