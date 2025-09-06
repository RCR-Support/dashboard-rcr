'use client';

import { ContractStep } from './steps/ContractStep';
import { WorkerStep } from './steps/WorkerStep';
import { ActivitiesStep } from './steps/ActivitiesStep';
import { DocumentsStep } from './steps/DocumentsStep';
import { ReviewStep } from './steps/ReviewStep';
import { useState } from 'react';

export type StepperProps = {
  initialStep?: number;
  onComplete: (data: any) => void;
  onCancel: () => void;
};

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
//   {
//     id: 'review',
//     title: 'Revisión',
//     description: 'Revisa la información',
//     component: ReviewStep,
//   },
];

export function ApplicationStepper({
  initialStep = 0,
  onComplete,
  onCancel,
}: StepperProps) {
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [formData, setFormData] = useState<any>({});

  const handleNext = (stepData: any) => {
    setFormData((prev: any) => ({ ...prev, ...stepData }));
    if (currentStep === steps.length - 1) {
      onComplete(formData);
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep === 0) {
      onCancel();
    } else {
      setCurrentStep(prev => prev - 1);
    }
  };

  const CurrentStepComponent = steps[currentStep].component;

  return (
    <div className="space-y-8 py-8">
      {/* Progress Bar */}
      <div className="relative max-w-4xl mx-auto">
        {/* Línea de progreso */}
        <div className="absolute left-0 right-0 mx-16">
          <div className="absolute left-0 top-[18px] h-0.5 w-full bg-gray-200">
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
              <div className={`flex h-10 w-10 items-center justify-center rounded-full  ${
                index <= currentStep ? 'bg-primary' : 'bg-[#1a202c] border border-gray-200'
              }`}>
                <span className={`text-base ${index <= currentStep ? 'text-white' : 'text-blue-100 font-bold'}`}>{index + 1}</span>
              </div>
              <div className="text-center w-36">
                
                <p className="text-xs text-gray-400">
                  {step.description}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Step Content */}
      <div className='grid grid-cols-[1fr_2fr] gap-8'>
        <div className='bg-gray-600'> seccion info de lo ingresado</div>
        <div className="bg-gray-600">
            {/* <p className="text-sm font-semibold">{step.title}</p> */}
            <CurrentStepComponent
            data={formData}
            onNext={handleNext}
            onBack={handleBack}
            />
        </div>
      </div>
    </div>
  );
}
