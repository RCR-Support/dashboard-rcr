import { Modal, ModalBody, ModalContent, ModalHeader } from '@heroui/modal';
import Image from 'next/image';

interface DocumentViewerDocument {
  url: string;
  type: string;
  name: string;
}

interface ApplicationDocumentViewerProps {
  isOpen: boolean;
  document: DocumentViewerDocument | null;
  onClose: () => void;
}

export function ApplicationDocumentViewer({ isOpen, document, onClose }: ApplicationDocumentViewerProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="5xl" scrollBehavior="inside">
      <ModalContent>
        <ModalHeader>{document?.name}</ModalHeader>
        <ModalBody className="p-0">
          {document?.type === 'PDF' ? (
            <iframe
              src={`https://docs.google.com/viewer?url=${encodeURIComponent(document.url)}&embedded=true`}
              className="w-full h-[80vh]"
              title={document.name}
            />
          ) : (
            <div className="relative w-full h-[80vh] bg-gray-100">
              <Image
                src={document?.url || ''}
                alt={document?.name || ''}
                fill
                className="object-contain"
                sizes="(max-width: 768px) 100vw, 80vw"
              />
            </div>
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}