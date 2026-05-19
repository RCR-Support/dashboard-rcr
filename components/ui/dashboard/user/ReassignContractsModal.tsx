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
  Select,
  SelectItem,
  Textarea,
  Spinner,
  Chip,
} from '@heroui/react';
import { AlertTriangle, Calendar, FileText, ArrowRightLeft } from 'lucide-react';
import Swal from 'sweetalert2';
import { getAcContracts, AcContract } from '@/actions/contract/get-ac-contracts';
import { reassignContracts } from '@/actions/contract/reassign-contracts';
import { fetchAdmins } from '@/actions/user/get-admincContractor';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface AcUserRef {
  id: string;
  displayName: string;
}

interface ReassignContractsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: AcUserRef;
  onSuccess: () => void;
}

export function ReassignContractsModal({
  isOpen,
  onClose,
  user,
  onSuccess,
}: ReassignContractsModalProps) {
  const [mode, setMode] = useState<'temporal' | 'permanente'>('temporal');
  const [contracts, setContracts] = useState<AcContract[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [targetAcId, setTargetAcId] = useState('');
  const [reason, setReason] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [deactivateUser, setDeactivateUser] = useState(true);
  const [availableAcs, setAvailableAcs] = useState<{ value: string; label: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Cargar contratos y ACs disponibles al abrir
  useEffect(() => {
    if (!isOpen) return;

    setIsLoading(true);
    setSelectedIds(new Set());
    setTargetAcId('');
    setReason('');
    setReturnDate('');
    setMode('temporal');
    setDeactivateUser(true);

    Promise.all([
      getAcContracts(user.id),
      fetchAdmins(),
    ]).then(([contractsRes, adminsRes]) => {
      if (contractsRes.ok && contractsRes.contracts) {
        setContracts(contractsRes.contracts);
      }
      if (adminsRes.ok) {
        // Excluir al AC ausente de la lista de receptores
        setAvailableAcs(
          (adminsRes.admins ?? [])
            .filter(a => a.value !== user.id)
            .map(a => ({ value: a.value, label: a.label }))
        );
      }
    }).finally(() => setIsLoading(false));
  }, [isOpen, user.id]);

  // En modo permanente: seleccionar todos automáticamente
  useEffect(() => {
    if (mode === 'permanente') {
      setSelectedIds(new Set(contracts.map(c => c.id)));
    } else {
      setSelectedIds(new Set());
    }
  }, [mode, contracts]);

  const toggleContract = (id: string) => {
    if (mode === 'permanente') return; // no editable en modo permanente
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selectedIds.size === contracts.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(contracts.map(c => c.id)));
    }
  };

  const isValid =
    selectedIds.size > 0 &&
    targetAcId !== '' &&
    reason.trim().length >= 5;

  const handleSubmit = async () => {
    if (!isValid) return;

    const confirmResult = await Swal.fire({
      title: mode === 'permanente'
        ? '¿Confirmar traspaso permanente?'
        : '¿Confirmar traspaso?',
      html: mode === 'permanente'
        ? `Se traspasarán <strong>${selectedIds.size}</strong> contrato(s) y${deactivateUser ? ' el usuario quedará desactivado.' : ' el usuario <strong>no</strong> será desactivado.'}`
        : `Se traspasarán <strong>${selectedIds.size}</strong> contrato(s) seleccionado(s).`,
      icon: mode === 'permanente' ? 'warning' : 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, traspasar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: mode === 'permanente' ? '#dc2626' : '#2563eb',
    });

    if (!confirmResult.isConfirmed) return;

    setIsSubmitting(true);
    const result = await reassignContracts({
      fromUserId: user.id,
      toUserId: targetAcId,
      contractIds: Array.from(selectedIds),
      reason: reason.trim(),
      mode,
      returnDate: returnDate || undefined,
      deactivateUser: mode === 'permanente' ? deactivateUser : undefined,
    });
    setIsSubmitting(false);

    if (result.ok) {
      await Swal.fire({
        title: '¡Traspaso completado!',
        text: `Se traspasaron ${result.reassigned} contrato(s) exitosamente.`,
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
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="2xl"
      scrollBehavior="inside"
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <ArrowRightLeft size={20} className="text-primary" />
            <span>Traspaso de contratos</span>
          </div>
          <p className="text-sm font-normal text-default-500">
            AC ausente: <span className="font-medium text-foreground">{user.displayName}</span>
          </p>
        </ModalHeader>

        <ModalBody className="gap-4">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Spinner label="Cargando contratos..." />
            </div>
          ) : (
            <>
              {/* Selector de modo */}
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant={mode === 'temporal' ? 'solid' : 'bordered'}
                  color={mode === 'temporal' ? 'primary' : 'default'}
                  onPress={() => setMode('temporal')}
                >
                  Temporal
                </Button>
                <Button
                  size="sm"
                  variant={mode === 'permanente' ? 'solid' : 'bordered'}
                  color={mode === 'permanente' ? 'danger' : 'default'}
                  onPress={() => setMode('permanente')}
                >
                  Permanente
                </Button>
                {mode === 'permanente' && (
                  <Chip color="danger" size="sm" variant="flat" startContent={<AlertTriangle size={12} />}>
                    Desactiva al usuario
                  </Chip>
                )}
              </div>

              {/* Lista de contratos */}
              {contracts.length === 0 ? (
                <div className="text-center py-6 text-default-400">
                  <FileText size={32} className="mx-auto mb-2 opacity-40" />
                  <p>Este usuario no tiene contratos activos asignados.</p>
                </div>
              ) : (
                <div className="border rounded-lg overflow-hidden">
                  {/* Encabezado con "seleccionar todos" solo en modo temporal */}
                  {mode === 'temporal' && (
                    <div className="flex items-center gap-2 px-3 py-2 bg-default-50 border-b">
                      <Checkbox
                        isSelected={selectedIds.size === contracts.length && contracts.length > 0}
                        isIndeterminate={selectedIds.size > 0 && selectedIds.size < contracts.length}
                        onValueChange={toggleAll}
                        size="sm"
                      >
                        <span className="text-xs text-default-600">Seleccionar todos</span>
                      </Checkbox>
                    </div>
                  )}

                  {contracts.map(contract => (
                    <div
                      key={contract.id}
                      className="flex items-start gap-3 px-3 py-3 border-b last:border-b-0 hover:bg-default-50 transition-colors"
                    >
                      <Checkbox
                        isSelected={selectedIds.has(contract.id)}
                        isDisabled={mode === 'permanente'}
                        onValueChange={() => toggleContract(contract.id)}
                        size="sm"
                        className="mt-0.5"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          #{contract.contractNumber} — {contract.contractName}
                        </p>
                        <p className="text-xs text-default-500">
                          {contract.company?.name ?? 'Sin empresa'} &bull; Vence:{' '}
                          {format(new Date(contract.finalDate), 'dd/MM/yyyy', { locale: es })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Selector de AC receptor */}
              <Select
                label="Nuevo AC responsable"
                placeholder="Selecciona el administrador receptor"
                selectedKeys={targetAcId ? [targetAcId] : []}
                onSelectionChange={keys => {
                  const val = Array.from(keys)[0];
                  setTargetAcId(val?.toString() ?? '');
                }}
                isDisabled={availableAcs.length === 0}
              >
                {availableAcs.map(ac => (
                  <SelectItem key={ac.value}>
                    {ac.label}
                  </SelectItem>
                ))}
              </Select>

              {/* Motivo */}
              <Textarea
                label="Motivo"
                placeholder="Ej: Vacaciones anuales, licencia médica, término de contrato..."
                value={reason}
                onValueChange={setReason}
                minRows={2}
                maxRows={4}
              />

              {/* Fecha de retorno — solo modo temporal */}
              {mode === 'temporal' && (
                <div className="flex flex-col gap-1">
                  <label className="text-sm text-default-600 flex items-center gap-1">
                    <Calendar size={14} />
                    Fecha estimada de regreso{' '}
                    <span className="text-default-400 text-xs">(opcional — dejá vacío si no se sabe)</span>
                  </label>
                  <input
                    type="date"
                    value={returnDate}
                    onChange={e => setReturnDate(e.target.value)}
                    className="w-full rounded-lg border border-default-200 bg-default-50 px-3 py-2 text-sm focus:outline-none focus:border-primary"
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
              )}

              {/* Opción desactivar usuario — solo modo permanente */}
              {mode === 'permanente' && (
                <Checkbox
                  isSelected={deactivateUser}
                  onValueChange={setDeactivateUser}
                  color="danger"
                >
                  <span className="text-sm">Desactivar al usuario al completar el traspaso</span>
                </Checkbox>
              )}
            </>
          )}
        </ModalBody>

        <ModalFooter>
          <Button variant="light" onPress={onClose} isDisabled={isSubmitting}>
            Cancelar
          </Button>
          <Button
            color={mode === 'permanente' ? 'danger' : 'primary'}
            onPress={handleSubmit}
            isDisabled={!isValid || isLoading}
            isLoading={isSubmitting}
          >
            Traspasar {selectedIds.size > 0 ? `(${selectedIds.size})` : ''}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
