import { Button } from '@heroui/button';
import { Textarea } from '@heroui/input';
import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from '@heroui/modal';

interface RejectedDocument {
  id: string;
  name?: string;
  rejectionReason?: string | null;
}

interface RejectApplicationModalProps {
  isOpen: boolean;
  returnToUser: boolean;
  rejectedDocuments: RejectedDocument[];
  documentCount: number;
  observations: string;
  isLoading: boolean;
  onClose: () => void;
  onObservationsChange: (value: string) => void;
  onConfirm: () => void;
}

export function RejectApplicationModal({
  isOpen,
  returnToUser,
  rejectedDocuments,
  documentCount,
  observations,
  isLoading,
  onClose,
  onObservationsChange,
  onConfirm,
}: RejectApplicationModalProps) {
  const hasRejectedDocuments = rejectedDocuments.length > 0;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg" isDismissable={false}>
      <ModalContent>
        <ModalHeader>Rechazar Solicitud</ModalHeader>
        <ModalBody>
          <p className="mb-4 text-sm text-default-500">
            {returnToUser
              ? 'La solicitud será devuelta al usuario para que adjunte nuevamente los documentos.'
              : 'La solicitud será devuelta al Admin Contractor para revisión.'}
          </p>

          {hasRejectedDocuments && (
            <div className="mb-4 p-3 bg-danger-50 border border-danger-200 rounded-lg">
              <p className="text-sm font-semibold text-danger mb-2">Documentos rechazados:</p>
              <ul className="text-sm space-y-1">
                {rejectedDocuments.map((document) => (
                  <li key={document.id} className="text-default-600">
                    &bull; <strong>{document.name}</strong>: {document.rejectionReason}
                  </li>
                ))}
              </ul>
              <p className="text-xs text-default-500 mt-2">
                {rejectedDocuments.length === documentCount
                  ? 'Puedes dejar las observaciones vacías si solo rechazas por los documentos.'
                  : 'Agrega observaciones adicionales si rechazas por otros motivos (foto, datos, etc.)'}
              </p>
            </div>
          )}

          <Textarea
            label={hasRejectedDocuments ? 'Observaciones adicionales (opcional)' : 'Observaciones'}
            placeholder={hasRejectedDocuments
              ? 'Agrega observaciones adicionales solo si rechazas por otros motivos (foto, datos personales, contrato, etc.)'
              : 'Ej: Foto no cumple con los requisitos (debe ser de rostro, fondo blanco)\nDatos personales incorrectos\nContrato no corresponde al puesto del trabajador'}
            value={observations}
            onValueChange={onObservationsChange}
            minRows={4}
            isRequired={!hasRejectedDocuments}
          />
        </ModalBody>
        <ModalFooter>
          <Button variant="flat" onPress={onClose}>
            Cancelar
          </Button>
          <Button color="danger" onPress={onConfirm} isLoading={isLoading}>
            Rechazar
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}