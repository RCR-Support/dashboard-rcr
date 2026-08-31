import { Card, CardBody, CardHeader } from '@heroui/card';
import { Chip } from '@heroui/chip';
import { Divider } from '@heroui/divider';
import Image from 'next/image';
import { ArrowRightLeft, Building2, Calendar, User } from 'lucide-react';

interface ApplicationSidebarProps {
  workerFullName: string;
  workerPhoto?: string;
  application: {
    workerRun: string;
    licenseExpiration: Date | null;
    company: { name: string | null } | null;
    contract: {
      contractNumber: string;
      contractName: string;
      initialDate: Date;
      finalDate: Date;
    } | null;
    userAc: {
      displayName: string;
      email: string;
    } | null;
  };
  activeReassignment?: {
    originalAcName: string;
    returnDate: string | null;
  } | null;
}

export function ApplicationSidebar({
  workerFullName,
  workerPhoto,
  application,
  activeReassignment,
}: ApplicationSidebarProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <User className="w-5 h-5" />
            Fotografía
          </h2>
        </CardHeader>
        <CardBody>
          <div className="relative w-full max-w-[120px] mx-auto aspect-[3/4] rounded-lg overflow-hidden bg-gray-100">
            {workerPhoto ? (
              <Image
                src={workerPhoto}
                alt={workerFullName}
                fill
                className="object-cover"
                sizes="120px"
                quality={90}
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <User className="w-16 h-16 text-gray-400" />
              </div>
            )}
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Información Personal</h2>
        </CardHeader>
        <CardBody className="space-y-3">
          <div>
            <p className="text-sm text-default-500">Nombre Completo</p>
            <p className="font-medium">{workerFullName}</p>
          </div>
          <Divider />
          <div>
            <p className="text-sm text-default-500">RUN</p>
            <p className="font-medium">{application.workerRun}</p>
          </div>
          {application.licenseExpiration && (
            <>
              <Divider />
              <div>
                <p className="text-sm text-default-500 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Vencimiento de Acreditación
                </p>
                <p className="font-medium text-orange-600">
                  {new Date(application.licenseExpiration).toLocaleDateString('es-CL')}
                </p>
              </div>
            </>
          )}
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Contrato y Empresa
          </h2>
        </CardHeader>
        <CardBody className="space-y-3">
          <div>
            <p className="text-sm text-default-500">Empresa</p>
            <p className="font-medium">{application.company?.name}</p>
          </div>
          <Divider />
          <div>
            <p className="text-sm text-default-500">Contrato</p>
            <p className="font-medium">{application.contract?.contractName}</p>
            <p className="text-sm text-default-400">N° {application.contract?.contractNumber}</p>
          </div>
          {application.contract && (
            <>
              <Divider />
              <div>
                <p className="text-sm text-default-500">Vigencia del Contrato</p>
                <p className="text-sm">
                  {new Date(application.contract.initialDate).toLocaleDateString('es-CL')} - {new Date(application.contract.finalDate).toLocaleDateString('es-CL')}
                </p>
              </div>
            </>
          )}
          {application.userAc && (
            <>
              <Divider />
              <div>
                <p className="text-sm text-default-500">Administrador de Contrato</p>
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
        </CardBody>
      </Card>
    </div>
  );
}