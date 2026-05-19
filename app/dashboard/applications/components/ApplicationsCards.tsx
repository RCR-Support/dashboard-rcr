'use client';

import { formatRun } from '@/lib/validations';
import { Card, CardBody } from '@heroui/card';
import { Chip } from '@heroui/chip';
import { Button } from '@heroui/button';
import { Tooltip } from '@heroui/tooltip';
import { Eye, User, Pencil, Trash2, Building2, Calendar, FileText, Activity, Clock, CheckCircle2, XCircle, AlertCircle, Printer, Circle } from 'lucide-react';
import { getNearestExpiry, getExpiryStatus } from '@/lib/expiry-utils';
import Link from 'next/link';
import Image from 'next/image';
import Swal from 'sweetalert2';
import { deleteApplication } from '@/actions/applications/delete-application';
import { useRouter } from 'next/navigation';

interface Application {
  id: string;
  workerName: string;
  workerPaternal: string;
  workerMaternal: string;
  workerRun: string;
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
  documentationFiles: Array<{
    url: string;
    type: string;
    documentationId: string | null;
    expiresAt?: Date | string | null;
  }>;
  activities: Array<{
    name: string;
  }>;
}

interface ApplicationsCardsProps {
  applications: Application[];
  userRole?: string;
  canEdit?: boolean;
  canDelete?: boolean;
}

const getStateInfo = (stateAc: string, stateSheq: string) => {
  const states = {
    aprobado: { color: 'success' as const, icon: CheckCircle2, text: 'Aprobado' },
    pendiente: { color: 'warning' as const, icon: Clock, text: 'Pendiente' },
    adjuntar: { color: 'danger' as const, icon: AlertCircle, text: 'Req. Docs' },
    rechazado: { color: 'danger' as const, icon: XCircle, text: 'Rechazado' }
  };

  return {
    ac: states[stateAc as keyof typeof states] || states.pendiente,
    sheq: states[stateSheq as keyof typeof states] || states.pendiente
  };
};

const getProgressPercentage = (stateAc: string, stateSheq: string) => {
  // Proceso en 3 etapas: Creado (25%) → AC Aprobado (50%) → SHEQ Aprobado (100%)
  let progress = 25; // Base: solicitud creada
  
  if (stateAc === 'aprobado') progress = 50; // AC completado
  if (stateAc === 'aprobado' && stateSheq === 'aprobado') progress = 100; // Proceso completo
  
  // Estados de error resetean a 10%
  if (stateAc === 'adjuntar' || stateSheq === 'rechazado') progress = 10;
  
  return progress;
};

const getProgressColor = (stateAc: string, stateSheq: string) => {
  if (stateAc === 'adjuntar' || stateSheq === 'rechazado') return 'from-red-500 to-red-400';
  if (stateAc === 'aprobado' && stateSheq === 'aprobado') return 'from-emerald-500 to-emerald-400';
  if (stateAc === 'aprobado') return 'from-blue-500 to-blue-400';
  return 'from-gray-400 to-gray-300';
};

