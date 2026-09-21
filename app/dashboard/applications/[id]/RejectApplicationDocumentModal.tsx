import { Button } from '@heroui/button';
import { Textarea } from '@heroui/input';
import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from '@heroui/modal';

interface RejectApplicationDocumentModalProps {
  isOpen: boolean;
  rejectionReason: string;
  onClose: () => void;
  onRejectionReasonChange: (value: string) => void;
  onConfirm: () => void;
}

export function RejectApplicationDocumentModal({
  isOpen,
  rejectionReason,
  onClose,
  onRejectionReasonChange,
  onConfirm,
}: RejectApplicationDocumentModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg" isDismissable={false}>
      <ModalContent>
        <ModalHeader>Rechazar Documento</ModalHeader>
        <ModalBody>
          <p className="mb-4">Indica por qué este documento no es válido:</p>
          <Textarea
            label="Motivo del rechazo"
            placeholder="Ej: Documento vencido, información ilegible, falta firma..."
            value={rejectionReason}
            onValueChange={onRejectionReasonChange}
            minRows={3}
            isRequired
          />
        </ModalBody>
        <ModalFooter>
          <Button variant="flat" onPress={onClose}>
            Cancelar
          </Button>
          <Button color="danger" onPress={onConfirm}>
            Rechazar Documento
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}