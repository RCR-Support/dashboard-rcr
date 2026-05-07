'use client';

import { Card, CardBody, Button } from '@heroui/react';
import { CreditCard, Printer, AlertTriangle, Clock, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import StatCard from './StatCard';

interface Props {
  stats: {
    totalApproved: number;
    withQR: number;
    pendingPrint: number;
    expired: number;
    recentApproved: number;
  };
  userName: string;
}

export default function DashboardCredential({ stats, userName }: Props) {
  return (
    <div className="grid grid-cols-12 gap-4 w-full mx-auto">
      {/* Welcome */}
      <div className="col-span-12 card-box">
        <h1 className="text-2xl font-bold">Hola, {userName}</h1>
        <p className="text-default-500 mt-1">
          Panel de generación e impresión de credenciales
        </p>
      </div>

      {/* Stats */}
      <div className="col-span-12 md:col-span-6 lg:col-span-3">
        <StatCard
          title="Total Aprobadas"
          value={stats.totalApproved}
          icon={CheckCircle}
          iconColor="text-success"
        />
      </div>
      <div className="col-span-12 md:col-span-6 lg:col-span-3">
        <StatCard
          title="Pendientes de Impresión"
          value={stats.pendingPrint}
          icon={Printer}
          iconColor="text-primary"
        />
      </div>
      <div className="col-span-12 md:col-span-6 lg:col-span-3">
        <StatCard
          title="Vencidas"
          value={stats.expired}
          icon={AlertTriangle}
          iconColor="text-danger"
        />
      </div>
      <div className="col-span-12 md:col-span-6 lg:col-span-3">
        <StatCard
          title="Aprobadas esta semana"
          value={stats.recentApproved}
          icon={Clock}
          iconColor="text-warning"
        />
      </div>

      {/* Quick actions */}
      <div className="col-span-12">
        <Card className="dark:bg-[#282c34]">
          <CardBody className="p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Acciones rápidas
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="border border-default-200">
                <CardBody className="flex flex-row items-center gap-4 p-4">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <Printer className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">Imprimir Credenciales</h3>
                    <p className="text-sm text-default-500">
                      Ver solicitudes aprobadas y generar credenciales
                    </p>
                  </div>
                  <Button
                    as={Link}
                    href="/dashboard/credentials"
                    color="primary"
                    variant="flat"
                    size="sm"
                  >
                    Ir
                  </Button>
                </CardBody>
              </Card>

              {stats.expired > 0 && (
                <Card className="border border-danger-200">
                  <CardBody className="flex flex-row items-center gap-4 p-4">
                    <div className="p-3 bg-danger/10 rounded-lg">
                      <AlertTriangle className="h-6 w-6 text-danger" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-danger">Credenciales Vencidas</h3>
                      <p className="text-sm text-default-500">
                        Hay {stats.expired} credencial{stats.expired > 1 ? 'es' : ''} vencida{stats.expired > 1 ? 's' : ''}
                      </p>
                    </div>
                    <Button
                      as={Link}
                      href="/dashboard/credentials"
                      color="danger"
                      variant="flat"
                      size="sm"
                    >
                      Revisar
                    </Button>
                  </CardBody>
                </Card>
              )}
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
