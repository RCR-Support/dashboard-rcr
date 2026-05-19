'use client';

import { useState, useEffect } from 'react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Checkbox,
  Textarea,
  Chip,
  Spinner,
} from '@heroui/react';
import { ArrowLeftRight, Calendar, CheckCircle, AlertTriangle } from 'lucide-react';
import Swal from 'sweetalert2';
import { returnAcContracts } from '@/actions/contract/return-ac-contracts';
import { format, isPast, differenceInDays } from 'date-fns';
import { es } from 'date-fns/locale';

export interface PendingReturnLog {
  id: string;
  contractId: string;
  contractName: string;
  contractNumber: string;
  newAcId: string;
  newAcName: string;
  returnDate: string | null;
  createdAt: string;
  reason: string;
}

interface ReturnContractsModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** AC que vuelve (el que estaba ausente) */
  user: { id: string; displayName: string };
  /** Logs pendientes de devolución ya filtrados */
  pendingLogs: PendingReturnLog[];
  onSuccess: () => void;
}

// Agrupa los logs por "evento" (mismo AC receptor + misma fecha de creación al día)
function groupLogs(logs: PendingReturnLog[]) {
  const groups: Record<string, PendingReturnLog[]> = {};
  logs.forEach(log => {
    const key = `${log.newAcId}_${log.createdAt.slice(0, 10)}`;
    if (!groups[key]) groups[key] = [];
    groups[key].push(log);
  });
  return Object.entries(groups).map(([key, items]) => ({
    key,
    newAcId: items[0].newAcId,
    newAcName: items[0].newAcName,
    returnDate: items[0].returnDate,
    createdAt: items[0].createdAt,
    reason: items[0].reason,
    logs: items,
  }));
}

