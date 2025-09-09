'use client';

import { ContractStep } from './steps/ContractStep';
import { WorkerStep } from './steps/WorkerStep';
import { ActivitiesStep } from './steps/ActivitiesStep';
import { DocumentsStep } from './steps/DocumentsStep';
import { ReviewStep } from './steps/ReviewStep';
import { ApplicationInfo } from './components/ApplicationInfo';
import { StepNavigation } from './components/StepNavigation';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Contract } from '@/interfaces/contract.interface';
import { Company } from '@/interfaces/company.interface';
import { getCompanyContracts } from '@/actions/contract/get-company-contracts';
import { useApplicationFormStore } from '@/store/application-form-store';

export type StepperProps = {
  initialStep?: number;
  onComplete?: (data: any) => void;
  onCancel?: () => void;
};

interface Step {
  id: string;
  title: string;
  description: string;
  component: React.ComponentType<any>;
}

const steps: Step[] = [
  {
    id: 'contract',
    title: 'Contrato',
    description: 'Selecciona el contrato',
    component: ContractStep,
  },
  {
    id: 'worker',
    title: 'Trabajador',
    description: 'Información del trabajador',
    component: WorkerStep,
  },
  {
    id: 'activities',
    title: 'Actividades',
    description: 'Selecciona las actividades',
    component: ActivitiesStep,
  },
  {
    id: 'documents',
    title: 'Documentos',
    description: 'Sube los documentos requeridos',
    component: DocumentsStep,
  },
  // {
  //   id: 'review',
  //   title: 'Revisión',
  //   description: 'Revisa la información',
  //   component: ReviewStep,
  // },
];

export function ApplicationStepper({
  initialStep = 0,
  onComplete,
  onCancel,
}: StepperProps) {
  const { data: session } = useSession();
  const store = useApplicationFormStore();
  const { 
    currentStep,
    contract, 
    workerData,
    selectedActivities,
    documents,
    company,
    availableContracts,
    setCurrentStep,
    setContract,
    setWorkerData,
    setSelectedActivities,
    setDocuments,
    setCompany,
    setAvailableContracts,
    clearForm 
  } = store;

  // Asegurar que el estado sea consistente
  useEffect(() => {
    if (!contract && currentStep > 0) {
      setCurrentStep(0);
    }
  }, [contract, currentStep, setCurrentStep]);

  // Solo limpiamos el formulario si no hay datos guardados
  useEffect(() => {
    if (!contract && !company && availableContracts.length === 0) {
      clearForm();
    }
  }, [clearForm, contract, company, availableContracts.length]);

  // Manejar la finalización de cada paso
  const handleStepComplete = (stepData: any) => {
    switch (currentStep) {
      case 0:
        setContract(stepData);
        setCurrentStep(1);
        break;
      case 1:
        setWorkerData(stepData);
        setCurrentStep(2);
        break;
      case 2:
        setSelectedActivities(stepData);
        setCurrentStep(3);
        break;
      case 3:
        setDocuments(stepData);
        onComplete?.({
          contract,
          workerData,
          selectedActivities,
          documents,
          company
        });
        break;
    }
  };

  // Cargar datos de la empresa y contrato al inicio
  useEffect(() => {
    async function loadCompanyData() {
      if (session?.user) {
        const user = session.user;
        const userCompany = user.company;
        
        // Establecer datos de la empresa solo si no hay una guardada
        if (userCompany && !company) {
          setCompany({
            id: userCompany.id,
            name: userCompany.name,
            phone: userCompany.phone || undefined,
            email: user.email || undefined
          });

          // Cargar contratos si no hay ninguno disponible
          if (availableContracts.length === 0) {
            const result = await getCompanyContracts(userCompany.id);
            
            if (result.ok && result.contracts) {
              // Siempre guardamos los contratos disponibles
              setAvailableContracts(result.contracts);
              
              // Si solo hay uno y no hay contrato seleccionado, lo seleccionamos
              if (result.contracts.length === 1 && !contract) {
                setContract(result.contracts[0]);
              }
              
              // Si no hay contrato seleccionado, asegurarnos de estar en el paso 0
              if (!contract) {
                setCurrentStep(0);
              }
            }
          }
        }
      }
    }

    loadCompanyData();
  }, [session, setCompany, setContract, setAvailableContracts]);

  const CurrentStepComponent = steps[currentStep].component;

  return (
    <div className="space-y-8 py-8">
      {/* Progress Bar */}
      <div className="relative max-w-4xl mx-auto">
        {/* Línea de progreso */}
        <div className="absolute left-0 right-0 mx-16">
          <div className="absolute left-0 top-[18px] h-0.5 w-full bg-gray-400 dark:bg-gray-200">
            <div
              className="absolute h-full bg-primary transition-all duration-500"
              style={{ width: `${(((currentStep) + 0.5) / (steps.length - 1)) * 100}%` }}
            />
          </div>
        </div>

        {/* Pasos con espacio para el texto */}
        <ul className="relative flex justify-between items-start">
          {steps.map((step, index) => (
            <li
              key={step.id}
              className="flex flex-col items-center gap-4"
            >
              <div className={`flex h-10 w-10 items-center justify-center rounded-full ${
                index <= currentStep ? 'bg-primary' : 'bg-[#f0f0f0] dark:bg-[#1a202c] border dark:border-gray-200'
              }`}>
                <span className={`text-base ${index <= currentStep ? 'text-white' : 'dark:text-blue-100 text-blue-700 font-bold'}`}>
                  {index + 1}
                </span>
              </div>
              <div className="text-center w-36">
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {step.description}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Step Content */}
      <div className="grid grid-cols-[1fr_2fr] gap-8">
        <ApplicationInfo 
          companyInfo={company}
          contractInfo={contract}
        />
        <div className="rounded-lg p-6 bg-white shadow-xl dark:bg-[#282c34] dark:text-white">
          <div className="space-y-6 min-h-[392px]">
            {!contract ? (
              <ContractStep
                availableContracts={availableContracts}
                initialData={contract}
                onNext={handleStepComplete}
                onCancel={onCancel}
              />
            ) : !workerData ? (
              <WorkerStep
                initialData={workerData}
                onNext={handleStepComplete}
                onBack={() => setCurrentStep(0)}
              />
            ) : !selectedActivities.length ? (
              <ActivitiesStep
                contract={contract}
                initialData={selectedActivities}
                onNext={handleStepComplete}
                onBack={() => setCurrentStep(1)}
              />
            ) : (
              <DocumentsStep
                contract={contract} 
                initialData={documents}
                onNext={handleStepComplete}
                onBack={() => setCurrentStep(2)}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
