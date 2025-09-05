'use client';

import { ContractStep } from './steps/ContractStep';
import { WorkerStep } from './steps/WorkerStep';
import { ActivitiesStep } from './steps/ActivitiesStep';
import { DocumentsStep } from './steps/DocumentsStep';
import { ZonesStep } from './steps/ZonesStep';
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
    id: 'zones',
    title: 'Zonas',
    description: 'Selecciona las zonas',
    component: ZonesStep,
  },
  {
    id: 'documents',
    title: 'Documentos',
    description: 'Sube los documentos requeridos',
    component: DocumentsStep,
  },
  {
    id: 'review',
    title: 'Revisión',
    description: 'Revisa la información',
    component: ReviewStep,
  },
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
      <div className="relative">
        <div className="absolute left-0 top-2 h-0.5 w-full bg-gray-200">
          <div
            className="absolute h-full bg-primary transition-all duration-500"
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          />
        </div>
        <ul className="relative flex justify-between">
          {steps.map((step, index) => (
            <li
              key={step.id}
              className={`flex h-5 w-5 items-center justify-center rounded-full ${
                index <= currentStep ? 'bg-primary' : 'bg-gray-200'
              }`}
            >
              <span className="text-xs text-white">{index + 1}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Step Title */}
      <div className="text-center">
        <h2 className="text-2xl font-semibold">{steps[currentStep].title}</h2>
        <p className="text-muted-foreground">
          {steps[currentStep].description}
        </p>
      </div>

      {/* Step Content */}
      <div className="mt-4">
        <CurrentStepComponent
          data={formData}
          onNext={handleNext}
          onBack={handleBack}
        />
      </div>
    </div>
  );
}
