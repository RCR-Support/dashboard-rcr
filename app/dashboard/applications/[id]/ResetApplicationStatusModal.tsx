import { Button } from '@heroui/button';
import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from '@heroui/modal';
import { StateAc } from '@prisma/client';
import { RotateCcw } from 'lucide-react';

interface ResetApplicationStatusModalProps {
  isOpen: boolean;
  stateAc: StateAc;
  resetStage: 'ac' | 'sheq';
  isLoading: boolean;
  onClose: () => void;
  onResetStageChange: (stage: 'ac' | 'sheq') => void;
  onConfirm: () => void;
}

export function ResetApplicationStatusModal({
  isOpen,
  stateAc,
  resetStage,
  isLoading,
  onClose,
  onResetStageChange,
  onConfirm,
}: ResetApplicationStatusModalProps) {
  const canResetSheq = stateAc === StateAc.aprobado;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg" isDismissable={false}>
      <ModalContent>
        <ModalHeader className="flex items-center gap-2">
          <RotateCcw className="w-5 h-5 text-warning" />
          Reiniciar estado de la solicitud
        </ModalHeader>
        <ModalBody>
          <p className="text-sm text-default-600 mb-4">
            Selecciona en qué etapa quieres reiniciar la solicitud. Todos los documentos volverán a estado <strong>Pendiente</strong> y el revisor correspondiente deberá revisarlos nuevamente.
          </p>

          <div className="flex flex-col gap-3">
            <button
              type="button"
              onClick={() => onResetStageChange('ac')}
              className={`w-full text-left p-4 rounded-lg border-2 transition-colors ${
                resetStage === 'ac'
                  ? 'border-warning bg-warning-50 dark:bg-warning-900/20'
                  : 'border-default-200 hover:border-default-400'
              }`}
            >
              <p className="font-semibold">Como Admin Contractor</p>
              <p className="text-sm text-default-500 mt-1">
                Reinicia todo el ciclo desde el inicio. El AC deberá revisar y aprobar nuevamente todos los documentos antes de pasar a SHEQ.
              </p>
              <p className="text-xs text-warning mt-2">
                stateAc -&gt; PENDIENTE · stateSheq -&gt; PENDIENTE · todos los docs -&gt; PENDIENTE
              </p>
            </button>

            <button
              type="button"
              onClick={() => onResetStageChange('sheq')}
              disabled={!canResetSheq}
              className={`w-full text-left p-4 rounded-lg border-2 transition-colors ${
                !canResetSheq
                  ? 'border-default-100 opacity-40 cursor-not-allowed'
                  : resetStage === 'sheq'
                  ? 'border-warning bg-warning-50 dark:bg-warning-900/20'
                  : 'border-default-200 hover:border-default-400'
              }`}
            >
              <p className="font-semibold">Como SHEQ</p>
              <p className="text-sm text-default-500 mt-1">
                Mantiene la aprobación del AC. Solo reinicia la etapa SHEQ. Requiere que el AC ya haya aprobado.
              </p>
              <p className="text-xs text-warning mt-2">
                stateAc -&gt; APROBADO (sin cambios) · stateSheq -&gt; PENDIENTE · todos los docs -&gt; PENDIENTE
              </p>
              {!canResetSheq && <p className="text-xs text-danger mt-1">El AC todavía no ha aprobado esta solicitud</p>}
            </button>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="flat" onPress={onClose}>
            Cancelar
          </Button>
          <Button color="warning" startContent={<RotateCcw className="w-4 h-4" />} onPress={onConfirm} isLoading={isLoading}>
            Reiniciar como {resetStage === 'ac' ? 'Admin Contractor' : 'SHEQ'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}