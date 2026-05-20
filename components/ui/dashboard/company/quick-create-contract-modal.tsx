'use client';

import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Spinner,
  Chip,
  Autocomplete,
  AutocompleteItem,
} from '@heroui/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useEffect, useState, useCallback } from 'react';
import { fetchCompanies } from '@/actions';
import { getContracts, createContract, getAdminContractors } from '@/actions/contract/contract-actions';
import { Contract } from '@/interfaces/contract.interface';
import { AdminContractor } from '@/interfaces/admin-contractor.interface';
import { Building2, Calendar, User, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

// ── Schema ───────────────────────────────────────────────────────────────────
const contractSchema = z.object({
  contractNumber: z.string().min(1, 'El número de contrato es requerido'),
  contractName: z.string().min(1, 'El nombre del contrato es requerido'),
  initialDate: z.string().min(1, 'La fecha de inicio es requerida'),
  finalDate: z.string().min(1, 'La fecha de término es requerida'),
  useracId: z.string().min(1, 'El administrador de contrato es requerido'),
});

type ContractFormValues = z.infer<typeof contractSchema>;

// ── Types ─────────────────────────────────────────────────────────────────────
interface CompanyOption {
  value: string;
  label: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function getContractStatus(contract: Contract): { label: string; color: 'success' | 'warning' | 'danger' } {
  if (contract.deletedAt) return { label: 'ELIMINADO', color: 'danger' };
  const now = new Date();
  const start = new Date(contract.initialDate);
  const end = new Date(contract.finalDate);
  if (now < start) return { label: 'POR INICIAR', color: 'warning' };
  if (now > end) return { label: 'FINALIZADO', color: 'danger' };
  return { label: 'ACTIVO', color: 'success' };
}

// ── Component ─────────────────────────────────────────────────────────────────
export function QuickCreateContractModal({ isOpen, onClose, onSuccess }: Props) {
  const [companies, setCompanies] = useState<CompanyOption[]>([]);
  const [loadingCompanies, setLoadingCompanies] = useState(false);
  const [selectedCompanyId, setSelectedCompanyId] = useState('');
  const [existingContracts, setExistingContracts] = useState<Contract[]>([]);
  const [loadingContracts, setLoadingContracts] = useState(false);
  const [adminContractors, setAdminContractors] = useState<AdminContractor[]>([]);
  const [isPending, setIsPending] = useState(false);

  const form = useForm<ContractFormValues>({
    resolver: zodResolver(contractSchema),
    defaultValues: {
      contractNumber: '',
      contractName: '',
      initialDate: '',
      finalDate: '',
      useracId: '',
    },
  });

  // Fecha inicio/fin watch para validación cruzada
  const initialDate = form.watch('initialDate');
  const finalDate = form.watch('finalDate');

  useEffect(() => {
    if (initialDate && finalDate && finalDate <= initialDate) {
      form.setError('finalDate', {
        type: 'manual',
        message: 'La fecha de término debe ser posterior a la de inicio',
      });
    } else {
      form.clearErrors('finalDate');
    }
  }, [initialDate, finalDate, form]);

  // Cargar empresas y AC al abrir
  useEffect(() => {
    if (!isOpen) return;
    setSelectedCompanyId('');
    setExistingContracts([]);
    form.reset();

    const loadInitial = async () => {
      setLoadingCompanies(true);
      const [companiesRes, acRes] = await Promise.all([
        fetchCompanies(),
        getAdminContractors(),
      ]);
      if (companiesRes.ok && companiesRes.companies) {
        setCompanies(companiesRes.companies.map(c => ({ value: c.value, label: c.label })));
      }
      if (acRes.success) {
        setAdminContractors(acRes.adminContractors ?? []);
      }
      setLoadingCompanies(false);
    };

    loadInitial();
  }, [isOpen, form]);

  // Cargar contratos existentes cuando cambia la empresa
  const loadContracts = useCallback(async (companyId: string) => {
    if (!companyId) { setExistingContracts([]); return; }
    setLoadingContracts(true);
    const res = await getContracts(companyId);
    setExistingContracts(res.contracts ?? []);
    setLoadingContracts(false);
  }, []);

  const handleSubmit = async (values: ContractFormValues) => {
    if (!selectedCompanyId) return;
    if (values.finalDate <= values.initialDate) {
      form.setError('finalDate', { type: 'manual', message: 'La fecha de término debe ser posterior a la de inicio' });
      return;
    }
    setIsPending(true);
    try {
      const result = await createContract({
        contractNumber: values.contractNumber,
        contractName: values.contractName,
        initialDate: new Date(values.initialDate),
        finalDate: new Date(values.finalDate),
        useracId: values.useracId,
        companyId: selectedCompanyId,
      });
      if (result.success) {
        onSuccess();
        onClose();
      } else {
        form.setError('root', { message: result.error ?? 'Error al crear el contrato' });
      }
    } finally {
      setIsPending(false);
    }
  };

  const selectedCompanyLabel = companies.find(c => c.value === selectedCompanyId)?.label ?? '';

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl" scrollBehavior="inside" backdrop="blur">
      <ModalContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)}>
            <ModalHeader className="flex items-center gap-2">
              <FileText size={20} />
              Nuevo Contrato
            </ModalHeader>

            <ModalBody className="gap-6">
              {/* ── Selector de empresa ────────────────────────────── */}
              <div className="space-y-1">
                <p className="text-sm font-medium text-default-700">Empresa *</p>
                {loadingCompanies ? (
                  <div className="flex items-center gap-2 text-sm text-default-500">
                    <Spinner size="sm" /> Cargando empresas...
                  </div>
                ) : (
                  <Autocomplete
                    placeholder="Buscar empresa..."
                    defaultItems={companies}
                    selectedKey={selectedCompanyId || null}
                    onSelectionChange={(key) => {
                      const id = key?.toString() ?? '';
                      setSelectedCompanyId(id);
                      loadContracts(id);
                    }}
                    aria-label="Empresa"
                    classNames={{ base: 'w-full' }}
                  >
                    {(item) => (
                      <AutocompleteItem key={item.value}>
                        {item.label}
                      </AutocompleteItem>
                    )}
                  </Autocomplete>
                )}
              </div>

              {/* ── Contratos existentes de la empresa ─────────────── */}
              {selectedCompanyId && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Building2 size={15} className="text-default-500" />
                    <p className="text-sm font-semibold text-default-700">
                      Contratos existentes de {selectedCompanyLabel}
                    </p>
                  </div>

                  {loadingContracts ? (
                    <div className="flex items-center gap-2 text-sm text-default-500 py-2">
                      <Spinner size="sm" /> Cargando contratos...
                    </div>
                  ) : existingContracts.length === 0 ? (
                    <p className="text-sm text-default-400 italic py-1">
                      Esta empresa no tiene contratos registrados.
                    </p>
                  ) : (
                    <div className="flex flex-col gap-1.5 max-h-48 overflow-y-auto pr-1">
                      {existingContracts.map(c => {
                        const status = getContractStatus(c);
                        return (
                          <div
                            key={c.id}
                            className="flex items-start justify-between gap-2 rounded-lg border border-default-200 bg-default-50 dark:bg-default-100/10 px-3 py-2"
                          >
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{c.contractName}</p>
                              <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-0.5">
                                <span className="text-xs text-default-500 flex items-center gap-1">
                                  <FileText size={11} /> N° {c.contractNumber}
                                </span>
                                {c.userAc && (
                                  <span className="text-xs text-default-500 flex items-center gap-1">
                                    <User size={11} /> {c.userAc.displayName}
                                  </span>
                                )}
                                <span className="text-xs text-default-500 flex items-center gap-1">
                                  <Calendar size={11} />
                                  {format(new Date(c.initialDate), 'dd/MM/yyyy')} – {format(new Date(c.finalDate), 'dd/MM/yyyy')}
                                </span>
                              </div>
                            </div>
                            <Chip size="sm" color={status.color} variant="flat" className="shrink-0">
                              {status.label}
                            </Chip>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* ── Formulario de nuevo contrato ────────────────────── */}
              {selectedCompanyId && (
                <div className="space-y-4 border-t border-default-200 pt-4">
                  <p className="text-sm font-semibold text-default-700">Datos del nuevo contrato</p>

                  {/* Número y Nombre */}
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      name="contractNumber"
                      control={form.control}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Número de Contrato</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Ej: CONT-2025-001" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      name="contractName"
                      control={form.control}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nombre del Contrato</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Ej: Servicios de Mantención" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Fechas */}
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      name="initialDate"
                      control={form.control}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Fecha Inicio</FormLabel>
                          <FormControl>
                            <input
                              type="date"
                              {...field}
                              className={cn(
                                'flex h-10 w-full rounded-md border px-3 py-2 text-sm',
                                'bg-white dark:bg-gray-900',
                                'border-gray-300 dark:border-gray-700',
                                'hover:bg-gray-50 dark:hover:bg-gray-800',
                                'focus:outline-none focus:ring-2 focus:ring-ring',
                                form.formState.errors.initialDate && 'border-destructive'
                              )}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      name="finalDate"
                      control={form.control}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Fecha Término</FormLabel>
                          <FormControl>
                            <input
                              type="date"
                              {...field}
                              className={cn(
                                'flex h-10 w-full rounded-md border px-3 py-2 text-sm',
                                'bg-white dark:bg-gray-900',
                                'border-gray-300 dark:border-gray-700',
                                'hover:bg-gray-50 dark:hover:bg-gray-800',
                                'focus:outline-none focus:ring-2 focus:ring-ring',
                                form.formState.errors.finalDate && 'border-destructive'
                              )}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Admin Contrato */}
                  <FormField
                    name="useracId"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Administrador de Contrato</FormLabel>
                        <FormControl>
                          <select
                            {...field}
                            className={cn(
                              'flex h-10 w-full rounded-md border px-3 py-2 text-sm',
                              'disabled:cursor-not-allowed disabled:opacity-50',
                              'bg-white dark:bg-gray-900',
                              'border border-gray-300 dark:border-gray-700',
                              'text-gray-900 dark:text-gray-100',
                              'hover:bg-gray-50 dark:hover:bg-gray-800',
                              form.formState.errors.useracId && 'border-destructive'
                            )}
                          >
                            <option value="">Seleccione un administrador</option>
                            {adminContractors.map(admin => (
                              <option key={admin.value} value={admin.value}>
                                {admin.label} ({admin.description})
                              </option>
                            ))}
                          </select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {form.formState.errors.root && (
                    <p className="text-sm text-destructive">{form.formState.errors.root.message}</p>
                  )}
                </div>
              )}
            </ModalBody>

            <ModalFooter>
              <Button type="button" variant="ghost" onPress={onClose}>
                Cancelar
              </Button>
              <Button
                type="submit"
                color="primary"
                isDisabled={!selectedCompanyId || isPending}
                isLoading={isPending}
              >
                Crear Contrato
              </Button>
            </ModalFooter>
          </form>
        </Form>
      </ModalContent>
    </Modal>
  );
}
