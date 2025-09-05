'use client';

import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from '@heroui/modal';
import { Button } from '@heroui/react';
import { AssignedUser } from '@/interfaces/admin.interface';
import { useRouter } from 'next/navigation';

interface BlockDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  assignedUsers: AssignedUser[];
  adminName: string;
}

export const BlockDeleteModal = ({
  isOpen,
  onClose,
  assignedUsers,
  adminName,
}: BlockDeleteModalProps) => {
  const router = useRouter();

  const handleUserAction = (userId: string) => {
    router.push(`/dashboard/users/edit/${userId}`);
  };

  // Si solo hay un usuario, mostrar interfaz simplificada
  if (assignedUsers.length === 1) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} size="md" backdrop="blur">
        <ModalContent>
          <ModalHeader className="text-amber-500">
            No se puede eliminar el Administrador
          </ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              <p>
                El administrador{' '}
                <span className="font-semibold">{adminName}</span> tiene un
                usuario asignado que necesita ser reasignado.
              </p>
              <div className="border rounded-md p-4">
                <div className="text-sm">
                  <p className="font-medium">{assignedUsers[0].displayName}</p>
                  <p className="text-gray-500">{assignedUsers[0].email}</p>
                  {assignedUsers[0].company?.name && (
                    <p className="text-gray-400 text-xs">
                      {assignedUsers[0].company.name}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button
              color="primary"
              variant="flat"
              onPress={() => handleUserAction(assignedUsers[0].id)}
              className=""
            >
              Editar Usuario
            </Button>
            <Button color="danger" variant="light" onPress={onClose}>
              Cerrar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    );
  }

  // Interfaz para múltiples usuarios
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md" backdrop="blur">
      <ModalContent>
        <ModalHeader className="text-amber-500">
          No se puede eliminar el Administrador
        </ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <p>
              El administrador{' '}
              <span className="font-semibold">{adminName}</span> tiene
              {assignedUsers.length} usuarios asignados que necesitan ser
              reasignados.
            </p>
            <div className="border rounded-md p-4 max-h-60 overflow-y-auto">
              <ul className="space-y-3">
                {assignedUsers.map(user => (
                  <li
                    key={user.id}
                    className="text-sm border-b pb-2 last:border-0"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{user.displayName}</p>
                        <p className="text-gray-500">{user.email}</p>
                        {user.company?.name && (
                          <p className="text-gray-400 text-xs">
                            {user.company.name}
                          </p>
                        )}
                      </div>
                      <Button
                        size="sm"
                        color="primary"
                        variant="flat"
                        onPress={() => handleUserAction(user.id)}
                        className="ml-2"
                      >
                        Editar
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color="danger" variant="light" onPress={onClose}>
            Cerrar
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
