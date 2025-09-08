'use client';

import { ApplicationStepper } from './stepper';

export default function CreateApplicationPage() {
  return (
    <div className="container mx-auto lg:w-[1280px] px-4 flex flex-col gap-4">
      <h1 className="col-span-12 text-xl font-normal card-box flex justify-between">
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
