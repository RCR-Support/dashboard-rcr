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

export type StepperProps = {
  initialStep?: number;
  onComplete: (data: any) => void;
  onCancel: () => void;
};

interface FormData {
  company?: {
    id?: string;
    name?: string;
    email?: string;
    phone?: string;
  };
  contract?: Contract | null;
  availableContracts?: Contract[];
}

const steps = [
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
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [formData, setFormData] = useState<FormData>({});

  // Cargar datos de la empresa y contrato al inicio
  useEffect(() => {
    async function loadCompanyData() {
      if (session?.user) {
        const user = session.user;
        const company = user.company;
        
        // Establecer datos de la empresa
        if (company) {
          setFormData(prev => ({
            ...prev,
            company: {
              id: company.id,
              name: company.name,
              phone: company.phone || undefined,
              email: user.email || undefined
            }
          }));

          // Obtener contratos de la empresa
          const result = await getCompanyContracts(company.id);
          
          if (result.ok && result.contracts) {
            // Si solo hay un contrato, lo establecemos automáticamente y avanzamos
            if (result.contracts.length === 1) {
              setFormData(prev => ({
                ...prev,
                contract: result.contracts[0]
              }));
              setCurrentStep(1); // Avanzar al siguiente paso
            }
            // Si hay múltiples contratos, los guardamos para mostrarlos en el paso 1
            else if (result.contracts.length > 1) {
              setFormData(prev => ({
                ...prev,
                availableContracts: result.contracts
              }));
            }
          }
        }
      }
    }

    loadCompanyData();
  }, [session]);

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
          companyInfo={formData.company}
          contractInfo={formData.contract}
        />
        <div className="rounded-lg border bg-card p-6">
          <div className="space-y-6">
            <CurrentStepComponent
              data={formData}
              onStepDataChange={(stepData: any) => {
                setFormData(prev => ({ ...prev, ...stepData }));
              }}
            />
            <StepNavigation
              currentStep={currentStep}
              totalSteps={steps.length}
              onNext={() => {
                if (currentStep === steps.length - 1) {
                  onComplete(formData);
                } else {
                  setCurrentStep(prev => prev + 1);
                }
              }}
              onBack={() => {
                if (currentStep === 0) {
                  onCancel();
                } else {
                  setCurrentStep(prev => prev - 1);
                }
              }}
              isNextDisabled={!formData.contract && currentStep === 0}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
