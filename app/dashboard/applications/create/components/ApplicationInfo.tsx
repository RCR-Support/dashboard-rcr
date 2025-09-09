'use client';

import { Contract } from '@/interfaces/contract.interface';
import { useApplicationFormStore } from '@/store/application-form-store';

interface CompanyInfo {
  id: string;
  name: string;
  email?: string;
  phone?: string;
}

interface ApplicationInfoProps {
  companyInfo: CompanyInfo | null;
  contractInfo?: Contract | null;
}

export function ApplicationInfo({ companyInfo, contractInfo }: ApplicationInfoProps) {
  // Acceder al store global
  const { 
    setCurrentStep, 
    setWorkerData, 
    setSelectedActivities, 
    setDocuments,
    availableContracts,
    setContract,
    contract,
    workerData
  } = useApplicationFormStore();

  // Función para limpiar el formulario manteniendo datos de empresa
  const handleClear = () => {
    console.log('Limpiando formulario...');
    // Usamos la nueva acción que maneja todo el estado de una vez
    useApplicationFormStore.getState().resetFormKeepingCompanyData();
  };

  return (
    <div className="space-y-6 p-6 rounded-lg text-card-foreground bg-white shadow-xl dark:bg-[#282c34] dark:text-white">
      {/* Datos de la empresa */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Datos de la empresa</h3>
          <button
            onClick={handleClear}
            className="px-3 py-1 text-sm rounded-md bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
            type="button"
          >
            Limpiar
          </button>
        </div>
        <div className="space-y-2">
          <div className='flex gap-2 items-center'>
            <p className="text-sm text-muted-foreground">Nombre:</p>
            <p className="font-medium">{companyInfo?.name || 'No disponible'}</p>
          </div>
          <div className='flex gap-2 items-center'>
            <p className="text-sm text-muted-foreground">Email:</p>
            <p className="font-medium">{companyInfo?.email || 'No disponible'}</p>
          </div>
          <div className='flex gap-2 items-center'>
            <p className="text-sm text-muted-foreground">Teléfono:</p>
            <p className="font-medium">{companyInfo?.phone || 'No disponible'}</p>
          </div>
        </div>
      </div>

      {/* Datos del contrato */}
      {contractInfo && (
        <>
        <div className='w-full border-b border-muted py-2'></div>
        <div>
          <h3 className="text-lg font-semibold mb-4">Datos del contrato</h3>
          <div className="space-y-2">
            <div className='flex gap-2 items-center'>
              <p className="text-sm text-muted-foreground">Número de contrato:</p>
              <p className="font-medium">{contractInfo.contractNumber || 'No disponible'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Administrador de contrato:</p>
              <p className="font-medium">{contractInfo.userAc?.displayName || 'No disponible'}</p>
              <p className="text-sm text-muted-foreground">{contractInfo.userAc?.email || 'No disponible'}</p>
            </div>
          </div>
        </div>
        </>
      )}

      {/* Datos del trabajador */}
      {workerData && (
        <>
          <div className='w-full border-b border-muted py-2'></div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Datos del trabajador</h3>
            <div className="space-y-2">
              <div className='flex gap-2 items-center'>
                <p className="text-sm text-muted-foreground">RUN:</p>
                <p className="font-medium">{workerData?.workerRun || 'No disponible'}</p>
              </div>
              <div className='flex gap-2 items-center'>
                <p className="text-sm text-muted-foreground">Nombre:</p>
                <p className="font-medium">{workerData?.workerName || 'No disponible'}</p>
              </div>
              <div className='flex gap-2 items-center'>
                <p className="text-sm text-muted-foreground">Apellido Paterno:</p>
                <p className="font-medium">{workerData?.workerPaternal || 'No disponible'}</p>
              </div>
              <div className='flex gap-2 items-center'>
                <p className="text-sm text-muted-foreground">Apellido Materno:</p>
                <p className="font-medium">{workerData?.workerMaternal || '-'}</p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
