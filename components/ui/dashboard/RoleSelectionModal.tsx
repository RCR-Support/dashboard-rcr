"use client";
import React from "react";
import { useRoleStore } from "@/store/ui/roleStore";
import { Button } from "@heroui/react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@heroui/modal";
import { roleMapping, RoleMapping } from '@/lib/roleMapping';

interface RoleSelectionModalProps {
  availableRoles: string[];
  isOpen: boolean;
  onRoleSelected: () => void;
}

const RoleSelectionModal: React.FC<RoleSelectionModalProps> = ({
  availableRoles,
  isOpen,
  onRoleSelected,
}) => {
  const { setRole } = useRoleStore();

  const handleSelect = (role: string) => {
    try {
      setRole(role);
      const storedRole = document.cookie
        .split("; ")
        .find((row) => row.startsWith("role-storage="));
      onRoleSelected();
    } catch (error) {
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      // Se reemplaza onClose por una función vacía para evitar cerrar el modal manualmente.
      onClose={() => {}}
      size="md"
      backdrop="blur"
      className="dark:bg-[#1a202c]"
    >
      <ModalContent>
        <ModalHeader className="flex flex-col text-xl font-bold text-gray-900 dark:text-white">
          Selecciona como quieres ingresar
        </ModalHeader>
        <ModalBody>
          <div className="space-y-2">
            {availableRoles.map((role) => (
              <Button
                key={role}
                onPress={() => handleSelect(role)}
                className="w-full justify-center"
                variant="ghost"
                color="default"
              >
                {roleMapping[role as keyof RoleMapping]}
              </Button>
            ))}
          </div>
        </ModalBody>
        <ModalFooter>
          {/* Se elimina el botón de cancelar para forzar la selección */}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default RoleSelectionModal;
