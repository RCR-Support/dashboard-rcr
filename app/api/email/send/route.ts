import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '../../../../lib/db';
import { sendApplicationConfirmationEmail } from '../../../../lib/email/postmark';

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const body = await req.json();
    const { applicationId, toEmail } = body;
    if (!applicationId) return NextResponse.json({ error: 'applicationId required' }, { status: 400 });

    const application = await db.application.findUnique({ where: { id: applicationId } });
    if (!application) return NextResponse.json({ error: 'Application not found' }, { status: 404 });

    const result = await sendApplicationConfirmationEmail(applicationId, toEmail);

    return NextResponse.json({ ok: true, result });
  } catch (err) {
    return NextResponse.json({ error: 'Error al enviar email' }, { status: 500 });
  }
}
