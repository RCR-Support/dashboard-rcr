'use client';

import { useEffect } from 'react';
import { Button } from '@heroui/button';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[Dashboard Error]', error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 px-4">
      <div className="text-center max-w-md">
        <h2 className="text-2xl font-semibold text-slate-800 dark:text-white mb-2">
          Ocurrió un error
        </h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm mb-1">
          No se pudo cargar esta sección. Por favor intenta nuevamente.
        </p>
        {error?.digest && (
          <p className="text-xs text-slate-400 dark:text-slate-600 font-mono mt-2">
            Código: {error.digest}
          </p>
        )}
      </div>
      <Button color="primary" variant="flat" onPress={reset}>
        Intentar nuevamente
      </Button>
    </div>
  );
}
