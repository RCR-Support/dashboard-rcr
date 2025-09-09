import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
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
    console.error('Error al obtener la compañía del usuario:', error);
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
    const body = await request.json();
    const { companyId } = body;

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
    console.error('Error al actualizar la compañía del usuario:', error);
    return NextResponse.json(
      { error: 'Error al actualizar la compañía del usuario' },
      { status: 500 }
    );
  }
}
