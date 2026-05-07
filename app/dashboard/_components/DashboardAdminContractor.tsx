'use client';

import StatCard from '../_components/StatCard';
import QuickActions from '../_components/QuickActions';
import RecentActivity from '../_components/RecentActivity';
import { FileText, Clock, CheckCircle, XCircle, Eye, FileCheck } from 'lucide-react';

interface AdminContractorStatsData {
  myContracts: number;
  applicationsInMyContracts: number;
  pendingDocuments: number;
  rejectedApplications: number;
  approvedThisMonth: number;
  recentApplications: Array<{
    id: string;
    workerName: string;
    company: string;
    status: string;
    createdAt: Date;
  }>;
}

interface DashboardAdminContractorProps {
  stats: AdminContractorStatsData;
  userName: string;
}

export default function DashboardAdminContractor({ 
  stats, 
  userName 
}: DashboardAdminContractorProps) {
  const quickActions = [
    {
      label: 'Mis Contratos',
      href: '/dashboard/contracts',
      icon: FileCheck,
      color: 'primary' as const,
    },
    {
      label: 'Solicitudes Pendientes',
      href: '/dashboard/applications?status=pendiente',
      icon: Eye,
      color: 'warning' as const,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Dashboard - {userName}</h1>
        <p className="text-default-500 mt-1">
          Gestión de contratos y revisión de documentos
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Mis Contratos"
          value={stats.myContracts}
          icon={FileCheck}
          iconColor="text-blue-500"
        />
        <StatCard
          title="Solicitudes en Contratos"
          value={stats.applicationsInMyContracts}
          icon={FileText}
          iconColor="text-purple-500"
        />
        <StatCard
          title="Documentos Pendientes"
          value={stats.pendingDocuments}
          icon={Clock}
          iconColor="text-orange-500"
          description="Requieren revisión"
        />
        <StatCard
          title="Aprobadas este Mes"
          value={stats.approvedThisMonth}
          icon={CheckCircle}
          iconColor="text-green-500"
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <StatCard
          title="Solicitudes Rechazadas"
          value={stats.rejectedApplications}
          icon={XCircle}
          iconColor="text-red-500"
          description="Requieren atención"
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
