'use client';

import { Contract } from '@/interfaces/contract.interface';
import { useApplicationFormStore } from '@/store/application-form-store';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { Edit, CheckCircle2, XCircle, Clock, FileText, Save, AlertCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Chip } from '@heroui/chip';

const Tooltip = dynamic(
  () => import('@heroui/tooltip').then(mod => mod.Tooltip),
  { ssr: false }
);

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

export function ApplicationInfo({
  companyInfo,
  contractInfo,
}: ApplicationInfoProps) {
  // Estados para auto-save
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  // Solo suscribirse a las propiedades específicas necesarias
  const workerData = useApplicationFormStore(state => state.workerData);
  const credentialPhoto = useApplicationFormStore(state => state.credentialPhoto);
  const selectedActivities = useApplicationFormStore(state => state.selectedActivities);
  const contract = useApplicationFormStore(state => state.contract);
  const documents = useApplicationFormStore(state => state.documents);
  
  // Auto-save a localStorage
  useEffect(() => {
    const saveToLocal = () => {
      const store = useApplicationFormStore.getState();
      const dataToSave = {
        workerData: store.workerData,
        credentialPhoto: store.credentialPhoto,
        selectedActivities: store.selectedActivities,
        documents: store.documents,
        contract: store.contract,
        timestamp: new Date().toISOString(),
      };
      
      try {
        localStorage.setItem('application-draft', JSON.stringify(dataToSave));
        setLastSaved(new Date());
        setHasUnsavedChanges(false);
      } catch (error) {
        console.error('Error saving to localStorage:', error);
      }
    };

    // Marcar cambios no guardados
    setHasUnsavedChanges(true);
    
    // Auto-save cada 30 segundos o cuando hay cambios
    const timeoutId = setTimeout(saveToLocal, 3000);
    
    return () => clearTimeout(timeoutId);
  }, [workerData, credentialPhoto, selectedActivities, contract, documents]);
  
  // Obtener setCurrentStep sin suscribirse
  const handleEditClick = () => {
    useApplicationFormStore.getState().setCurrentStep(0);
  };
  
  const handleEditWorker = () => {
    useApplicationFormStore.getState().setCurrentStep(1);
  };
  
  const handleEditActivities = () => {
    useApplicationFormStore.getState().setCurrentStep(2);
  };

  const handleEditDocuments = () => {
    useApplicationFormStore.getState().setCurrentStep(3);
  };

  // Contar documentos por estado
  const docsWithUrl = documents.filter(doc => doc.url);
  const docsCompleted = docsWithUrl.filter(doc => doc.status === 'completed' || doc.status === 'approved');
  const docsApproved = docsWithUrl.filter(doc => doc.status === 'approved');
  const docsRejected = docsWithUrl.filter(doc => doc.status === 'rejected');
  const docsPending = documents.filter(doc => !doc.url || doc.status === 'pending');

  return (
    <div className="space-y-6 p-6 rounded-lg text-card-foreground bg-white shadow-xl dark:bg-[#282c34] dark:text-white max-h-[805px] overflow-y-auto">
      {/* Header con auto-save status */}
      <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold">Resumen de Solicitud</h2>
          <div className="flex items-center gap-2">
            {hasUnsavedChanges ? (
              <Chip size="sm" color="warning" variant="flat">
                <div className="flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  Guardando...
                </div>
              </Chip>
            ) : lastSaved ? (
              <Tooltip content={`Último guardado: ${lastSaved.toLocaleTimeString()}`}>
                <Chip size="sm" color="success" variant="flat">
                  <div className="flex items-center gap-1">
                    <Save className="w-3 h-3" />
                    Guardado
                  </div>
                </Chip>
              </Tooltip>
            ) : null}
          </div>
        </div>
        
        {/* Progreso general */}
        <div className="grid grid-cols-4 gap-2 text-center">
          <div className="flex flex-col items-center">
            <div className={`w-3 h-3 rounded-full ${contract ? 'bg-green-500' : 'bg-gray-300'}`} />
            <span className="text-xs mt-1">Contrato</span>
          </div>
          <div className="flex flex-col items-center">
            <div className={`w-3 h-3 rounded-full ${workerData?.workerName ? 'bg-green-500' : 'bg-gray-300'}`} />
            <span className="text-xs mt-1">Trabajador</span>
          </div>
          <div className="flex flex-col items-center">
            <div className={`w-3 h-3 rounded-full ${selectedActivities.length > 0 ? 'bg-green-500' : 'bg-gray-300'}`} />
            <span className="text-xs mt-1">Actividades</span>
          </div>
          <div className="flex flex-col items-center">
            <div className={`w-3 h-3 rounded-full ${docsCompleted.length > 0 ? 'bg-green-500' : 'bg-gray-300'}`} />
            <span className="text-xs mt-1">Documentos</span>
          </div>
        </div>
      </div>
      {/* Datos de la empresa */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Datos de la empresa</h3>
        </div>
        <div className="space-y-2">
          <div className="flex gap-2 items-center">
            <p className="text-sm text-muted-foreground">Nombre:</p>
            <p className="font-medium">
              {companyInfo?.name || 'No disponible'}
            </p>
          </div>
          <div className="flex gap-2 items-center">
            <p className="text-sm text-muted-foreground">Email:</p>
            <p className="font-medium">
              {companyInfo?.email || 'No disponible'}
            </p>
          </div>
          <div className="flex gap-2 items-center">
            <p className="text-sm text-muted-foreground">Teléfono:</p>
            <p className="font-medium">
              {companyInfo?.phone || 'No disponible'}
            </p>
          </div>
        </div>
      </div>

      {/* Datos del contrato */}
      {(contract || contractInfo) && (
        <>
          <div className="w-full border-b border-muted py-2"></div>
          <div>
            <div className="flex  items-center gap-4">
              <h3 className="text-lg font-semibold mb-4">Datos del contrato</h3>
              <div className="cursor-pointer" onClick={handleEditClick}>
                <Tooltip content="Editar contrato">
                  <Edit className="h-6 w-6 text-muted-foreground mb-4  focus:outline-none focus:ring-0 hover:text-primary" />
                </Tooltip>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex gap-2 items-center">
                <p className="text-sm text-muted-foreground">
                  Número de contrato:
                </p>
                <p className="font-medium">
                  {(contract || contractInfo)?.contractNumber ||
                    'No disponible'}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  Administrador de contrato:
                </p>
                <p className="font-medium">
                  {(contract || contractInfo)?.userAc?.displayName ||
                    'No disponible'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {(contract || contractInfo)?.userAc?.email || 'No disponible'}
                </p>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Datos del trabajador */}
      {workerData &&
        Object.values(workerData).some(
          value => value && value.trim() !== ''
        ) && (
          <>
            <div className="w-full border-b border-muted py-2"></div>
            <div>
              <div className="flex items-center gap-4">
                <h3 className="text-lg font-semibold mb-4">
                  Datos del trabajador
                </h3>
                <div
                  className="cursor-pointer"
                  onClick={handleEditWorker}
                >
                  <Tooltip content="Editar trabajador">
                    <Edit className="h-6 w-6 text-muted-foreground mb-4  focus:outline-none focus:ring-0 hover:text-primary" />
                  </Tooltip>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex gap-2 items-center">
                  <p className="text-sm text-muted-foreground">RUN:</p>
                  <p className="font-medium">
                    {workerData?.workerRun || 'No disponible'}
                  </p>
                </div>
                <div className="flex flex-col gap-2 items-start">
                  <p className="text-sm text-muted-foreground">
                    Nombre Completo:
                  </p>
                  <p className="font-bold">
                    {workerData?.workerName || 'No disponible'}{' '}
                    {workerData?.workerPaternal || 'No disponible'}{' '}
                    {workerData?.workerMaternal || '-'}
                  </p>
                </div>
              </div>

              {/* Foto de credencial */}
              {credentialPhoto && (
                <div className="mb-4 flex justify-start mt-4">
                  <div className="relative w-32 h-40 rounded-lg overflow-hidden border-2 border-blue-500 shadow-lg">
                    <Image
                      src={credentialPhoto}
                      alt="Foto de credencial"
                      width={128}
                      height={160}
                      className="w-full h-full object-cover"
                      priority
                    />
                  </div>
                </div>
              )}
            </div>
          </>
        )}

      {/* Actividades seleccionadas */}
      {selectedActivities.length > 0 && (
        <>
          <div className="w-full border-b border-muted "></div>
          <div>
            <div className="flex items-center gap-4">
              <h3 className="text-lg font-semibold mb-4">
                Actividades seleccionadas
              </h3>
              <div className="cursor-pointer" onClick={handleEditActivities}>
                <Tooltip content="Editar actividades">
                  <Edit className="h-6 w-6 text-muted-foreground mb-4 focus:outline-none focus:ring-0 hover:text-primary" />
                </Tooltip>
              </div>
            </div>
            <div className="space-y-2">
              {selectedActivities.map(activity => (
                <div key={activity.id} className="py-1">
                  <p className="text-sm">{activity.name}</p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Documentos subidos */}
      {documents.length > 0 && (
        <>
          <div className="w-full border-b border-muted "></div>
          <div>
            <div className="flex items-center gap-4">
              <h3 className="text-lg font-semibold mb-4">
                Documentación
              </h3>
              <div className="cursor-pointer" onClick={handleEditDocuments}>
                <Tooltip content="Editar documentos">
                  <Edit className="h-6 w-6 text-muted-foreground mb-4 focus:outline-none focus:ring-0 hover:text-primary" />
                </Tooltip>
              </div>
            </div>
            
            {/* Resumen de estados */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              <div className="flex items-center gap-2 text-sm">
                <FileText className="w-4 h-4 text-gray-500" />
                <span>Total: {documents.length}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <span>Listos: {docsCompleted.length}</span>
              </div>
              {docsApproved.length > 0 && (
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  <span>Aprobados: {docsApproved.length}</span>
                </div>
              )}
              {docsRejected.length > 0 && (
                <div className="flex items-center gap-2 text-sm">
                  <XCircle className="w-4 h-4 text-red-600" />
                  <span>Rechazados: {docsRejected.length}</span>
                </div>
              )}
              {docsPending.length > 0 && (
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-yellow-600" />
                  <span>Pendientes: {docsPending.length}</span>
                </div>
              )}
            </div>

            {/* Lista de documentos */}
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {documents.map(doc => (
                <div key={doc.id} className="flex items-start gap-2 py-1 text-sm">
                  {doc.status === 'approved' ? (
                    <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  ) : doc.status === 'rejected' ? (
                    <XCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                  ) : doc.url ? (
                    <CheckCircle2 className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  ) : (
                    <Clock className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                  )}
                  <span className={doc.url ? 'text-foreground' : 'text-muted-foreground'}>
                    {doc.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
