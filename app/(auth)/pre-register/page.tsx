import { FormPreRegister } from '@/components/ui/auth/form-preregister';
import Link from 'next/link';

const PreRegisterPage = () => {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-[#171c23] px-4 py-10">
      <div className="mx-auto w-full max-w-4xl space-y-6">
        {/* Header con logo y links */}
        <div className="flex items-center justify-between">
          <div>
            <img
              src="/images/logoInv.svg"
              alt="RCR Support"
              className="logo-light h-9 w-auto"
            />
            <img
              src="/images/logo.svg"
              alt="RCR Support"
              className="logo-dark h-9 w-auto"
            />
          </div>
          <div className="flex items-center gap-4 text-sm">
            <Link
              href="/login"
              className="text-gray-600 dark:text-gray-400 hover:text-[#D05F27] transition-colors"
            >
              ¿Ya tienes cuenta? Inicia sesión
            </Link>
            <Link
              href="/"
              className="text-gray-600 dark:text-gray-400 hover:text-[#D05F27] transition-colors"
            >
              ← Volver al inicio
            </Link>
          </div>
        </div>

        {/* Card principal */}
        <div className="bg-white dark:bg-[#1e2530] rounded-xl shadow-md p-8 space-y-6">
          <div className="text-center space-y-3">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Solicitud de Pre-Registro
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
              Para acceder al sistema necesitas completar este formulario. Una vez enviado,
              el equipo de RCR revisará tu solicitud y te contactará por email cuando tu cuenta esté activa.
            </p>
            {/* Pasos del proceso */}
            <div className="flex justify-center gap-6 pt-1">
              <div className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#D05F27] text-white font-bold text-[10px]">1</span>
                Completas el formulario
              </div>
              <span className="text-gray-300 dark:text-gray-600 self-center">→</span>
              <div className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#D05F27] text-white font-bold text-[10px]">2</span>
                Admin aprueba
              </div>
              <span className="text-gray-300 dark:text-gray-600 self-center">→</span>
              <div className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#D05F27] text-white font-bold text-[10px]">3</span>
                Recibes tus credenciales
              </div>
            </div>
          </div>
          <FormPreRegister />
        </div>
      </div>
    </div>
  );
};

export default PreRegisterPage;
