'use client';

import StatCard from '../_components/StatCard';
import QuickActions from '../_components/QuickActions';
import RecentActivity from '../_components/RecentActivity';
import { FileText, Clock, CheckCircle, XCircle, Plus, Eye } from 'lucide-react';
import { Card, CardHeader, CardBody } from '@heroui/react';

interface UserStatsData {
  totalApplications: number;
  pendingApplications: number;
  approvedApplications: number;
  rejectedApplications: number;
  company?: {
    id: string;
    name: string | null;
    rut: string;
    phone?: string | null;
    status?: boolean;
  } | null;
  contractsCount?: number;
  contractsExpiringSoon?: number;
  documentsPending?: number;
  recentApplications: Array<{
    id: string;
    workerName: string;
    status: string;
    createdAt: Date;
  }>;
}

interface DashboardUserProps {
  stats: UserStatsData;
  userName: string;
}

export default function DashboardUser({ stats, userName }: DashboardUserProps) {
  const quickActions = [
    {
      label: 'Crear Nueva Solicitud',
      href: '/dashboard/applications/create',
      icon: Plus,
      color: 'primary' as const,
    },
    {
      label: 'Ver Solicitudes Rechazadas',
      href: '/dashboard/applications?status=rechazado',
      icon: Eye,
      color: 'danger' as const,
    },
  ];

  return (
    <div className="grid grid-cols-12 gap-6">
      {/* Header */}
      <div className="col-span-12 sm:grid-cols-2 gap-4">
        <div className="flex items-center justify-between w-full">
          <div>
            <h1 className="text-2xl font-semibold">¡Hola, {userName}!</h1>
            <p className="text-default-500 mt-0.5 text-sm">Gestiona tus solicitudes de acreditación</p>
          </div>
          {stats.company && (
            <div className="text-right">
              <p className="text-sm text-default-500">Empresa</p>
              <p className="font-semibold">{stats.company.name || 'Sin nombre'}</p>
              {/* <p className="text-xs text-default-400">RUT: {stats.company.rut}</p> */}
            </div>
          )}
        </div>
      </div>

      {/* Right: Sidebar with company, quick actions and secondary stats */}
      <div className="col-span-12 lg:col-span-4 flex flex-col gap-4">
        <Card className="p-4 dark:bg-[#282c34]">
          <CardHeader>
            <h3 className="text-sm font-semibold">Información Empresa</h3>
          </CardHeader>
          <CardBody>
            {stats.company ? (
              <div className="space-y-1">
                <p className="font-semibold text-lg truncate">{stats.company.name || 'Sin nombre'}</p>
                <p className="text-sm text-default-500">RUT: {stats.company.rut}</p>
                {stats.company.phone && <p className="text-sm text-default-500">Tel: {stats.company.phone}</p>}
                <p className="text-sm text-default-500">Estado: {stats.company.status ? 'Activo' : 'Inactivo'}</p>
              </div>
            ) : (
              <p className="text-sm text-default-500">Sin empresa asociada</p>
            )}
          </CardBody>
        </Card>

        <Card className="p-4 dark:bg-[#282c34]">
          <CardHeader>
            <h3 className="text-sm font-semibold">Acciones Rápidas</h3>
          </CardHeader>
          <CardBody>
            <QuickActions actions={quickActions} />
          </CardBody>
        </Card>

        <Card className="p-4 dark:bg-[#282c34]">
          <CardHeader>
            <h3 className="text-sm font-semibold">Contratos y Documentos</h3>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="text-xs text-default-500">Contratos</p>
                <p className="font-semibold text-lg">{stats.contractsCount ?? 0}</p>
                <p className="text-xs text-default-500">Expiran 30d: {stats.contractsExpiringSoon ?? 0}</p>
              </div>
              <div>
                <p className="text-xs text-default-500">Docs pendientes</p>
                <p className="font-semibold text-lg">{stats.documentsPending ?? 0}</p>
                <p className="text-xs text-default-500">Revisión pendiente</p>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Left: Main stats (bento large block) */}
      <div className="col-span-12 lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <StatCard
          title="Mis Solicitudes"
          value={stats.totalApplications}
          icon={FileText}
          iconColor="text-blue-500"
        />
        <StatCard
          title="Pendientes"
          value={stats.pendingApplications}
          icon={Clock}
          iconColor="text-orange-500"
          description="En revisión"
        />
        <StatCard
          title="Aprobadas"
          value={stats.approvedApplications}
          icon={CheckCircle}
          iconColor="text-green-500"
        />
        <StatCard
          title="Rechazadas"
          value={stats.rejectedApplications}
          icon={XCircle}
          iconColor="text-red-500"
          description="Requieren corrección"
        />
      </div>

      {/* Recent Activity - left under main */}
      <div className="col-span-12 lg:col-span-7">
        <RecentActivity applications={stats.recentApplications} />
      </div>

      {/* Help / Alerts - right under sidebar */}
      <div className="col-span-12 lg:col-span-5">
        {stats.rejectedApplications > 0 ? (
          <Card className="bg-red-50 dark:bg-[#282c34] border border-red-200 dark:border-red-800">
            <CardBody>
              <div className="flex items-start gap-3">
                <XCircle className="h-5 w-5 text-red-500 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-red-700 dark:text-red-400">
                    Tienes {stats.rejectedApplications} solicitud(es) rechazada(s)
                  </h4>
                  <p className="text-sm text-red-600 dark:text-red-300 mt-1">
                    Por favor, revisa y corrige los documentos observados para continuar con el proceso de acreditación.
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>
        ) : (
          <Card className="border-2 border-dashed border-default-200 dark:border-default-800 bg-white/50 dark:bg-[#282c34] h-full">
            <CardBody>
              <div className="flex items-center gap-3 text-default-500">
                <CheckCircle className="h-5 w-5 text-green-400" />
                <div>
                  <h4 className="font-semibold">Sin alertas</h4>
                  <p className="text-sm text-default-500 mt-1">No hay solicitudes rechazadas en tu empresa.</p>
                </div>
              </div>
            </CardBody>
          </Card>
        )}
      </div>
    </div>
  );
}
