import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/auth';
import { hasActionPermission } from '@/config/action-permissions';
import bcrypt from 'bcryptjs';
import { sendWelcomeEmail } from '@/lib/email/postmark';

// 1. Control de errores más detallado
function logError(error: unknown) {
  if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line no-console
    console.error('[API][PATCH /api/users] Error:', error);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }
    if (!hasActionPermission('companies:view:all', session.user.roles)) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const { id, isActive, deletedLogic } = await req.json();
    if (!id) {
      return NextResponse.json({ error: 'ID requerido' }, { status: 400 });
    }
    const data: { isActive?: boolean; deletedLogic?: boolean; password?: string } = {};
    if (typeof isActive === 'boolean') data.isActive = isActive;
    if (typeof deletedLogic === 'boolean') data.deletedLogic = deletedLogic;
    if (Object.keys(data).length === 0) {
      return NextResponse.json(
        { error: 'Sin cambios válidos' },
        { status: 400 }
      );
    }

    // Leer el estado actual del usuario para detectar activación de pre-registro
    const existingUser = await db.user.findUnique({
      where: { id },
      select: { isActive: true, password: true, email: true, displayName: true, userName: true, name: true, lastName: true },
    });

    // Generar contraseña temporal si se está activando un usuario sin contraseña (pre-registro)
    let tempPassword: string | null = null;
    if (
      isActive === true &&
      existingUser &&
      existingUser.isActive === false &&
      !existingUser.password
    ) {
      // Genera una contraseña tipo "Rcr#XXXXXX" con 6 chars aleatorios
      const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
      let rand = '';
      for (let i = 0; i < 6; i++) rand += chars[Math.floor(Math.random() * chars.length)];
      tempPassword = `Rcr#${rand}`;
      data.password = await bcrypt.hash(tempPassword, 10);
    }

    const user = await db.user.update({
      where: { id },
      data,
    });

    // Enviar correo de bienvenida si se activó una cuenta pre-registrada
    if (tempPassword && existingUser?.email) {
      try {
        await sendWelcomeEmail({
          toEmail: existingUser.email,
          displayName: existingUser.displayName || `${existingUser.name} ${existingUser.lastName}`,
          userName: existingUser.userName ?? existingUser.email,
          password: tempPassword,
          isTemporaryPassword: true,
        });
      } catch (emailError) {
        console.error('[PATCH /api/users] Error enviando correo de bienvenida:', emailError);
      }
    }

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

export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }
    if (!hasActionPermission('users:delete', session.user.roles)) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const { id } = await req.json();
    if (!id) {
      return NextResponse.json({ error: 'ID requerido' }, { status: 400 });
    }

    const user = await db.user.findUnique({
      where: { id },
      select: { deletedLogic: true, email: true },
    });
    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }
    if (!user.deletedLogic) {
      return NextResponse.json(
        { error: 'Solo se puede eliminar permanentemente un usuario marcado como eliminado (borrado lógico).' },
        { status: 422 }
      );
    }

    // Verificar registros asociados que impidan el borrado permanente
    const [applications, contractsAsAc, reassignments, audits] = await Promise.all([
      db.application.count({ where: { userId: id } }),
      db.contract.count({ where: { useracId: id } }),
      db.reassignmentLog.count({ where: { OR: [{ newAcId: id }, { previousAcId: id }, { userId: id }] } }),
      db.applicationAudit.count({ where: { changedById: id } }),
    ]);

    const blockers: string[] = [];
    if (applications > 0) blockers.push(`${applications} solicitud(es) de acreditación`);
    if (contractsAsAc > 0) blockers.push(`${contractsAsAc} contrato(s) como administrador`);
    if (reassignments > 0) blockers.push(`${reassignments} registro(s) de reasignación`);
    if (audits > 0) blockers.push(`${audits} auditoría(s) de solicitudes`);

    if (blockers.length > 0) {
      return NextResponse.json(
        {
          error: 'No se puede eliminar permanentemente este usuario porque tiene registros asociados.',
          blockers,
        },
        { status: 409 }
      );
    }

    // Sin registros bloqueantes: eliminar notificaciones propias y luego el usuario
    await db.$transaction(async (tx) => {
      await tx.notification.deleteMany({ where: { userId: id } });
      await tx.userRole.deleteMany({ where: { userId: id } });
      await tx.user.delete({ where: { id } });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[DELETE /api/users]', error);
    return NextResponse.json(
      { error: 'Error al eliminar usuario', details: error instanceof Error ? error.message : error },
      { status: 500 }
    );
  }
}
