'use client';

import { useEffect, useState } from 'react';
import { UseFormReturn } from 'react-hook-form';

interface DebugFormProps {
  form: UseFormReturn<any>;
  enabled?: boolean;
}

export function DebugForm({ form, enabled = false }: DebugFormProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !enabled || process.env.NODE_ENV === 'production') {
    return null;
  }

  return (
    <div className="fixed bottom-2 right-2 p-4 bg-slate-800 text-white rounded shadow-lg max-w-md max-h-96 overflow-auto z-50 opacity-80">
      <div className="flex justify-between mb-2">
        <h3 className="font-bold">Debug Formulario</h3>
        <button
          onClick={() =>
            document.body.removeChild(document.body.lastChild as Node)
          }
        >
          X
        </button>
      </div>
      <pre className="text-xs whitespace-pre-wrap">
        {JSON.stringify(
          {
            values: {
              ...form.getValues(),
              images: form.getValues().images, // Aseguramos que el campo images se incluya en el debug
            },
            errors: form.formState.errors,
            isDirty: form.formState.isDirty,
            isValid: form.formState.isValid,
          },
          null,
          2
        )}
      </pre>
    </div>
  );
}
