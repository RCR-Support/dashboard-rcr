'use client';

import React, { useEffect, useState } from 'react';
import { ContractStep } from './steps/ContractStep';
import { WorkerStep } from './steps/WorkerStep';
import { DocumentsStep } from './steps/DocumentsStep';
import { Activity } from '@/app/dashboard/activities/interfaces';
import { ApplicationInfo } from './components/ApplicationInfo';
import { useSession } from 'next-auth/react';
import { getCompanyContracts } from '@/actions/contract/get-company-contracts';
import { useApplicationFormStore } from '@/store/application-form-store';
import { ActivitiesStep } from './steps/ActivitiesStep';
import { Contract } from '@/interfaces/contract.interface';
import { Tooltip } from '@heroui/tooltip';
import { Spinner } from '@heroui/spinner';
import { Progress } from '@heroui/progress';
import { CheckCircle2, AlertCircle, Clock, FileText, Info } from 'lucide-react';

// Tipos de datos específicos
type WorkerData = {
  workerName: string;
  workerPaternal: string;
  workerMaternal: string;
  workerRun: string;
};

import { DocumentData } from './types';

interface ApplicationData {
  contract: Contract | null;
  workerData: WorkerData;
  activities: Activity[];
  documents: DocumentData[];
}

export type StepperProps = {
  initialStep?: number;
  onComplete?: (data: ApplicationData) => void;
  onCancel?: () => void;
  isSubmitting?: boolean;
  isEditMode?: boolean;
};

// Props específicos para cada paso
interface ContractStepProps {
  initialData: Contract | null;
  availableContracts: Contract[];
  onNext: (data: Contract) => void;
  onCancel?: () => void;
}

interface WorkerStepProps {
  initialData: WorkerData | null;
  onNext: (data: WorkerData) => void;
  contract: Contract | null;
  onBack?: () => void;
  onCancel?: () => void;
}

interface ActivitiesStepProps {
  contract: Contract;
  onNext: (data: Activity[]) => void;
  onBack?: () => void;
}

interface DocumentsStepProps {
  contract: Contract | null;
  initialData: DocumentData[] | null;
  onNext: (data: DocumentData[]) => void;
  onBack: () => void;
  onCancel?: () => void;
  isSubmitting?: boolean;
}

// Definir los tipos literales de los pasos
const StepTypes = {
  contract: 'contract',
  worker: 'worker',
  activities: 'activities',
  documents: 'documents',
} as const;

type StepId = keyof typeof StepTypes;

// Mapear tipos de pasos a sus props
type StepPropsMap = {
  contract: ContractStepProps;
  worker: WorkerStepProps;
  activities: ActivitiesStepProps;
  documents: DocumentsStepProps;
};

type StepType<T extends StepId> = {
  id: T;
  title: string;
  description: string;
  type: T;
  Component: React.ComponentType<StepPropsMap[T]>;
};

type Step =
  | StepType<'contract'>
  | StepType<'worker'>
  | StepType<'activities'>
  | StepType<'documents'>;

// Definición de los pasos
const steps: Step[] = [
  {
    id: 'contract',
    title: 'Contrato',
    description: 'Selecciona el contrato',
    Component: ContractStep,
    type: 'contract',
  } as StepType<'contract'>,
  {
    id: 'worker',
    title: 'Trabajador',
    description: 'Información del trabajador',
    Component: WorkerStep,
    type: 'worker',
  } as StepType<'worker'>,
  {
    id: 'activities',
    title: 'Actividades',
    description: 'Selecciona las actividades',
    Component: ActivitiesStep,
    type: 'activities',
  } as StepType<'activities'>,
  {
    id: 'documents',
    title: 'Documentos',
    description: 'Sube los documentos requeridos',
    Component: DocumentsStep,
    type: 'documents',
  } as StepType<'documents'>,
];

