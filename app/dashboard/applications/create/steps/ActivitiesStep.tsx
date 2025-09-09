import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Contract } from "@/interfaces/contract.interface";

interface Activity {
  id: string;
  name: string;
  description?: string;
}

interface ActivitiesStepProps {
  contract: Contract | null;
  initialData: Activity[] | null;
  onNext: (activities: Activity[]) => void;
  onBack: () => void;
}

export function ActivitiesStep({ contract, initialData, onNext, onBack }: ActivitiesStepProps) {
  const [selectedActivities, setSelectedActivities] = useState<Activity[]>(initialData || []);

  const handleNext = () => {
    onNext(selectedActivities);
  };

  if (!contract) {
    return (
      <div className="text-center space-y-4 py-8">
        <p className="text-muted-foreground">Por favor seleccione un contrato primero</p>
        <Button onClick={onBack} variant="secondary">
          Volver
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-4">Seleccionar Actividades</h2>
        <p className="text-sm text-muted-foreground">
          Seleccione las actividades que el trabajador realizará en este contrato
        </p>
      </div>

      {/* Lista de actividades - Por implementar */}
      <div className="min-h-[200px] flex items-center justify-center">
        <p className="text-muted-foreground">
          La lista de actividades estará disponible pronto
        </p>
      </div>

      <div className="flex justify-between pt-6">
        <Button type="button" variant="outline" onClick={onBack}>
          Volver
        </Button>
        <Button onClick={handleNext}>
          Continuar
        </Button>
      </div>
    </div>
  );
}
