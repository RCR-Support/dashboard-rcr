import { Button } from '@heroui/button';
import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from '@heroui/modal';

interface SheqUser {
  id: string;
  displayName: string;
  email: string;
}

interface ApproveApplicationAcModalProps {
  isOpen: boolean;
  selectedSheq: string;
  sheqUsers: SheqUser[];
  isLoading: boolean;
  canApprove: boolean;
  onClose: () => void;
  onSelectedSheqChange: (userId: string) => void;
  onConfirm: () => void;
}

export function ApproveApplicationAcModal({
  isOpen,
  selectedSheq,
  sheqUsers,
  isLoading,
  canApprove,
  onClose,
  onSelectedSheqChange,
  onConfirm,
}: ApproveApplicationAcModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg" isDismissable={false}>
      <ModalContent>
        <ModalHeader>Aprobar Solicitud</ModalHeader>
        <ModalBody>
          <p className="mb-4">Selecciona el revisor SHEQ que continuará con la revisión:</p>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-foreground">Revisor SHEQ</label>
            <select
              value={selectedSheq}
              onChange={(event) => onSelectedSheqChange(event.target.value)}
              className="w-full rounded-lg border border-default-300 bg-default-100 px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-success"
            >
              <option value="">Selecciona un revisor</option>
              {sheqUsers.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.displayName} - {user.email}
                </option>
              ))}
            </select>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="flat" onPress={onClose}>
            Cancelar
          </Button>
          <Button color="success" onPress={onConfirm} isLoading={isLoading} isDisabled={!selectedSheq || !canApprove}>
            Aprobar
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}