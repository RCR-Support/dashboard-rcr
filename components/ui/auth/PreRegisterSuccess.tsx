'use client';

import { Button } from '@/components/ui/button';

interface PreRegisterSuccessProps {
  onGoHome: () => void;
  onGoToLogin: () => void;
}

export function PreRegisterSuccess({
  onGoHome,
  onGoToLogin,
}: PreRegisterSuccessProps) {
  return (
    <div className="py-8 text-center space-y-6">
      <div className="flex justify-center">
        <div className="h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
          <svg
            className="h-8 w-8 text-green-600 dark:text-green-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
      </div>

      <div className="space-y-2">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          ¡Solicitud enviada correctamente!
        </h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm max-w-md mx-auto">
          Te enviamos un correo de confirmación con un resumen de los datos ingresados.
          Guárdalo por si necesitas verificar algo.
        </p>
      </div>

      <div className="bg-gray-50 dark:bg-[#161b22] rounded-lg p-5 text-left space-y-4 max-w-md mx-auto">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">
          ¿Qué pasa ahora?
        </p>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#D05F27] text-white text-xs font-bold">
              1
            </span>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Revisa tu correo: te enviamos un resumen con todos los datos de tu solicitud.
            </p>
          </div>
          <div className="flex items-start gap-3">
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#D05F27] text-white text-xs font-bold">
              2
            </span>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              El administrador revisará tu empresa, contrato y usuario, y activará tu cuenta.
            </p>
          </div>
          <div className="flex items-start gap-3">
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#D05F27] text-white text-xs font-bold">
              3
            </span>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Cuando tu cuenta esté lista, recibirás <strong>otro correo</strong> con tus
              credenciales para acceder al sistema.
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
        <Button
          type="button"
          onClick={onGoToLogin}
          className="bg-[#D05F27] hover:bg-[#b84e1e] text-white"
        >
          Ir al inicio de sesión
        </Button>
        <Button type="button" variant="outline" onClick={onGoHome}>
          Volver al inicio
        </Button>
      </div>
    </div>
  );
}