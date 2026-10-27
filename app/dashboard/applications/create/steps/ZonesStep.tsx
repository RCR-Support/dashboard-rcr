'use client';

import { useEffect, useState } from 'react';
import { StepNavigation } from '../components/StepNavigation';
import { listZones } from '@/actions/activities/list-zones';
import { useApplicationFormStore } from '@/store/application-form-store';

interface ZoneOption {
  id: string;
  name: string;
}

interface ZonesStepProps {
  initialZoneIds: string[];
  onNext: (zoneIds: string[]) => void;
  onBack: () => void;
}

export function ZonesStep({ initialZoneIds, onNext, onBack }: ZonesStepProps) {
  const [zones, setZones] = useState<ZoneOption[]>([]);
  const [selectedZoneIds, setSelectedZoneIds] = useState(initialZoneIds);
  const selectedActivities = useApplicationFormStore(state => state.selectedActivities);

  useEffect(() => {
    listZones().then(setZones).catch(() => setZones([]));
  }, []);

  const conditionalZones = new Set(
    selectedActivities.flatMap(activity => activity.zoneDocumentations?.map(requirement => requirement.zone.id) ?? [])
  );

  return (
    <div>
      <h2 className="text-lg font-semibold">Seleccionar zonas de operación</h2>
      <p className="mt-1 text-sm text-default-600">
        Selecciona las zonas donde trabajará el trabajador. Algunas pueden activar documentos obligatorios.
      </p>
      <div className="mt-5 space-y-3">
        {zones.map(zone => {
          const checked = selectedZoneIds.includes(zone.id);
          const hasConditionalRequirement = conditionalZones.has(zone.id);
          return (
            <label key={zone.id} className="flex cursor-pointer items-start gap-3 rounded-lg border p-4 hover:bg-default-50">
              <input
                type="checkbox"
                checked={checked}
                onChange={event => setSelectedZoneIds(current => event.target.checked
                  ? [...current, zone.id]
                  : current.filter(id => id !== zone.id))}
                className="mt-1"
              />
              <span>
                <span className="block font-medium">{zone.name}</span>
                {hasConditionalRequirement && (
                  <span className="mt-1 block text-sm text-warning-700">
                    Esta zona puede requerir documentación adicional para las actividades seleccionadas.
                  </span>
                )}
              </span>
            </label>
          );
        })}
        {zones.length === 0 && <p className="text-sm text-default-500">No hay zonas configuradas.</p>}
      </div>
      <StepNavigation
        onBack={onBack}
        currentStep={3}
        totalSteps={5}
        onNext={() => onNext(selectedZoneIds)}
      />
    </div>
  );
}