export function ApplicationsCards({ applications, userRole, canEdit = false, canDelete = false }: ApplicationsCardsProps) {
  const router = useRouter();

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

  if (applications.length === 0) {
    return (
      <div className="col-span-12 text-center py-12">
        <p className="text-gray-500 mb-4">No hay solicitudes para mostrar</p>
        <Link href="/dashboard/applications/create">
          <Button color="primary">Crear primera solicitud</Button>
        </Link>
      </div>
    );
  }

  return (
    <>
      {applications.map((app) => {
        const workerFullName = `${app.workerName} ${app.workerPaternal} ${app.workerMaternal}`;
        const formattedRun = formatRun(app.workerRun);
        
        // Buscar la foto del trabajador
        const workerPhoto = app.documentationFiles.find(
          doc => doc.type === 'IMG' && !doc.documentationId
        )?.url;
        
        const stateInfo = getStateInfo(app.stateAc, app.stateSheq);
        const progressPercentage = getProgressPercentage(app.stateAc, app.stateSheq);
        const progressColor = getProgressColor(app.stateAc, app.stateSheq);
        const documentCount = app.documentationFiles.filter(doc => doc.documentationId).length;
        const nearestExpiry = getNearestExpiry(app.licenseExpiration, app.documentationFiles);
        const expiryStatus = getExpiryStatus(nearestExpiry);
        const createdDate = new Date(app.createdAt).toLocaleDateString('es-CL', { 
          day: '2-digit', 
          month: '2-digit' 
        });
        
        return (
          <div key={app.id} className="col-span-6 sm:col-span-4 md:col-span-3 lg:col-span-2">
            <Card className="p-0 hover:shadow-lg transition-all duration-200 hover:scale-[1.02]">
              <CardBody className="p-0">
                {/* Header con progreso */}
                <div className="px-4 pt-4 pb-2">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3 h-3 text-gray-400" />
                      <span className="text-xs text-gray-500">{createdDate}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <FileText className="w-3 h-3 text-gray-400" />
                      <span className="text-xs text-gray-500">{documentCount}</span>
                    </div>
                  </div>
                  
                  {/* Barra de progreso */}
                  <div className="w-full bg-gray-200 rounded-full h-1.5 mb-2">
                    <div 
                      className={`bg-gradient-to-r ${progressColor} h-1.5 rounded-full transition-all duration-300`}
                      style={{ width: `${progressPercentage}%` }}
                    />
                  </div>
                  <div className="text-center">
                    <span className="text-xs text-gray-500">
                      {progressPercentage === 100 ? 'Completado' : 
                       progressPercentage === 50 ? 'AC Aprobado' :
                       progressPercentage === 25 ? 'En proceso' : 'Requiere atención'}
                    </span>
                  </div>
                </div>

                {/* Foto del trabajador */}
                <div className="relative w-[60%] mx-auto aspect-[3/4] bg-gray-100  rounded-lg overflow-hidden mb-3">
                  {workerPhoto ? (
                    <Image
                      src={workerPhoto}
                      alt={workerFullName}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 16vw"
                      quality={85}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User className="w-12 h-12 text-gray-300" />
                    </div>
                  )}
                  
                  {/* Badge de actividades */}
                  <div className="absolute top-2 right-2">
                    <Tooltip content={`Actividades: ${app.activities.map(a => a.name).join(', ')}`}>
                      <Chip size="sm" color="primary" variant="solid" className="text-xs">
                        <Activity className="w-3 h-3 mr-1" />
                        {app.activities.length}
                      </Chip>
                    </Tooltip>
                  </div>
                </div>

                <div className="px-4 pb-4 space-y-3">
                  {/* Info del trabajador */}
                  <div className="text-center">
                    <Tooltip content={workerFullName}>
                      <h3 className="font-semibold text-sm truncate mb-1">
                        {workerFullName}
                      </h3>
                    </Tooltip>
                    <p className="text-xs text-gray-500 font-mono">{formattedRun}</p>
                  </div>

                  {/* Info de empresa/contrato */}
                  {app.company && (
                    <div className="flex items-center gap-2 justify-center">
                      <Building2 className="w-3 h-3 text-gray-400 flex-shrink-0" />
                      <Tooltip content={`${app.company?.name ?? ''} - ${app.contract?.contractName ?? ''}`}>
                        <span className="text-xs text-gray-600 truncate max-w-[120px]">
                          {app.company?.name}
                        </span>
                      </Tooltip>
                    </div>
                  )}

                  {/* Fecha de expiración */}
                  <div className="text-center">
                    <Tooltip
                      content={
                        nearestExpiry
                          ? `Vence: ${new Date(nearestExpiry).toLocaleDateString('es-CL')}`
                          : 'Sin fecha de vencimiento'
                      }
                    >
                      <div className="inline-flex items-center gap-1.5 cursor-default">
                        <Circle
                          className="h-2.5 w-2.5 flex-shrink-0"
                          fill="currentColor"
                          stroke="none"
                          color={
                            expiryStatus.color === 'success' ? '#22c55e'
                            : expiryStatus.color === 'warning' ? '#f59e0b'
                            : expiryStatus.color === 'danger'  ? '#ef4444'
                            : '#9ca3af'
                          }
                        />
                        <p className="text-xs text-gray-500">{expiryStatus.label}</p>
                      </div>
                    </Tooltip>
                  </div>

                  {/* Estados mejorados */}
                  <div className="flex gap-2 justify-center">
                    <Tooltip content={`Administración de Contratos: ${stateInfo.ac.text}`}>
                      <Chip 
                        color={stateInfo.ac.color}
                        size="sm"
                        variant="flat"
                        startContent={<stateInfo.ac.icon className="w-3 h-3" />}
                        className="text-xs"
                      >
                        AC
                      </Chip>
                    </Tooltip>
                    <Tooltip content={`SHEQ: ${stateInfo.sheq.text}`}>
                      <Chip 
                        color={stateInfo.sheq.color}
                        size="sm"
                        variant="flat"
                        startContent={<stateInfo.sheq.icon className="w-3 h-3" />}
                        className="text-xs"
                      >
                        SHEQ
                      </Chip>
                    </Tooltip>
                  </div>

                  {/* Botones de acción */}
                  <div className="flex gap-2">
                    <Tooltip content="Ver detalles">
                      <Link href={`/dashboard/applications/${app.id}`} className="flex-1">
                        <Button 
                          size="sm" 
                          variant="flat"
                          color="primary"
                          className="w-full"
                          startContent={<Eye className="w-3 h-3" />}
                        >
                          Ver
                        </Button>
                      </Link>
                    </Tooltip>
                    {userRole === 'user' && app.stateAc === 'aprobado' && app.stateSheq === 'aprobado' && (
                      <Tooltip content="Imprimir credencial">
                        <Link href={`/print/credential/${app.id}`} target="_blank">
                          <Button
                            size="sm"
                            variant="flat"
                            color="success"
                            isIconOnly
                            startContent={<Printer className="w-3 h-3" />}
                          />
                        </Link>
                      </Tooltip>
                    )}
                    {canEdit && (
                    <Tooltip content="Editar solicitud">
                      <Button 
                        size="sm" 
                        variant="flat"
                        color="warning"
                        className="flex-1"
                        startContent={<Pencil className="w-3 h-3" />}
                        onPress={() => handleEditClick(app.id)}
                      >
                        Editar
                      </Button>
                    </Tooltip>
                    )}
                    {canDelete && (
                    <Tooltip content="Eliminar solicitud">
                      <Button 
                        size="sm" 
                        variant="flat"
                        color="danger"
                        isIconOnly
                        startContent={<Trash2 className="w-3 h-3" />}
                        onPress={() => handleDeleteClick(app.id, workerFullName)}
                      />
                    </Tooltip>
                    )}
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>
        );
      })}
    </>
  );
}
