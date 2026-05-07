import { db } from '@/lib/db';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/auth';
import { ApplicationDetail } from './ApplicationDetail';
import { getSheqUsers } from '@/actions/applications/get-sheq-users';
import { hasActionPermission } from '@/config/action-permissions';
import { RoleEnum } from '@prisma/client';

export default async function ApplicationPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await auth();
  
  if (!session?.user) {
    notFound();
  }

  const sheqUsers = await getSheqUsers();
  const versioningAvailable = false;

  const application = await db.application.findUnique({
    where: {
      id: params.id,
    },
    select: {
      id: true,
      workerName: true,
      workerPaternal: true,
      workerMaternal: true,
      workerRun: true,
      license: true,
      licenseExpiration: true,
      status: true,
      processStatus: true,
      stateAc: true,
      stateSheq: true,
      createdAt: true,
      company: {
        select: {
          id: true,
          name: true,
          phone: true,
        },
      },
      contract: {
        select: {
          contractNumber: true,
          contractName: true,
          initialDate: true,
          finalDate: true,
        },
      },
      userAc: {
        select: {
          id: true,
          displayName: true,
          email: true,
        },
      },
      userSheq: {
        select: {
          id: true,
          displayName: true,
          email: true,
        },
      },
      activities: {
        select: {
          id: true,
          name: true,
        },
      },
      documentationFiles: {
        select: {
          id: true,
          url: true,
          type: true,
          expiresAt: true,
          documentationId: true,
          approvalStatus: true,
          rejectionReason: true,
          documentation: {
            select: {
              name: true,
            },
          },
        },
      },
      audits: {
        select: {
          id: true,
          action: true,
          changedAt: true,
          details: true,
          changedBy: {
            select: {
              displayName: true,
              email: true,
            },
          },
        },
        orderBy: {
          changedAt: 'desc',
        },
      },
    },
  });

  if (!application) {
    notFound();
  }

  // ===== Permisos de visualización =====
  const user = session.user;
  const userRoles = user.roles as RoleEnum[];

  const canViewAll = hasActionPermission('applications:view:all', userRoles);
  const canViewAssigned = hasActionPermission('applications:view:assigned', userRoles);
  const canViewOwn = hasActionPermission('applications:view:own', userRoles);

  if (!canViewAll) {
    if (canViewAssigned) {
      // permite sólo si está asignado como AC o SHEQ
      if (application.userAc?.id !== user.id && application.userSheq?.id !== user.id) {
        return (
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <h2 className="text-2xl font-semibold mb-2">Acceso denegado</h2>
              <p className="text-default-400">No tienes permisos para ver esta solicitud.</p>
              <div className="mt-4">
                <Link href="/dashboard" className="text-primary">Volver al Dashboard</Link>
              </div>
            </div>
          </div>
        );
      }
    } else if (canViewOwn) {
      // permite sólo si pertenece a la misma empresa
      if (!user.companyId || application.company?.id !== user.companyId) {
        return (
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <h2 className="text-2xl font-semibold mb-2">Acceso denegado</h2>
              <p className="text-default-400">No tienes permisos para ver esta solicitud.</p>
              <div className="mt-4">
                <Link href="/dashboard" className="text-primary">Volver al Dashboard</Link>
              </div>
            </div>
          </div>
        );
      }
    } else {
      return (
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <h2 className="text-2xl font-semibold mb-2">Acceso denegado</h2>
            <p className="text-default-400">No tienes permisos para ver esta solicitud.</p>
            <div className="mt-4">
              <Link href="/dashboard" className="text-primary">Volver al Dashboard</Link>
            </div>
          </div>
        </div>
      );
    }
  }

  return (
    <ApplicationDetail 
      application={application} 
      userRoles={session.user.roles}
      userId={session.user.id}
      sheqUsers={sheqUsers}
      versioningAvailable={versioningAvailable}
    />
  );
}
