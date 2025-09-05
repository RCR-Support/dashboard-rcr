import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Contract } from '@prisma/client';
import { useEffect, useState } from 'react';

interface ContractStepProps {
  data: {
    contract?: Contract;
  };
  onNext: (data: { contract: Contract }) => void;
  onBack: () => void;
}

export function ContractStep({ data, onNext, onBack }: ContractStepProps) {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(
    data.contract || null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadContracts() {
      try {
        const response = await fetch('/api/contracts');
        if (!response.ok) {
          throw new Error('Error al cargar contratos');
        }
        const data = await response.json();
        setContracts(data);

        // Auto-selección si hay un solo contrato
        if (data.length === 1) {
          setSelectedContract(data[0]);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    }

    loadContracts();
  }, []);

  const handleNext = () => {
    if (selectedContract) {
      onNext({ contract: selectedContract });
    }
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

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {contracts.map(contract => (
          <Card
            key={contract.id}
            className={`cursor-pointer p-4 transition-all hover:shadow-md ${
              selectedContract?.id === contract.id
                ? 'border-2 border-primary'
                : ''
            }`}
            onClick={() => setSelectedContract(contract)}
          >
            <div className="space-y-2">
              <h3 className="text-lg font-medium">
                Contrato #{contract.contractNumber}
              </h3>
              <p className="text-sm text-muted-foreground">
                {contract.contractName}
              </p>
              <div className="text-sm">
                <p>
                  <strong>Inicio:</strong>{' '}
                  {new Date(contract.initialDate).toLocaleDateString()}
                </p>
                <p>
                  <strong>Término:</strong>{' '}
                  {new Date(contract.finalDate).toLocaleDateString()}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="flex justify-between">
        <Button onClick={onBack} variant="outline">
          Atrás
        </Button>
        <Button onClick={handleNext} disabled={!selectedContract}>
          Continuar
        </Button>
      </div>
    </div>
  );
}
