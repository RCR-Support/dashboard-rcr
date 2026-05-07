'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function DashboardConnectionError() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(5);
  const [retrying, setRetrying] = useState(false);

  // Auto-reintentar después de 5 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setRetrying(true);
          router.refresh();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center max-w-sm px-4">
        <div className="text-4xl mb-4">🔄</div>
        <p className="text-lg font-semibold text-default-700 dark:text-default-300">
          Conectando con el servidor...
        </p>
        <p className="text-sm text-default-400 mt-2 mb-6">
          La base de datos tarda unos segundos en responder la primera vez.
          {!retrying && (
            <span className="block mt-1">
              Reintentando automáticamente en <strong>{countdown}s</strong>
            </span>
          )}
        </p>
        <button
          onClick={() => {
            setRetrying(true);
            router.refresh();
          }}
          disabled={retrying}
          className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium
            hover:bg-primary/90 active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {retrying ? 'Cargando...' : 'Reintentar ahora'}
        </button>
      </div>
    </div>
  );
}
