'use client';

import React from 'react';
import Avatar from '@mui/material/Avatar';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from '@heroui/modal';
import { Button } from '@heroui/react';
import { IoClose } from 'react-icons/io5';
import { Pencil, Trash } from 'lucide-react';
import { formatPhoneNumber } from '@/lib/formatPhoneNumber';
import { formatRun } from '@/lib/validations';
import type { User } from '@/interfaces';
import { RoleEnum } from '@prisma/client';

interface Props {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export const UserModal = ({ user, isOpen, onClose, onEdit, onDelete }: Props) => {
  if (!user) return null;

  function stringAvatar(displayName: string) {
    return {
      children: `${displayName.split(' ')[0][0]}${displayName.split(' ')[1] ? displayName.split(' ')[1][0] : ''}`,
    };
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md" backdrop="blur">
      <ModalContent>
        <ModalHeader className="flex flex-col">
          Información de contacto de:{' '}
          <span className="text-[#03c9d7] text-xs font-semibold">{user.userName}</span>
        </ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <p className="flex justify-start items-center gap-2">
              <span className="font-semibold">Nombre:</span>{' '}
              <span className="truncate text-ellipsis max-w-[360px]">{user.name} {user.middleName} {user.lastName} {user.secondLastName}</span>
            </p>
            <p className="flex justify-start items-center gap-2">
              <span className="font-semibold">Email:</span>{' '}
              <span className="truncate text-ellipsis max-w-[360px]">{user.email}</span>{' '}
            </p>
            <p className="flex justify-start items-center gap-2">
              <span className="font-semibold">N° Telefono:</span>{' '}
              <span className="truncate text-ellipsis max-w-[360px]">{formatPhoneNumber(user.phoneNumber || '')}</span>
            </p>

            <div className="border-b border-gray-200 dark:border-gray-800"></div>
            <p className="flex justify-start items-center gap-2">
              <span className="font-semibold">Empresa:</span>{' '}
              <span className="truncate text-ellipsis max-w-[360px]">{user.company?.name}</span>
            </p>
            <p className="flex justify-start items-center gap-2">
              <span className="font-semibold">RUT:</span>{' '}
              <span className="truncate text-ellipsis max-w-[360px]">{formatRun(user.company?.rut || '')}</span>
            </p>
            <p>
              <span className="font-semibold">N° Telefono: </span>{' '}
              <span className="truncate text-ellipsis max-w-[360px]">{formatPhoneNumber(user.company?.phone || '')}</span>
            </p>

            {user.adminContractorId && (
              <>
                <div className="border-b border-gray-200 dark:border-gray-800"></div>
                <h3 className="font-semibold text-sm">Administrador de contrato:</h3>
                <p className="flex justify-start items-center gap-2">
                  <span className="font-semibold">Nombre:</span>{' '}
                  <span className="truncate text-ellipsis max-w-[360px]">{user.adminContractor?.name} {user.adminContractor?.lastName}</span>
                </p>
                <p className="flex justify-start items-center gap-2">
                  <span className="font-semibold">Email:</span>{' '}
                  <span className="truncate text-ellipsis max-w-[360px]">{user.adminContractor?.email}</span>{' '}
                </p>
              </>
            )}

            {user.roles?.includes('adminContractor' as RoleEnum) && user.assignedUsers && (
              <>
                {user.assignedUsers.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400 text-sm">No hay usuarios asignados a este administrador.</p>
                ) : (
                  <>
                    <div className="border-b border-gray-200 dark:border-gray-800"></div>
                    <div className="space-y-2">
                      <h3 className="font-semibold text-sm">Usuarios asignados a este administrador:</h3>
                      <div className="border rounded-md p-4 max-h-60 overflow-y-auto">
                        <ul className="space-y-3">
                          {user.assignedUsers.map(u => (
                            <li key={u.id} className="text-sm border-b pb-2 last:border-0">
                              <p className="font-medium">{u.displayName}</p>
                              <p className="text-gray-500 dark:text-gray-400 text-xs">{u.email}</p>
                              {u.company?.name && (<p className="text-gray-400 dark:text-gray-500 text-xs mt-1">{u.company.name}</p>)}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <p className="text-xs text-amber-500">Total usuarios asignados: {user.assignedUsers.length}</p>
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </ModalBody>
        <ModalFooter className="flex justify-between items-center">
          <Button
            color="default"
            className="self-start text-left text-default-500 hover:bg-default-100 dark:hover:bg-default-800 dark:hover:text-neutral-800"
            variant="flat"
            onPress={onClose}
            startContent={<IoClose className="h-4 w-4" />}
          >
            Cerrar
          </Button>
          <div className="flex gap-4">
            <Button color="success" variant="flat" onPress={onEdit} startContent={<Pencil className="h-4 w-4" />}>Editar</Button>
            <Button color="danger" variant="flat" onPress={onDelete} startContent={<Trash className="h-4 w-4" />}>Eliminar</Button>
          </div>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default UserModal;
