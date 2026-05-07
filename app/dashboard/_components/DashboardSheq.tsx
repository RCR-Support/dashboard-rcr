'use client';

import StatCard from '../_components/StatCard';
import QuickActions from '../_components/QuickActions';
import RecentActivity from '../_components/RecentActivity';
import { FileText, Clock, CheckCircle, XCircle, Eye } from 'lucide-react';

interface SheqStatsData {
  assignedApplications: number;
  pendingDocuments: number;
  approvedThisWeek: number;
  rejectedTotal: number;
  recentApplications: Array<{
    id: string;
    workerName: string;
    company: string;
    status: string;
    createdAt: Date;
  }>;
}

interface DashboardSheqProps {
  stats: SheqStatsData;
  userName: string;
}

export default function DashboardSheq({ stats, userName }: DashboardSheqProps) {
  const quickActions = [
    {
      label: 'Ver Solicitudes Asignadas',
      href: '/dashboard/applications',
      icon: Eye,
      color: 'primary' as const,
    },
    {
      label: 'Documentos Pendientes',
      href: '/dashboard/applications?status=pendiente',
      icon: Clock,
      color: 'warning' as const,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Dashboard SHEQ - {userName}</h1>
        <p className="text-default-500 mt-1">
          Aprobación final de documentos de seguridad
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Solicitudes Asignadas"
          value={stats.assignedApplications}
          icon={FileText}
          iconColor="text-blue-500"
        />
        <StatCard
          title="Documentos Pendientes"
          value={stats.pendingDocuments}
          icon={Clock}
          iconColor="text-orange-500"
          description="Requieren aprobación"
        />
        <StatCard
          title="Aprobadas esta Semana"
          value={stats.approvedThisWeek}
          icon={CheckCircle}
          iconColor="text-green-500"
        />
        <StatCard
          title="Rechazadas"
          value={stats.rejectedTotal}
          icon={XCircle}
          iconColor="text-red-500"
          description="Histórico"
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-default-50 dark:bg-[#282c34] rounded-lg p-4">
        <QuickActions actions={quickActions} />
      </div>

      {/* Recent Activity */}
      <RecentActivity applications={stats.recentApplications} />
    </div>
  );
}
