'use client';

import { ApplicationStepper } from './stepper';

export default function CreateApplicationPage() {
  return (
    <div className="container mx-auto max-w-5xl px-4 py-8">
      <h1 className="mb-8 text-2xl font-bold">
        Nueva Solicitud de Acreditación
      </h1>

      <ApplicationStepper
        onComplete={data => {
          console.log('Datos completos:', data);
          // TODO: Implementar creación de solicitud
        }}
        onCancel={() => {
          console.log('Cancelado');
          // TODO: Implementar redirección o cancelación
        }}
      />
    </div>
  );
}
