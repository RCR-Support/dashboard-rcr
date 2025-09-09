import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Contract } from "@/interfaces/contract.interface";

interface Document {
  id: string;
  name: string;
  file?: File;
  status: 'pending' | 'uploading' | 'completed' | 'error';
}

interface DocumentsStepProps {
  contract: Contract | null;
  initialData: Document[] | null;
  onNext: (documents: Document[]) => void;
  onBack: () => void;
}

export function DocumentsStep({ contract, initialData, onNext, onBack }: DocumentsStepProps) {
  const [documents, setDocuments] = useState<Document[]>(initialData || []);

  const handleNext = () => {
    onNext(documents);
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
        <h2 className="text-lg font-semibold mb-4">Documentos Requeridos</h2>
        <p className="text-sm text-muted-foreground">
          Sube los documentos requeridos para el contrato
        </p>
      </div>

      {/* Lista de documentos - Por implementar */}
      <div className="min-h-[200px] flex items-center justify-center">
        <p className="text-muted-foreground">
          La lista de documentos estará disponible pronto
        </p>
      </div>

      <div className="flex justify-between pt-6">
        <Button type="button" variant="outline" onClick={onBack}>
          Volver
        </Button>
        <Button onClick={handleNext}>
          Completar
        </Button>
      </div>
    </div>
  );
}