export function ReturnContractsModal({
  isOpen,
  onClose,
  user,
  pendingLogs,
  onSuccess,
}: ReturnContractsModalProps) {
  const [selectedLogIds, setSelectedLogIds] = useState<Set<string>>(new Set());
  const [returnReason, setReturnReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const groups = groupLogs(pendingLogs);

  // Seleccionar todos al abrir
  useEffect(() => {
    if (isOpen) {
      setSelectedLogIds(new Set(pendingLogs.map(l => l.id)));
      setReturnReason('');
    }
  }, [isOpen, pendingLogs]);

  const toggleLog = (id: string) => {
    setSelectedLogIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleGroup = (groupLogs: PendingReturnLog[]) => {
    const allSelected = groupLogs.every(l => selectedLogIds.has(l.id));
    setSelectedLogIds(prev => {
      const next = new Set(prev);
      groupLogs.forEach(l => allSelected ? next.delete(l.id) : next.add(l.id));
      return next;
    });
  };

  const isValid = selectedLogIds.size > 0;

  const handleSubmit = async () => {
    if (!isValid) return;

    const count = selectedLogIds.size;
    const confirm = await Swal.fire({
      title: '¿Confirmar devolución?',
      html: `Se devolverán <strong>${count}</strong> contrato(s) a <strong>${user.displayName}</strong>.`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, devolver',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#2563eb',
    });

    if (!confirm.isConfirmed) return;

    setIsSubmitting(true);
    const result = await returnAcContracts({
      logIds: Array.from(selectedLogIds),
      originalAcId: user.id,
      returnReason: returnReason.trim() || undefined,
    });
    setIsSubmitting(false);

    if (result.ok) {
      await Swal.fire({
        title: '¡Devolución completada!',
        text: `Se devolvieron ${result.returned} contrato(s) a ${user.displayName}.`,
        icon: 'success',
        timer: 2500,
        showConfirmButton: false,
      });
      onSuccess();
      onClose();
    } else {
      Swal.fire('Error', result.error ?? 'Error inesperado', 'error');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl" scrollBehavior="inside">
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <ArrowLeftRight size={20} className="text-primary" />
            <span>Devolución de contratos</span>
          </div>
          <p className="text-sm font-normal text-default-500">
            Devolver contratos a{' '}
            <span className="font-medium text-foreground">{user.displayName}</span>
          </p>
        </ModalHeader>

        <ModalBody className="gap-4">
          {pendingLogs.length === 0 ? (
            <div className="text-center py-8 text-default-400">
              <CheckCircle size={36} className="mx-auto mb-2 opacity-40" />
              <p>No hay contratos pendientes de devolución.</p>
            </div>
          ) : (
            <>
              <p className="text-sm text-default-500">
                Seleccioná los contratos que querés devolver. Por defecto están todos seleccionados.
              </p>

              {/* Grupos de traspaso */}
              <div className="space-y-3">
                {groups.map(group => {
                  const returnDate = group.returnDate ? new Date(group.returnDate) : null;
                  const allGroupSelected = group.logs.every(l => selectedLogIds.has(l.id));
                  const someGroupSelected = group.logs.some(l => selectedLogIds.has(l.id));
                  const daysUntilReturn = returnDate
                    ? differenceInDays(returnDate, new Date())
                    : null;

                  return (
                    <div key={group.key} className="border rounded-lg overflow-hidden">
                      {/* Encabezado del grupo */}
                      <div className="flex items-start justify-between px-3 py-2 bg-default-50 border-b">
                        <div className="flex items-center gap-2">
                          <Checkbox
                            isSelected={allGroupSelected}
                            isIndeterminate={someGroupSelected && !allGroupSelected}
                            onValueChange={() => toggleGroup(group.logs)}
                            size="sm"
                          />
                          <div>
                            <p className="text-sm font-medium">
                              Traspasado a{' '}
                              <span className="text-secondary">{group.newAcName}</span>
                            </p>
                            <p className="text-xs text-default-400">
                              {format(new Date(group.createdAt), "dd/MM/yyyy", { locale: es })}
                              {' · '}
                              {group.logs.length} contrato{group.logs.length !== 1 ? 's' : ''}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          {returnDate ? (
                            <Chip
                              size="sm"
                              variant="flat"
                              color={isPast(returnDate) ? 'danger' : daysUntilReturn! <= 3 ? 'warning' : 'primary'}
                              startContent={<Calendar size={11} />}
                            >
                              {isPast(returnDate)
                                ? `Retorno: ${format(returnDate, 'dd/MM/yy', { locale: es })} (vencido)`
                                : daysUntilReturn === 0
                                  ? 'Retorna hoy'
                                  : daysUntilReturn === 1
                                    ? 'Retorna mañana'
                                    : `En ${daysUntilReturn} días`}
                            </Chip>
                          ) : (
                            <Chip size="sm" variant="flat" color="default" startContent={<AlertTriangle size={11} />}>
                              Sin fecha pactada
                            </Chip>
                          )}
                        </div>
                      </div>

                      {/* Contratos del grupo */}
                      {group.logs.map(log => (
                        <div
                          key={log.id}
                          className="flex items-center gap-3 px-3 py-2 hover:bg-default-50 transition-colors"
                        >
                          <Checkbox
                            isSelected={selectedLogIds.has(log.id)}
                            onValueChange={() => toggleLog(log.id)}
                            size="sm"
                          />
                          <div>
                            <p className="text-sm font-medium">#{log.contractNumber} — {log.contractName}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>

              {/* Motivo opcional */}
              <Textarea
                label="Motivo de la devolución"
                placeholder="Ej: El AC regresó de vacaciones, alta médica..."
                value={returnReason}
                onValueChange={setReturnReason}
                minRows={2}
                maxRows={3}
                description="Opcional"
              />
            </>
          )}
        </ModalBody>

        <ModalFooter>
          <Button variant="light" onPress={onClose} isDisabled={isSubmitting}>
            Cancelar
          </Button>
          {pendingLogs.length > 0 && (
            <Button
              color="primary"
              onPress={handleSubmit}
              isDisabled={!isValid}
              isLoading={isSubmitting}
            >
              Devolver {selectedLogIds.size > 0 ? `(${selectedLogIds.size})` : ''}
            </Button>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
