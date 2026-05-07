'use client';

import ApplicationsView from './ApplicationsView';
import { Button } from '@heroui/button';
import { Card, CardBody } from '@heroui/card';
import Link from 'next/link';
import { ArrowRight, ClipboardList, FilePlus2, Plus, Sparkles } from 'lucide-react';
import { usePermissions } from '@/hooks/usePermissions';

interface Application {
  id: string;
  workerName: string;
  workerPaternal: string;
  workerMaternal: string;
  workerRun: string;
  status: string;
  stateAc: string;
  stateSheq: string;
  licenseExpiration: Date | null;
  createdAt: Date;
  company?: {
    name: string | null;
  } | null;
  contract: {
    contractNumber: string;
    contractName: string;
  } | null;
  userAc?: {
    displayName: string;
    email: string;
  } | null;
  userSheq?: {
    displayName: string;
    email: string;
  } | null;
  activities: Array<{
    name: string;
  }>;
  documentationFiles: Array<{
    url: string;
    type: string;
    documentationId: string | null;
  }>;
}

interface ApplicationsClientPageProps {
  initialApplications: Application[];
  userRole?: string;
  contractFilter?: { contractName: string; contractNumber: string } | null;
}

export default function ApplicationsClientPage({ initialApplications, userRole, contractFilter }: ApplicationsClientPageProps) {
  const { can } = usePermissions();
  const canEdit = can('applications:edit:any') || can('applications:edit:own');
  const canDelete = can('applications:delete');
  
  return (
    <div className="container mx-auto py-10 px-4">
      {contractFilter && (
        <div className="flex items-center justify-between bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
          <div>
            <p className="text-sm text-blue-600 dark:text-blue-300">
              Filtrando por contrato: <strong>{contractFilter.contractName}</strong> (N° {contractFilter.contractNumber})
            </p>
          </div>
          <Link href="/dashboard/applications">
            <Button size="sm" variant="flat" color="primary">
              Ver todas las solicitudes
            </Button>
          </Link>
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        {can('applications:create') && (
          <Link href="/dashboard/applications/create">
            <Button color="primary" startContent={<Plus className="w-4 h-4" />}>
              Nueva Solicitud
            </Button>
          </Link>
        )}
      </div>

      {initialApplications && initialApplications.length > 0 ? (
        <ApplicationsView applications={initialApplications} userRole={userRole} canEdit={canEdit} canDelete={canDelete} />
      ) : (
        <Card className="overflow-hidden border border-default-200 shadow-sm dark:border-default-100/10 dark:bg-slate-950">
          <CardBody className="p-0">
            <div className="relative overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.18),_transparent_32%),linear-gradient(135deg,_rgba(241,245,249,0.9),_rgba(255,255,255,1)_50%,_rgba(224,242,254,0.7))] px-6 py-10 dark:bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.22),_transparent_30%),linear-gradient(135deg,_rgba(2,6,23,0.96),_rgba(15,23,42,0.98)_50%,_rgba(8,47,73,0.9))] sm:px-10">
              <div className="absolute -right-10 top-6 h-28 w-28 rounded-full bg-sky-200/40 blur-2xl dark:bg-sky-400/20" />
              <div className="absolute bottom-0 left-0 h-24 w-24 rounded-full bg-cyan-200/40 blur-2xl dark:bg-cyan-400/15" />

              <div className="relative mx-auto max-w-3xl">
                <div className="mb-6 flex justify-center sm:justify-start">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-sky-500 text-white shadow-lg shadow-sky-500/20 dark:bg-sky-400 dark:text-slate-950 dark:shadow-sky-950/40">
                    <ClipboardList className="h-8 w-8" />
                  </div>
                </div>

                <div className="text-center sm:text-left">
                  <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-sky-200 bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-sky-700 dark:border-sky-400/20 dark:bg-slate-900/70 dark:text-sky-300">
                    <Sparkles className="h-3.5 w-3.5" />
                    Panel de solicitudes
                  </div>

                  <h2 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-50 sm:text-3xl">
                    {contractFilter
                      ? `Todavía no hay solicitudes para ${contractFilter.contractName}`
                      : 'Todavía no has registrado ninguna solicitud'}
                  </h2>

                  <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300 sm:mx-0 sm:text-base">
                    {contractFilter
                      ? `Este contrato aún no tiene ingresos creados. Puedes iniciar la primera solicitud ahora o quitar el filtro para revisar el resto del historial.`
                      : 'Aquí aparecerán las acreditaciones enviadas para revisión. Empieza creando la primera solicitud y deja preparado el flujo de aprobación para el trabajador.'}
                  </p>
                </div>

                <div className="mt-8 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl border border-white/70 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-white/10 dark:bg-slate-900/65 dark:shadow-black/20">
                    <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-sky-100 text-sky-700 dark:bg-sky-400/15 dark:text-sky-300">
                      <FilePlus2 className="h-5 w-5" />
                    </div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Crea el primer ingreso</p>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                      Registra al trabajador, adjunta su documentación y deja la solicitud lista para revisión.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/70 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-white/10 dark:bg-slate-900/65 dark:shadow-black/20">
                    <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-100 text-cyan-700 dark:bg-cyan-400/15 dark:text-cyan-300">
                      <ArrowRight className="h-5 w-5" />
                    </div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Mantén el flujo ordenado</p>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                      Cuando existan solicitudes, podrás revisarlas aquí en formato tabla o tarjetas según te acomode.
                    </p>
                  </div>
                </div>

                <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row sm:justify-start">
                  {can('applications:create') && (
                    <Link href="/dashboard/applications/create">
                      <Button color="primary" size="lg" startContent={<Plus className="h-4 w-4" />}>
                        Crear primera solicitud
                      </Button>
                    </Link>
                  )}

                  {contractFilter && (
                    <Link href="/dashboard/applications">
                      <Button variant="flat" size="lg" endContent={<ArrowRight className="h-4 w-4" />}>
                        Ver todas las solicitudes
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
