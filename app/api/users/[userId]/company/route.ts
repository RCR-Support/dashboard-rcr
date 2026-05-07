import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/auth';
import { hasActionPermission } from '@/config/action-permissions';

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    // Solo el propio usuario o un admin puede ver la empresa
    if (
      params.userId !== session.user.id &&
      !hasActionPermission('users:edit:any', session.user.roles)
    ) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const user = await db.user.findUnique({
      where: {
        id: params.userId,
      },
      include: {
        company: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({ company: user.company });
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al obtener la información de la compañía' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    // Solo un admin puede cambiar la empresa de un usuario
    if (!hasActionPermission('users:edit:any', session.user.roles)) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const body = await request.json();
    const { companyId } = body;

    if (companyId !== null && typeof companyId !== 'string') {
      return NextResponse.json({ error: 'companyId inválido' }, { status: 400 });
    }

    const updatedUser = await db.user.update({
      where: {
        id: params.userId,
      },
      data: {
        companyId,
      },
      include: {
        company: true,
      },
    });

    return NextResponse.json({ user: updatedUser });
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al actualizar la compañía del usuario' },
      { status: 500 }
    );
  }
}
