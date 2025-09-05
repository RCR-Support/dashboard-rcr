import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// 1. Control de errores más detallado
function logError(error: unknown) {
  if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line no-console
    console.error('[API][PATCH /api/users] Error:', error);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    // 2. Validación de permisos (ejemplo: solo admin puede cambiar)
    // NOTA: Ajusta según tu sistema de autenticación real
    // Si usas next-auth, puedes obtener el usuario de la sesión aquí
    // const session = await getServerSession(authOptions);
    // if (!session || session.user.role !== 'admin') {
    //   return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    // }

    const { id, isActive, deletedLogic } = await req.json();
    if (!id) {
      return NextResponse.json({ error: 'ID requerido' }, { status: 400 });
    }
    const data: any = {};
    if (typeof isActive === 'boolean') data.isActive = isActive;
    if (typeof deletedLogic === 'boolean') data.deletedLogic = deletedLogic;
    if (Object.keys(data).length === 0) {
      return NextResponse.json(
        { error: 'Sin cambios válidos' },
        { status: 400 }
      );
    }
    const user = await db.user.update({
      where: { id },
      data,
    });
    return NextResponse.json({ user });
  } catch (error) {
    logError(error);
    return NextResponse.json(
      {
        error: 'Error al actualizar usuario',
        details: error instanceof Error ? error.message : error,
      },
      { status: 500 }
    );
  }
}
