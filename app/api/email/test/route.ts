import { NextResponse } from 'next/server';
import { auth } from '@/auth';

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  }

  const token = process.env.POSTMARK_API_TOKEN;
  const from = process.env.EMAIL_FROM;
  const appUrl = process.env.APP_URL;

  // Verificar variables de entorno
  const config = {
    POSTMARK_API_TOKEN: token ? `✓ configurado (${token.slice(0, 8)}...)` : '✗ NO configurado',
    EMAIL_FROM: from || '✗ NO configurado',
    APP_URL: appUrl || '✗ NO configurado',
    NODE_ENV: process.env.NODE_ENV,
  };

  if (!token) {
    return NextResponse.json({ ok: false, config, error: 'POSTMARK_API_TOKEN falta' });
  }

  // Intentar enviar un email de test al usuario autenticado
  const { ServerClient } = await import('postmark');
  const client = new ServerClient(token);

  try {
    const result = await client.sendEmail({
      From: from || 'no-reply@rcrsupport.cl',
      To: session.user.email!,
      Subject: '✉️ Test de email — RCR Support',
      HtmlBody: `<p>Este es un email de prueba enviado desde Vercel.</p><p>Usuario: ${session.user.email}</p><p>Entorno: ${process.env.NODE_ENV}</p>`,
      MessageStream: 'outbound',
    });

    return NextResponse.json({ ok: true, config, postmark: result });
  } catch (err) {
    const error = err instanceof Error ? { message: err.message, stack: err.stack } : err;
    return NextResponse.json({ ok: false, config, error }, { status: 500 });
  }
}
