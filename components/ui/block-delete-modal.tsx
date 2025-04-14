"use client";

import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@heroui/modal";
import { Button } from "@heroui/react";
import { AssignedUser } from "@/interfaces/admin.interface";
import { useRouter } from "next/navigation";

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
    adminName
}: BlockDeleteModalProps) => {
    const router = useRouter();

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="md" backdrop="blur">
            <ModalContent>
                <ModalHeader className="text-danger">
                    No se puede eliminar el Administrador
                </ModalHeader>
                <ModalBody>
                    <div className="space-y-4">
                        <p>
                            El administrador <span className="font-semibold">{adminName}</span> tiene
                            {assignedUsers.length} usuarios asignados que necesitan ser reasignados primero.
                        </p>
                        <div className="border rounded-md p-4 max-h-60 overflow-y-auto">
                            <h3 className="font-semibold mb-2">Usuarios asignados:</h3>
                            <ul className="space-y-2">
                                {assignedUsers.map((user) => (
                                    <li key={user.id} className="text-sm border-b pb-2 last:border-0">
                                        <p className="font-medium">{user.displayName}</p>
                                        <p className="text-gray-500">{user.email}</p>
                                        {user.company?.name && (
                                            <p className="text-gray-400 text-xs">{user.company.name}</p>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </ModalBody>
                <ModalFooter>
                    <Button
                        color="primary"
                        variant="flat"
                        onPress={() => router.push('/dashboard/users/reassign')}
                    >
                        Gestionar reasignación
                    </Button>
                    <Button
                        color="danger"
                        variant="light"
                        onPress={onClose}
                    >
                        Cerrar
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};
