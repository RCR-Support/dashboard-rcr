import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Contract } from '@/interfaces/contract.interface';
import { useEffect, useState } from 'react';

interface ContractStepProps {
  initialData: Contract | null;
  availableContracts: Contract[];
  onNext: (contract: Contract) => void;
  onCancel?: () => void;
}

export function ContractStep({ initialData, availableContracts, onNext, onCancel }: ContractStepProps) {
  const [selectedContract, setSelectedContract] = useState<Contract | null>(
    initialData || null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Auto-selección si hay un solo contrato
    if (availableContracts.length === 1 && !selectedContract) {
      setSelectedContract(availableContracts[0]);
    }
  }, [availableContracts, selectedContract]);

  const handleSelect = (contract: Contract) => {
    setSelectedContract(contract);
    onNext(contract);
  };

  if (loading) {
    return <div>Cargando contratos...</div>;
  }

  if (error) {
    return (
      <div className="text-red-500">
        Error: {error}
        <Button onClick={() => window.location.reload()} variant="secondary">
          Reintentar
        </Button>
      </div>
    );
  }

  if (availableContracts.length === 0) {
    return (
      <div className="text-center space-y-4 py-8">
        <p className="text-muted-foreground">No hay contratos disponibles</p>
        {onCancel && (
          <Button onClick={onCancel} variant="secondary">
            Volver
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {availableContracts.map((contract: Contract) => (
          <Card
            key={contract.id}
            className={`relative p-4 transition-all hover:shadow-md ${
              selectedContract?.id === contract.id
                ? 'border-2 border-primary'
                : ''
            }`}
          >
            {/* Radio button para selección */}
            <div 
              className={`absolute top-4 right-4 h-4 w-4 rounded-full border-2 cursor-pointer ${
                selectedContract?.id === contract.id ? 'bg-primary' : 'border-muted'
              }`}
              onClick={() => setSelectedContract(contract)}
            />

            <div className="space-y-2">
              <h3 className="text-lg font-medium pr-6">
                Contrato #{contract.contractNumber}
              </h3>
              <p className="text-sm text-muted-foreground">
                {contract.contractName}
              </p>
              <div className="text-sm space-y-2">
                <div>
                  <p>
                    <strong>Inicio:</strong>{' '}
                    {new Date(contract.initialDate).toLocaleDateString()}
                  </p>
                  <p>
                    <strong>Término:</strong>{' '}
                    {new Date(contract.finalDate).toLocaleDateString()}
                  </p>
                </div>
                <div className="pt-2 border-t">
                  <p className="text-xs text-muted-foreground mb-1">Administrador de contrato:</p>
                  <p className="font-medium">{contract.userAc?.displayName || 'No asignado'}</p>
                </div>

                {/* Botón de seleccionar contrato */}
                <div className="pt-4">
                  {selectedContract?.id === contract.id ? (
                    <Button 
                      className="w-full"
                      onClick={() => handleSelect(contract)}
                    >
                      Continuar con este contrato
                    </Button>
                  ) : (
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => setSelectedContract(contract)}
                    >
                      Seleccionar contrato
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
