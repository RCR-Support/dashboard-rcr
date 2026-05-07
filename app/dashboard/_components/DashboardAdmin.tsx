'use client';

import StatCard from '../_components/StatCard';
import QuickActions from '../_components/QuickActions';
import RecentActivity from '../_components/RecentActivity';
import { Card, CardHeader, CardBody } from '@heroui/react';
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  Building2, 
  FileCheck,
  Users,
  Plus,
  Eye,
  PieChart
} from 'lucide-react';

interface AdminStatsData {
  totalApplications: number;
  pendingApplications: number;
  approvedThisMonth: number;
  rejectedApplications: number;
  totalCompanies: number;
  activeContracts: number;
  totalUsers: number;
  roleCount: Record<string, number>;
  recentApplications: Array<{
    id: string;
    workerName: string;
    company: string;
    status: string;
    createdAt: Date;
  }>;
}

interface DashboardAdminProps {
  stats: AdminStatsData;
}

const roleLabels: Record<string, string> = {
  admin: 'Administradores',
  sheq: 'SHEQ',
  adminContractor: 'Admin Contratistas',
  user: 'Usuarios',
  credential: 'Credenciales',
};

export default function DashboardAdmin({ stats }: DashboardAdminProps) {
  const quickActions = [
    {
      label: 'Crear Empresa',
      href: '/dashboard/companies',
      icon: Plus,
      color: 'primary' as const,
    },
    {
      label: 'Crear Contrato',
      href: '/dashboard/contracts/create',
      icon: FileCheck,
      color: 'secondary' as const,
    },
    {
      label: 'Ver Solicitudes Pendientes',
      href: '/dashboard/applications?status=pendiente',
      icon: Eye,
      color: 'warning' as const,
    },
    {
      label: 'Gestionar Usuarios',
      href: '/dashboard/users',
      icon: Users,
      color: 'success' as const,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Dashboard Administrativo</h1>
        <p className="text-default-500 mt-1">
          Vista general del sistema de acreditaciones
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Solicitudes"
          value={stats.totalApplications}
          icon={FileText}
          iconColor="text-blue-500"
        />
        <StatCard
          title="Pendientes de Revisión"
          value={stats.pendingApplications}
          icon={Clock}
          iconColor="text-orange-500"
        />
        <StatCard
          title="Aprobadas este Mes"
          value={stats.approvedThisMonth}
          icon={CheckCircle}
          iconColor="text-green-500"
        />
        <StatCard
          title="Empresas Activas"
          value={stats.totalCompanies}
          icon={Building2}
          iconColor="text-purple-500"
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="Contratos Activos"
          value={stats.activeContracts}
          icon={FileCheck}
          iconColor="text-cyan-500"
        />
        <StatCard
          title="Total Usuarios"
          value={stats.totalUsers}
          icon={Users}
          iconColor="text-indigo-500"
        />
        <StatCard
          title="Rechazadas"
          value={stats.rejectedApplications}
          icon={FileText}
          iconColor="text-red-500"
          description="Requieren corrección"
        />
      </div>

      {/* Quick Actions */}
      <Card className="dark:bg-[#282c34]">
        <CardHeader>
          <h3 className="text-lg font-semibold">Acciones Rápidas</h3>
        </CardHeader>
        <CardBody>
          <QuickActions actions={quickActions} />
        </CardBody>
      </Card>

      {/* Recent Activity and Users by Role */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentActivity applications={stats.recentApplications} />
        
        {/* Users by Role */}
        <Card className="dark:bg-[#282c34]">
          <CardHeader>
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Usuarios por Rol
            </h3>
          </CardHeader>
          <CardBody>
            <div className="space-y-4">
              {Object.entries(stats.roleCount).map(([role, count]) => (
                <div key={role} className="flex items-center justify-between">
                  <span className="text-default-600">
                    {roleLabels[role] || role}
                  </span>
                  <span className="font-semibold">{count}</span>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
