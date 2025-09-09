import { Card } from "@/components/ui/card";
import { useApplicationFormStore } from "@/store/application-form-store";

export function WorkerInfo() {
  const { workerData } = useApplicationFormStore();

  if (!workerData?.workerName) return null;

  return (
    <Card className="p-4 mb-6 bg-muted/50">
      <div className="space-y-2">
        <h3 className="text-sm font-semibold">Información del Trabajador</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Nombre</p>
            <p className="font-medium">{workerData.workerName}</p>
          </div>
          <div>
            <p className="text-muted-foreground">RUN</p>
            <p className="font-medium">{workerData.workerRun}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Apellido Paterno</p>
            <p className="font-medium">{workerData.workerPaternal}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Apellido Materno</p>
            <p className="font-medium">{workerData.workerMaternal || '-'}</p>
          </div>
        </div>
      </div>
    </Card>
  );
}
