'use client';

import React from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from '@heroui/modal';
import { Button } from '@heroui/react';
import { IoClose } from 'react-icons/io5';
import { Pencil, Trash, Trash2, ArrowRightLeft, Clock, CheckCircle } from 'lucide-react';
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
  onPermanentDelete?: () => void;
}

export const UserModal = ({ user, isOpen, onClose, onEdit, onDelete, onPermanentDelete }: Props) => {
  if (!user) return null;

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

            {user.contracts && user.contracts.length > 0 && (
              <>
                <div className="border-b border-gray-200 dark:border-gray-800"></div>
                <div className="space-y-2">
                  <h3 className="font-semibold text-sm">Contratos asignados:</h3>
                  <div className="border rounded-md p-3 max-h-48 overflow-y-auto space-y-2">
                    {user.contracts.map(c => (
                      <div key={c.id} className="text-sm border-b pb-2 last:border-0">
                        <p className="font-medium">{c.contractName}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">N° {c.contractNumber}</p>
                        {c.Company?.name && (
                          <p className="text-xs text-gray-400 dark:text-gray-500">{c.Company.name}</p>
                        )}
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-amber-500">Total contratos: {user.contracts.length}</p>
                </div>
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

            {user.roles?.includes('adminContractor' as RoleEnum) && user.reassignmentLogs && user.reassignmentLogs.length > 0 && (
              <>
                <div className="border-b border-gray-200 dark:border-gray-800"></div>
                <div className="space-y-2">
                  <h3 className="font-semibold text-sm flex items-center gap-1">
                    <ArrowRightLeft size={14} />
                    Historial de traspasos
                  </h3>
                  <div className="border rounded-md max-h-64 overflow-y-auto divide-y">
                    {(() => {
                      // Agrupar logs por evento (contratos traspasados juntos en el mismo día al mismo AC)
                      const groups: Record<string, typeof user.reassignmentLogs> = {};
                      user.reassignmentLogs!.forEach(log => {
                        const key = `${log.newAcId}_${log.createdAt.slice(0, 10)}`;
                        if (!groups[key]) groups[key] = [];
                        groups[key]!.push(log);
                      });
                      return Object.values(groups).map((group) => {
                        const first = group![0]!;
                        const returnDate = first.returnDate ? new Date(first.returnDate) : null;
                        const now = new Date();
                        const isPermanente = first.mode === 'permanente';
                        const returnPassed = returnDate && returnDate < now;

                        return (
                          <div key={`${first.newAcId}_${first.createdAt}`} className="p-3 text-sm">
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <div className="flex items-center gap-1">
                                {isPermanente
                                  ? <CheckCircle size={13} className="text-danger shrink-0 mt-0.5" />
                                  : <Clock size={13} className="text-warning shrink-0 mt-0.5" />
                                }
                                <span className="font-medium">
                                  {isPermanente ? 'Permanente' : 'Temporal'}
                                </span>
                              </div>
                              <span className="text-xs text-gray-400">
                                {new Date(first.createdAt).toLocaleDateString('es-CL')}
                              </span>
                            </div>
                            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                              → <span className="font-medium">{first.newAcName}</span>
                            </p>
                            <p className="text-xs text-gray-500 mb-1">
                              Contratos: {group!.map(l => `#${l.contractNumber}`).join(', ')}
                            </p>
                            {!isPermanente && (
                              <p className={`text-xs ${returnPassed ? 'text-orange-500' : 'text-blue-500'}`}>
                                {returnDate
                                  ? returnPassed
                                    ? `Retorno estimado: ${returnDate.toLocaleDateString('es-CL')} (pendiente)`
                                    : `Retorna: ${returnDate.toLocaleDateString('es-CL')}`
                                  : 'Sin fecha de retorno'}
                              </p>
                            )}
                            <p className="text-xs text-gray-400 mt-1 italic truncate">
                              Motivo: {first.reason}
                            </p>
                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>
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
            {user.deletedLogic && onPermanentDelete && (
              <Button color="danger" variant="solid" onPress={onPermanentDelete} startContent={<Trash2 className="h-4 w-4" />}>Eliminar definitivo</Button>
            )}
          </div>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default UserModal;
