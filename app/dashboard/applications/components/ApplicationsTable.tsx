'use client';

import { formatRun } from '@/lib/validations';
import { Chip } from '@heroui/chip';
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from '@heroui/table';
import { Eye, Pencil, Trash2, Calendar, FileText, Activity, Filter, Search, CheckCircle2, Clock, AlertCircle, XCircle, Printer } from 'lucide-react';
import { Button } from '@heroui/button';
import { Tooltip } from '@heroui/tooltip';
import { Input } from '@heroui/input';
import { Select, SelectItem } from '@heroui/select';
import Link from 'next/link';
import Swal from 'sweetalert2';
import { deleteApplication } from '@/actions/applications/delete-application';
import { useRouter } from 'next/navigation';
import { useState, useMemo } from 'react';

interface Application {
  id: string;
  workerName: string;
  workerPaternal: string;
  workerMaternal: string;
  workerRun: string;
  status: string;
  stateAc: string;
  stateSheq: string;
  createdAt: Date;
  licenseExpiration: Date | null;
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

interface ApplicationsTableProps {
  applications: Application[];
  userRole?: string;
  canEdit?: boolean;
  canDelete?: boolean;
}

const statusColorMap: Record<string, 'success' | 'warning' | 'danger' | 'default'> = {
  PENDING: 'warning',
  APPROVED: 'success',
  REJECTED: 'danger',
  IN_REVIEW: 'default',
};

const statusLabelMap: Record<string, string> = {
  PENDING: 'Pendiente',
  APPROVED: 'Aprobada',
  REJECTED: 'Rechazada',
  IN_REVIEW: 'En Revisión',
};

const stateAcColorMap: Record<string, 'success' | 'warning' | 'danger'> = {
  aprobado: 'success',
  pendiente: 'warning',
  adjuntar: 'danger',
};

const stateAcLabelMap: Record<string, string> = {
  aprobado: 'Aprobado',
  pendiente: 'Pendiente',
  adjuntar: 'Rechazado',
};

const stateSheqColorMap: Record<string, 'success' | 'warning' | 'danger'> = {
  aprobado: 'success',
  pendiente: 'warning',
  rechazado: 'danger',
};

const stateSheqLabelMap: Record<string, string> = {
  aprobado: 'Aprobado',
  pendiente: 'Pendiente',
  rechazado: 'Rechazado',
};

const getOverallStatus = (stateAc: string, stateSheq: string) => {
  if (stateAc === 'aprobado' && stateSheq === 'aprobado') {
    return { label: 'Completado', color: 'success' as const, icon: CheckCircle2 };
  }
  if (stateAc === 'adjuntar' || stateSheq === 'rechazado') {
    return { label: 'Requiere atención', color: 'danger' as const, icon: AlertCircle };
  }
  if (stateAc === 'aprobado') {
    return { label: 'AC Aprobado', color: 'warning' as const, icon: Clock };
  }
  return { label: 'En proceso', color: 'default' as const, icon: Clock };
};

export function ApplicationsTable({ applications, userRole, canEdit = false, canDelete = false }: ApplicationsTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const router = useRouter();

  const filteredAndSortedApplications = useMemo(() => {
    const filtered = applications.filter(app => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = 
        app.workerName.toLowerCase().includes(searchLower) ||
        `${app.workerPaternal} ${app.workerMaternal}`.toLowerCase().includes(searchLower) ||
        app.workerRun.toLowerCase().includes(searchLower) ||
        app.contract?.contractName.toLowerCase().includes(searchLower) ||
        app.company?.name?.toLowerCase().includes(searchLower);

      const overallStatus = getOverallStatus(app.stateAc, app.stateSheq);
      const matchesStatus = statusFilter === 'all' || overallStatus.label === statusFilter;

      return matchesSearch && matchesStatus;
    });

    return filtered.sort((a, b) => {
      if (sortBy === 'createdAt') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      return 0;
    });
  }, [applications, searchTerm, statusFilter, sortBy]);

  const handleEditClick = async (appId: string) => {
    const result = await Swal.fire({
      title: '¿Editar solicitud?',
      html: 'Al editar esta solicitud se <strong>reiniciará todo el proceso</strong> de revisión.<br><br>Los estados de aprobación actuales se perderán y deberá volver a pasar por el flujo de validación.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#f59e0b',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sí, editar',
      cancelButtonText: 'Cancelar',
    });

    if (result.isConfirmed) {
      router.push(`/dashboard/applications/${appId}/edit`);
    }
  };

