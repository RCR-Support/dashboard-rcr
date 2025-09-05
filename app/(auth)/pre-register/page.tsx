import { FormPreRegister } from '@/components/ui/auth/form-preregister';
import React from 'react';

const PreRegisterPage = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="w-full max-w-4xl p-8 space-y-8 bg-white rounded-lg shadow-md dark:bg-gray-800">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Formulario de Pre-Registro
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Complete los datos para solicitar el alta de una nueva empresa, su
            contrato y el administrador del mismo.
          </p>
        </div>
        <FormPreRegister />
      </div>
    </div>
  );
};

export default PreRegisterPage;
