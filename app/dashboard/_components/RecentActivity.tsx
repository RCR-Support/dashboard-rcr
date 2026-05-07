import { Card, CardHeader, CardBody, Chip } from '@heroui/react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import Link from 'next/link';
import { Clock, FileText } from 'lucide-react';

interface RecentApplication {
  id: string;
  workerName: string;
  company?: string;
  status: string;
  createdAt: Date;
}

interface RecentActivityProps {
  applications: RecentApplication[];
}

const statusColors: Record<string, 'success' | 'warning' | 'danger' | 'default'> = {
  aprobado: 'success',
  pendiente: 'warning',
  rechazado: 'danger',
};

const statusLabels: Record<string, string> = {
  aprobado: 'Aprobado',
  pendiente: 'Pendiente',
  rechazado: 'Rechazado',
};

export default function RecentActivity({ applications }: RecentActivityProps) {
  if (applications.length === 0) {
    return (
      <Card className="dark:bg-[#282c34]">
        <CardHeader>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Actividad Reciente
          </h3>
        </CardHeader>
        <CardBody>
          <p className="text-default-400 text-center py-8">
            No hay solicitudes recientes
          </p>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card className="dark:bg-[#282c34]">
      <CardHeader>
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Actividad Reciente
        </h3>
      </CardHeader>
      <CardBody>
        <div className="space-y-3">
          {applications.map((app) => (
            <Link
              key={app.id}
              href={`/dashboard/applications/${app.id}`}
              className="flex items-center justify-between p-3 rounded-lg hover:bg-default-100 transition-colors"
            >
              <div className="flex items-center gap-3">
                <FileText className="h-4 w-4 text-default-400" />
                <div>
                  <p className="font-medium">{app.workerName}</p>
                  {app.company && (
                    <p className="text-sm text-default-400">{app.company}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <p className="text-xs text-default-400">
                  {format(new Date(app.createdAt), 'dd MMM', { locale: es })}
                </p>
                <Chip
                  color={statusColors[app.status] || 'default'}
                  size="sm"
                  variant="flat"
                >
                  {statusLabels[app.status] || app.status}
                </Chip>
              </div>
            </Link>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}
