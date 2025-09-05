import { db } from '@/lib/db';
import { auth } from '@/auth';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return new NextResponse('No autorizado', { status: 401 });
    }

    console.log('Session user:', session.user);

    // Primero obtenemos el usuario con su compañía y roles
    // Obtener usuario con sus datos
    const user = await db.user.findUniqueOrThrow({
      where: {
        email: session.user.email,
      },
      include: {
        company: true,
      },
    });

    console.log('User data:', user);

    if (!user) {
      return new NextResponse('Usuario no encontrado', { status: 404 });
    }

    // Si el usuario no tiene compañía, retornar array vacío
    if (!user.companyId) {
      return NextResponse.json([]);
    }

    // Obtener solo los contratos de la compañía del usuario
    const contracts = await db.contract.findMany({
      where: {
        AND: [{ deletedAt: null }, { companyId: user.companyId }],
      },
      include: {
        Company: {
          select: {
            name: true,
            rut: true,
          },
        },
        userAc: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(contracts);
  } catch (error) {
    console.error('[CONTRACTS_GET]', error);
    return new NextResponse('Error interno', { status: 500 });
  }
}