  const handleDeleteClick = async (appId: string, workerName: string) => {
    const result = await Swal.fire({
      title: '¿Eliminar solicitud?',
      html: `Esta acción <strong>eliminará permanentemente</strong> la solicitud de <strong>${workerName}</strong>.<br><br>Se eliminarán todos los documentos e imágenes asociados.<br><br><span style="color: red;">Esta acción no se puede deshacer.</span>`,
      icon: 'error',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    });

    if (result.isConfirmed) {
      const deleteResult = await deleteApplication(appId);
      
      if (deleteResult.success) {
        await Swal.fire({
          icon: 'success',
          title: 'Solicitud eliminada',
          text: 'La solicitud y todos sus archivos han sido eliminados',
          timer: 2000,
          showConfirmButton: false,
        });
        router.refresh();
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: deleteResult.error || 'No se pudo eliminar la solicitud',
        });
      }
    }
  };

  return (
    <div className="space-y-4">
      {/* Filtros y búsqueda */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-3 flex-1">
          <Input
            type="text"
            placeholder="Buscar por nombre, RUN, contrato o empresa..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            startContent={<Search className="h-4 w-4 text-gray-400" />}
            className="sm:max-w-xs"
          />
          <Select
            placeholder="Estado"
            selectedKeys={statusFilter !== 'all' ? [statusFilter] : []}
            onSelectionChange={(keys) => {
              const selected = Array.from(keys)[0] as string;
              setStatusFilter(selected || 'all');
            }}
            className="sm:max-w-xs"
          >
            <SelectItem key="all">Todos</SelectItem>
            <SelectItem key="Completado">Completado</SelectItem>
            <SelectItem key="AC Aprobado">AC Aprobado</SelectItem>
            <SelectItem key="En proceso">En proceso</SelectItem>
            <SelectItem key="Requiere atención">Requiere atención</SelectItem>
          </Select>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <FileText className="h-4 w-4" />
          <span>Total: {filteredAndSortedApplications.length} solicitudes</span>
        </div>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <Table 
          aria-label="Tabla de solicitudes"
          className="min-w-full"
        >
          <TableHeader>
            <TableColumn className="min-w-[200px]">TRABAJADOR</TableColumn>
            <TableColumn className="min-w-[150px]">EMPRESA</TableColumn>
            <TableColumn className="min-w-[180px]">CONTRATO</TableColumn>
            <TableColumn className="min-w-[140px]">ACTIVIDADES</TableColumn>
            <TableColumn className="min-w-[100px]">DOCUMENTOS</TableColumn>
            <TableColumn className="min-w-[140px]">ESTADO GENERAL</TableColumn>
            <TableColumn className="min-w-[120px]">FECHA CREACIÓN</TableColumn>
            <TableColumn className="min-w-[120px]">ACCIONES</TableColumn>
          </TableHeader>
          <TableBody>
            {filteredAndSortedApplications.map((app) => {
              const workerFullName = `${app.workerName} ${app.workerPaternal} ${app.workerMaternal}`;
              const overallStatus = getOverallStatus(app.stateAc, app.stateSheq);
              const StatusIcon = overallStatus.icon;
              const docCount = app.documentationFiles?.filter(
                doc => doc.documentationId !== null && !(doc.type === 'IMG' && !doc.documentationId)
              ).length || 0;
              
              return (
                <TableRow key={app.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{workerFullName}</div>
                      <div className="text-xs text-gray-500">{formatRun(app.workerRun)}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{app.company?.name || '-'}</div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium text-sm">#{app.contract?.contractNumber}</div>
                      <div className="text-xs text-gray-500 truncate max-w-[160px]" title={app.contract?.contractName}>
                        {app.contract?.contractName}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Tooltip 
                      content={
                        <div className="p-2">
                          <div className="font-semibold mb-1">Actividades:</div>
                          {app.activities.map((activity, idx) => (
                            <div key={idx} className="text-sm">• {activity.name}</div>
                          ))}
                        </div>
                      }
                    >
                      <div className="flex items-center gap-2">
                        <Activity className="h-4 w-4 text-blue-500" />
                        <span className="text-sm font-medium">{app.activities.length}</span>
                      </div>
                    </Tooltip>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-green-500" />
                      <span className="text-sm font-medium">{docCount}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <StatusIcon className="h-4 w-4" />
                      <Chip 
                        color={overallStatus.color}
                        variant="flat"
                        size="sm"
                      >
                        {overallStatus.label}
                      </Chip>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="h-4 w-4" />
                      {new Date(app.createdAt).toLocaleDateString('es-CL')}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Tooltip content="Ver detalles">
                        <Link href={`/dashboard/applications/${app.id}`}>
                          <Button 
                            size="sm" 
                            variant="light"
                            isIconOnly
                            color="primary"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </Link>
                      </Tooltip>
                      {userRole === 'user' && app.stateAc === 'aprobado' && app.stateSheq === 'aprobado' && (
                        <Tooltip content="Imprimir credencial">
                          <Link href={`/print/credential/${app.id}`} target="_blank">
                            <Button
                              size="sm"
                              variant="flat"
                              isIconOnly
                              color="success"
                            >
                              <Printer className="w-4 h-4" />
                            </Button>
                          </Link>
                        </Tooltip>
                      )}
                      {canEdit && (
                      <Tooltip content="Editar solicitud">
                        <Button 
                          size="sm" 
                          variant="light"
                          isIconOnly
                          color="warning"
                          onPress={() => handleEditClick(app.id)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                      </Tooltip>
                      )}
                      {canDelete && (
                      <Tooltip content="Eliminar solicitud">
                        <Button 
                          size="sm" 
                          variant="light"
                          isIconOnly
                          color="danger"
                          onPress={() => handleDeleteClick(app.id, workerFullName)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </Tooltip>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
