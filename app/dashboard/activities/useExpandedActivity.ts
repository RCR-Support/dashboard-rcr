'use client';

import { useEffect, useState } from 'react';

export function useExpandedActivity() {
  const [expandedActivityId, setExpandedActivityId] = useState<string | null>(
    null
  );

  useEffect(() => {
    // Verificar si hay una actividad para expandir en sessionStorage
    const storedActivityId = sessionStorage.getItem('expandedActivityId');
    if (storedActivityId) {
      setExpandedActivityId(storedActivityId);
      // Limpiar el storage después de usarlo
      sessionStorage.removeItem('expandedActivityId');
    }
  }, []);

  return { expandedActivityId, setExpandedActivityId };
}
