import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/auth';
import { hasActionPermission } from '@/config/action-permissions';

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  }
  if (!hasActionPermission('activities:view', session.user.roles)) {
    return NextResponse.json({ error: 'Sin permiso' }, { status: 403 });
  }

  try {
    const activities = await db.activity.findMany({
      include: {
        requiredDocumentations: {
          include: {
            documentation: true,
          },
        },
      },
    });

    return NextResponse.json({ activities });
  } catch {
    return NextResponse.json(
      { error: 'Error al cargar actividades' },
      { status: 500 }
    );
  }
}
