import { Card, CardBody, CardHeader } from '@heroui/card';
import { Chip } from '@heroui/chip';
import { Divider } from '@heroui/divider';
import { AlertCircle, ArrowRightLeft, CheckCircle, Clock } from 'lucide-react';

interface ApplicationHistoryProps {
  application: {
    createdAt: Date;
    userAc: { displayName: string; email: string } | null;
    userSheq: { displayName: string; email: string } | null;
    audits: Array<{
      id: string;
      action: string;
      changedAt: Date;
      details: string | null;
      changedBy: { displayName: string; email: string };
    }>;
    versions?: Array<{
      id: string;
      isActive: boolean;
      processStatus: string;
    }>;
  };
  versioningAvailable: boolean;
  activeReassignment?: {
    originalAcName: string;
    returnDate: string | null;
  } | null;
}

const actionLabels: Record<string, string> = {
  CREACION: 'Creación',
  EDICION: 'Edición',
  APROBACION: 'Aprobación',
  RECHAZO: 'Rechazo',
  OBSERVACION: 'Observación',
  ELIMINACION: 'Eliminación',
};

export function ApplicationHistory({ application, versioningAvailable, activeReassignment }: ApplicationHistoryProps) {
  return (
    <Card>
      <CardHeader>
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Historial
        </h2>
      </CardHeader>
      <CardBody className="space-y-3">
        <div>
          <p className="text-sm text-default-500">Fecha de Solicitud</p>
          <p className="font-medium">{new Date(application.createdAt).toLocaleString('es-CL')}</p>
        </div>

        {application.userAc && (
          <>
            <Divider />
            <div>
              <p className="text-sm text-default-500">Admin. Contrato Asignado</p>
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-medium">{application.userAc.displayName}</p>
                {activeReassignment && <Chip size="sm" variant="flat" color="warning">Cobertura temporal</Chip>}
              </div>
              <p className="text-sm text-default-400">{application.userAc.email}</p>
              {activeReassignment && (
                <div className="mt-2 rounded-md bg-warning-50 dark:bg-warning-900/20 border border-warning-200 dark:border-warning-800 px-3 py-2 text-xs space-y-1">
                  <p className="flex items-center gap-1 text-warning-700 dark:text-warning-300 font-medium">
                    <ArrowRightLeft size={12} />
                    AC original ausente: {activeReassignment.originalAcName}
                  </p>
                  {activeReassignment.returnDate ? (
                    <p className="text-warning-600 dark:text-warning-400">
                      Retorno estimado: {new Date(activeReassignment.returnDate).toLocaleDateString('es-CL')}
                    </p>
                  ) : (
                    <p className="text-warning-500">Sin fecha de retorno pactada</p>
                  )}
                </div>
              )}
            </div>
          </>
        )}

        {application.userSheq && (
          <>
            <Divider />
            <div>
              <p className="text-sm text-default-500">SHEQ Asignado</p>
              <p className="font-medium">{application.userSheq.displayName}</p>
              <p className="text-sm text-default-400">{application.userSheq.email}</p>
            </div>
          </>
        )}

        <Divider />
        <div>
          <p className="text-sm font-semibold mb-2">Versiones relacionadas</p>
          {versioningAvailable ? (
            application.versions && application.versions.length > 0 ? (
              <div className="space-y-2">
                {application.versions.map((version) => (
                  <div key={version.id} className="rounded-lg border border-default-200 p-3 text-sm">
                    <p className="font-medium">Versión en revisión</p>
                    <p className="text-default-500">ID: {version.id}</p>
                    <p className="text-default-500">Estado: {version.processStatus}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-default-500">No hay versiones relacionadas para mostrar. Si una versión anterior fue eliminada, ya no está disponible.</p>
            )
          ) : (
            <p className="text-sm text-default-500">El historial de versiones todavía no está disponible en esta base de datos.</p>
          )}
        </div>

        <Divider />
        <div>
          <p className="text-sm font-semibold mb-2">Acciones Realizadas</p>
          {application.audits.length > 0 ? (
            <div className="space-y-2">
              {application.audits.map((audit) => (
                <div key={audit.id} className="text-sm border-l-2 border-default-300 pl-3 py-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{actionLabels[audit.action] || audit.action}</span>
                    {audit.action === 'RECHAZO' && <AlertCircle className="w-4 h-4 text-red-500" />}
                    {audit.action === 'APROBACION' && <CheckCircle className="w-4 h-4 text-green-500" />}
                  </div>
                  <p className="text-default-500">{audit.changedBy.displayName}</p>
                  <p className="text-xs text-default-400">{new Date(audit.changedAt).toLocaleString('es-CL')}</p>
                  {audit.details && <p className="mt-1 text-default-600 bg-default-100 p-2 rounded">{audit.details}</p>}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-default-500">No hay acciones registradas todavía para esta solicitud.</p>
          )}
        </div>
      </CardBody>
    </Card>
  );
}