export function ApplicationStepper({ onComplete, onCancel, isSubmitting = false, isEditMode = false }: StepperProps) {
  const { data: session } = useSession();
  
  // Suscribirse a las propiedades necesarias para renderizar los steps
  const currentStep = useApplicationFormStore(state => state.currentStep);
  const availableContracts = useApplicationFormStore(state => state.availableContracts);
  const documents = useApplicationFormStore(state => state.documents);
  const selectedActivities = useApplicationFormStore(state => state.selectedActivities);

  // Estados locales para UX mejorada
  const [highestStepReached, setHighestStepReached] = useState(isEditMode ? steps.length - 1 : 0);
  const [isLoadingContracts, setIsLoadingContracts] = useState(false);
  const [stepTransition, setStepTransition] = useState(false);

  // Calcular progreso de documentos
  const docsWithUrl = documents.filter(doc => doc.url);
  const totalDocs = documents.length;
  const docsProgress = totalDocs > 0 ? (docsWithUrl.length / totalDocs) * 100 : 0;
  
  // Calcular progreso general
  const overallProgress = (() => {
    let progress = (currentStep / (steps.length - 1)) * 80; // 80% para steps básicos
    if (currentStep === steps.length - 1) {
      progress += (docsProgress * 0.2); // 20% adicional por documentos
    }
    return Math.min(progress, 100);
  })();

  // Actualizar highestStepReached cuando currentStep aumenta
  useEffect(() => {
    if (currentStep > highestStepReached) {
      setHighestStepReached(currentStep);
    } else if (currentStep === 0 && highestStepReached !== 0) {
      setHighestStepReached(0);
    }
  }, [currentStep, highestStepReached]);

  // Cargar datos de la empresa y contrato al inicio (solo en modo creación)
  useEffect(() => {
    if (!session?.user || isEditMode) return; // Skip en modo edición

    async function loadCompanyData() {
      const user = session?.user;
      if (!user) return;
      
      const userCompany = user.company;

      if (userCompany) {
        setIsLoadingContracts(true);
        const store = useApplicationFormStore.getState();

        // Solo establecer company si no existe
        if (!store.company) {
          store.setCompany({
            id: userCompany.id,
            name: userCompany.name,
            phone: userCompany.phone || undefined,
            email: user.email || undefined,
          });
        }

        try {
          // SIEMPRE cargar contratos frescos cada vez que se monta el componente
          const result = await getCompanyContracts(userCompany.id);

          if (result.ok && result.contracts) {
            store.setAvailableContracts(result.contracts);

            // Si solo hay un contrato Y no hay uno seleccionado, seleccionarlo automáticamente
            if (result.contracts.length === 1 && !store.contract) {
              store.setContract(result.contracts[0]);
            }
          }
        } catch {
          // Error al cargar contratos
        } finally {
          setIsLoadingContracts(false);
        }
      }
    }

    loadCompanyData();

    // Cleanup: limpiar contratos cuando se desmonta el componente
    return () => {
      useApplicationFormStore.getState().setAvailableContracts([]);
    };
  }, [session, isEditMode]); // Ejecutar cuando cambie la sesión o modo edición

  type StepData = Contract | WorkerData | Activity[] | DocumentData[];

  const handleStepComplete = async (stepData: StepData) => {
    setStepTransition(true);
    
    // Pequeño delay para mostrar transición
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const store = useApplicationFormStore.getState();
    
    switch (currentStep) {
      case 0:
        store.setContract(stepData as Contract);
        store.setCurrentStep(currentStep + 1);
        break;
      case 1:
        store.setWorkerData(stepData as WorkerData);
        store.setCurrentStep(currentStep + 1);
        break;
      case 2:
        store.setSelectedActivities(stepData as Activity[]);
        store.setCurrentStep(currentStep + 1);
        break;
      case 3:
        store.setDocuments(stepData as DocumentData[]);
        const { contract, workerData, selectedActivities } = store;
        if (onComplete && contract && workerData) {
          onComplete({
            contract,
            workerData,
            activities: selectedActivities,
            documents: stepData as DocumentData[],
          });
        }
        break;
    }
    
    setStepTransition(false);
  };

  const handleBack = () => {
    const store = useApplicationFormStore.getState();
    store.setCurrentStep(Math.max(0, currentStep - 1));
  };

  const renderStep = () => {
    const step = steps[currentStep];
    const store = useApplicationFormStore.getState();

    switch (step.type) {
      case StepTypes.contract: {
        const { Component } = step;
        return (
          <Component
            key="contract"
            availableContracts={availableContracts}
            initialData={store.contract}
            onNext={handleStepComplete}
            onCancel={onCancel}
          />
        );
      }
      case StepTypes.worker: {
        const { Component } = step;
        return (
          <Component
            key="worker"
            initialData={store.workerData}
            contract={store.contract}
            onNext={handleStepComplete}
            onBack={handleBack}
            onCancel={onCancel}
          />
        );
      }
      case StepTypes.activities: {
        if (!store.contract) return null;
        const { Component } = step;
        return (
          <Component
            key="activities"
            contract={store.contract}
            onNext={handleStepComplete}
            onBack={handleBack}
          />
        );
      }
      case StepTypes.documents: {
        if (!store.contract) return null;
        const { Component } = step;
        return (
          <Component
            key="documents"
            initialData={store.documents}
            contract={store.contract}
            onNext={handleStepComplete}
            onBack={handleBack}
            onCancel={onCancel}
            isSubmitting={isSubmitting}
          />
        );
      }
      default:
        return null;
    }
  };

  return (
    <div className="space-y-8 py-8">
      {/* Progress Bar Mejorado */}
      <div className="relative max-w-4xl mx-auto">
        {/* Progress bar superior */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Progreso general
            </span>
            <span className="text-sm text-gray-500">
              {Math.round(overallProgress)}% completado
            </span>
          </div>
          <Progress 
            value={overallProgress} 
            className="h-2" 
            color={overallProgress === 100 ? "success" : "primary"}
          />
        </div>
        
        {/* Línea de progreso de steps */}
        <div className="absolute left-0 right-0 mx-16">
          <div className="absolute left-0 top-[18px] h-0.5 w-full bg-gray-400 dark:bg-gray-200">
            <div
              className="absolute h-full bg-primary transition-all duration-500"
              style={{
                width: `${(currentStep / (steps.length - 1)) * 100}%`,
              }}
            />
          </div>
        </div>

        {/* Pasos con tooltips informativos */}
        <ul className="relative flex justify-between items-start">
          {steps.map((step, index) => {
            const isCompleted = index < currentStep;
            const isCurrent = index === currentStep;
            const isReached = index <= highestStepReached;
            const isClickable = isReached && !isCurrent;
            
            // Iconos según el estado
            const getStepIcon = () => {
              if (isCompleted) return <CheckCircle2 className="w-5 h-5 text-white" />;
              if (isCurrent && (isLoadingContracts || stepTransition)) return <Spinner size="sm" className="text-white" />;
              if (isCurrent) return <Clock className="w-5 h-5 text-white" />;
              return <span className={`text-base ${isReached ? 'text-white' : 'dark:text-blue-100 text-blue-700 font-bold'}`}>{index + 1}</span>;
            };

            // Información del tooltip
            const getTooltipContent = () => {
              if (index === 0) return "Selecciona el contrato para esta solicitud";
              if (index === 1) return "Ingresa los datos personales del trabajador";
              if (index === 2) return "Selecciona las actividades que realizará";
              if (index === 3) return `Sube los documentos requeridos${totalDocs > 0 ? ` (${docsWithUrl.length}/${totalDocs} completados)` : ''}`;
              return step.description;
            };
            
            return (
              <li key={step.id} className="flex flex-col items-center gap-4">
                <Tooltip 
                  content={getTooltipContent()}
                  placement="top"
                  showArrow
                >
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full transition-all ${
                      isReached
                        ? 'bg-primary shadow-lg'
                        : 'bg-[#f0f0f0] dark:bg-[#1a202c] border dark:border-gray-200'
                    } ${isClickable ? 'cursor-pointer hover:scale-110 hover:shadow-lg' : isCurrent ? 'cursor-default ring-2 ring-primary ring-offset-2' : 'cursor-not-allowed'}`}
                    onClick={() => {
                      if (isClickable) {
                        useApplicationFormStore.getState().setCurrentStep(index);
                      }
                    }}
                  >
                    {getStepIcon()}
                  </div>
                </Tooltip>
                <div className="text-center w-36">
                  <p className={`text-xs ${isCurrent ? 'font-semibold text-primary' : 'text-gray-600 dark:text-gray-400'}`}>
                    {step.description}
                  </p>
                  {/* Indicador adicional para documentos */}
                  {index === 3 && totalDocs > 0 && (
                    <div className="flex items-center justify-center gap-1 mt-1">
                      <FileText className="w-3 h-3 text-gray-400" />
                      <span className="text-xs text-gray-500">
                        {docsWithUrl.length}/{totalDocs}
                      </span>
                    </div>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Loading overlay para transiciones */}
      {(isLoadingContracts || stepTransition) && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-xl">
            <div className="flex items-center gap-3">
              <Spinner size="sm" />
              <span className="text-sm">
                {isLoadingContracts ? 'Cargando contratos...' : 'Procesando...'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Step Content */}
      <div className="grid grid-cols-[1fr_2fr] gap-8">
        <ApplicationInfo 
          companyInfo={useApplicationFormStore.getState().company} 
          contractInfo={useApplicationFormStore.getState().contract} 
        />
        <div className="rounded-lg p-6 bg-white shadow-xl dark:bg-[#282c34] dark:text-white">
          <div className="space-y-6 min-h-[364px] overflow-y-auto">
            {renderStep()}
          </div>
        </div>
      </div>
    </div>
  );
}
