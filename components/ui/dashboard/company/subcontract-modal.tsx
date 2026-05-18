'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Select,
  SelectItem,
  Chip,
  Spinner,
} from '@heroui/react';
import { Building2, User, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import { Contract } from '@/interfaces/contract.interface';

interface SubcompanyOption {
  id: string;
  name: string | null;
  rut: string;
  linkedContractIds: string[];
  activeUsers: { id: string; name: string | null; alias: string | null; email: string; phone: string | null }[];
}

interface SubcontractModalProps {
  isOpen: boolean;
  onClose: () => void;
  contract: Contract;
  onSuccess: () => void;
}

type FlowType = null | 'A' | 'B';
type StepA = 'select-company' | 'select-user' | 'confirm';
type StepB = 'form' | 'confirm';

export function SubcontractModal({
  isOpen,
  onClose,
  contract,
  onSuccess,
}: SubcontractModalProps) {
  const [flow, setFlow] = useState<FlowType>(null);

  // Flujo A
  const [stepA, setStepA] = useState<StepA>('select-company');
  const [companies, setCompanies] = useState<SubcompanyOption[]>([]);
  const [loadingCompanies, setLoadingCompanies] = useState(false);
  const [loadCompaniesError, setLoadCompaniesError] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [selectedCompanyId, setSelectedCompanyId] = useState('');
  const [selectedUserId, setSelectedUserId] = useState('');

  // Flujo B
  const [stepB, setStepB] = useState<StepB>('form');
  const [noDataMode, setNoDataMode] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [companyRut, setCompanyRut] = useState('');
  const [companyCity, setCompanyCity] = useState('');
  const [repEmail, setRepEmail] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const loadCompanies = useCallback(async () => {
    setLoadingCompanies(true);
    setLoadCompaniesError(false);
    try {
      const [companiesRes, linkedRes] = await Promise.all([
        fetch('/api/subcontracts/companies-for-linking'),
        fetch(`/api/subcontracts?contractId=${contract.id}`),
      ]);
      const companiesData: SubcompanyOption[] = await companiesRes.json();
      const linkedData: { subCompanyId: string }[] = await linkedRes.json();
      const linkedIds = new Set(linkedData.map(s => s.subCompanyId));
      setCompanies(companiesData.map(c => ({
        ...c,
        linkedContractIds: linkedIds.has(c.id) ? [contract.id] : [],
      })));
    } catch {
      setLoadCompaniesError(true);
    } finally {
      setLoadingCompanies(false);
    }
  }, [contract.id]);

  useEffect(() => {
    if (isOpen && flow === 'A') {
      loadCompanies();
    }
  }, [isOpen, flow, loadCompanies]);

  const reset = () => {
    setFlow(null);
    setStepA('select-company');
    setStepB('form');
    setNoDataMode(false);
    setSelectedCompanyId('');
    setSelectedUserId('');
    setCompanyName('');
    setCompanyRut('');
    setCompanyCity('');
    setRepEmail('');
    setError('');
    setSuccess(false);
    setIsSubmitting(false);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const selectedCompany = companies.find(c => c.id === selectedCompanyId);
  const isLinked = selectedCompany?.linkedContractIds.includes(contract.id) ?? false;

  // --- Flujo A Submit ---
  const handleSubmitA = async () => {
    setIsSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/subcontracts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contractId: contract.id, subCompanyId: selectedCompanyId, userId: selectedUserId || undefined }),
      });
      if (!res.ok) {
        const text = await res.text();
        setError(text);
        return;
      }
      setSuccess(true);
      setTimeout(() => {
        onSuccess();
        handleClose();
      }, 1500);
    } catch {
      setError('Error al vincular la empresa');
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Flujo B Submit ---
  const handleSubmitB = async () => {
    setIsSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/subcontracts/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contractId: contract.id,
          companyName,
          companyRut,
          companyCity: companyCity || undefined,
          repEmail,
        }),
      });
      if (!res.ok) {
        const text = await res.text();
        setError(text);
        return;
      }
      setSuccess(true);
      setTimeout(() => {
        onSuccess();
        handleClose();
      }, 1500);
    } catch {
      setError('Error al enviar la solicitud');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTitle = () => {
    if (flow === null) return 'Vincular Sub-empresa';
    if (flow === 'A') {
      if (stepA === 'select-company') return 'Seleccionar Empresa';
      if (stepA === 'select-user') return 'Seleccionar Representante';
      return 'Confirmar Vinculación';
    }
    if (stepB === 'form') return 'Datos de Nueva Empresa';
    return 'Confirmar Solicitud';
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size="2xl"
      scrollBehavior="inside"
    >
      <ModalContent>
        <ModalHeader className="flex items-center gap-2">
          {flow !== null && (
            <button
              onClick={() => {
                if (flow === 'A') {
                  if (stepA === 'confirm') setStepA(selectedCompany && selectedCompany.activeUsers.length > 1 ? 'select-user' : 'select-company');
                  else if (stepA === 'select-user') setStepA('select-company');
                  else setFlow(null);
                } else {
                  if (stepB === 'confirm') setStepB('form');
                  else setFlow(null);
                }
              }}
              className="text-default-400 hover:text-default-600 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
          )}
          <span>{getTitle()}</span>
        </ModalHeader>

        <ModalBody>
          {success ? (
            <div className="flex flex-col items-center justify-center py-8 gap-3">
              <CheckCircle className="h-12 w-12 text-success" />
              <p className="text-lg font-semibold text-center">
                {flow === 'A' ? '¡Empresa vinculada exitosamente!' : '¡Solicitud enviada! El administrador revisará la solicitud.'}
              </p>
            </div>
          ) : (
            <>
              {/* Contrato de referencia */}
              <div className="p-3 bg-default-100 rounded-lg mb-4 text-sm">
                <p className="font-medium">{contract.contractName}</p>
                <p className="text-default-500">N° {contract.contractNumber}</p>
              </div>

              {/* Selector de flujo */}
              {flow === null && (
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setFlow('A')}
                    className="flex flex-col items-center gap-3 p-6 rounded-xl border-2 border-default-200 hover:border-primary hover:bg-primary/5 transition-all text-left"
                  >
                    <Building2 className="h-8 w-8 text-primary" />
                    <div>
                      <p className="font-semibold">Empresa Existente</p>
                      <p className="text-xs text-default-500 mt-1">Vincular una empresa que ya está registrada en el sistema</p>
                    </div>
                  </button>
                  <button
                    onClick={() => setFlow('B')}
                    className="flex flex-col items-center gap-3 p-6 rounded-xl border-2 border-default-200 hover:border-secondary hover:bg-secondary/5 transition-all text-left"
                  >
                    <User className="h-8 w-8 text-secondary" />
                    <div>
                      <p className="font-semibold">Nueva Empresa</p>
                      <p className="text-xs text-default-500 mt-1">Registrar una empresa nueva (requiere aprobación del administrador)</p>
                    </div>
                  </button>
                </div>
              )}

              {/* Flujo A: Seleccionar empresa */}
              {flow === 'A' && stepA === 'select-company' && (
                <div className="space-y-4">
                  {loadingCompanies ? (
                    <div className="flex justify-center py-8"><Spinner /></div>
                  ) : loadCompaniesError ? (
                    <div className="flex flex-col items-center gap-3 py-8 text-center">
                      <p className="text-sm text-danger-600">No se pudieron cargar las empresas.</p>
                      <button
                        onClick={loadCompanies}
                        className="px-4 py-2 text-sm font-medium rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors"
                      >
                        Reintentar
                      </button>
                    </div>
                  ) : (
                    <Select
                      label="Seleccionar empresa"
                      placeholder="Buscar por nombre o RUT..."
                      selectedKeys={selectedCompanyId ? new Set([selectedCompanyId]) : new Set()}
                      onSelectionChange={(keys) => {
                        const val = Array.from(keys)[0] as string;
                        setSelectedCompanyId(val || '');
                        setSelectedUserId('');
                      }}
                    >
                      {companies
                        .filter(c => !c.linkedContractIds.includes(contract.id) || c.id === selectedCompanyId)
                        .map((c) => (
                          <SelectItem
                            key={c.id}
                            textValue={`${c.name ?? ''} ${c.rut}`}
                          >
                            <div className="flex items-center justify-between w-full">
                              <div>
                                <p className="font-medium">{c.name ?? 'Sin nombre'}</p>
                                <p className="text-xs text-default-500">{c.rut}</p>
                              </div>
                              {c.linkedContractIds.includes(contract.id) && (
                                <Chip size="sm" color="warning" variant="flat">Ya vinculada</Chip>
                              )}
                            </div>
                          </SelectItem>
                        ))}
                    </Select>
                  )}

                  {selectedCompany && !isLinked && selectedCompany.activeUsers.length === 0 && (
                    <div className="space-y-3">
                      <div className="p-4 bg-warning-50 border border-warning-200 rounded-xl text-sm space-y-2">
                        <p className="font-semibold text-warning-800 flex items-center gap-2">
                          <AlertCircle className="h-4 w-4 shrink-0" />
                          Esta empresa no tiene usuarios activos en el sistema
                        </p>
                        <p className="text-warning-700">
                          Para poder vincularla a este contrato, debe haber al menos un usuario registrado y aprobado que pueda gestionar las solicitudes de acreditación.
                        </p>
                      </div>
                      <div className="p-4 bg-default-50 border border-default-200 rounded-xl text-sm space-y-3">
                        <p className="font-medium text-default-700">¿Qué hacer?</p>
                        <ol className="list-decimal list-inside space-y-1 text-default-600 text-xs">
                          <li>Comparte el link de pre-registro con el representante de la sub-empresa.</li>
                          <li>Él completa el formulario con sus datos y los de su empresa.</li>
                          <li>El administrador del sistema aprueba la cuenta.</li>
                          <li>Vuelve aquí, actualiza la lista y podrás continuar con la vinculación.</li>
                        </ol>
                        <div className="flex items-center gap-2 mt-2">
                          <input
                            readOnly
                            value={`${typeof window !== 'undefined' ? window.location.origin : ''}/pre-register`}
                            className="flex-1 text-xs px-3 py-2 rounded-lg border border-default-200 bg-white text-default-600 font-mono"
                          />
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(`${window.location.origin}/pre-register`);
                              setCopiedLink(true);
                              setTimeout(() => setCopiedLink(false), 2000);
                            }}
                            className="px-3 py-2 text-xs font-medium rounded-lg bg-default-200 hover:bg-default-300 transition-colors whitespace-nowrap"
                          >
                            {copiedLink ? '✓ Copiado' : 'Copiar link'}
                          </button>
                        </div>
                        <button
                          onClick={loadCompanies}
                          disabled={loadingCompanies}
                          className="w-full text-xs font-medium px-3 py-2 rounded-lg border border-primary text-primary hover:bg-primary/5 transition-colors disabled:opacity-50"
                        >
                          {loadingCompanies ? 'Actualizando...' : '↻ Actualizar lista de usuarios'}
                        </button>
                      </div>
                    </div>
                  )}

                  {selectedCompany && !isLinked && selectedCompany.activeUsers.length > 0 && (
                    <div className="p-3 bg-default-50 rounded-lg text-sm space-y-1">
                      <p className="font-medium">{selectedCompany.name ?? 'Sin nombre'}</p>
                      <p className="text-default-500">RUT: {selectedCompany.rut}</p>
                      <p className="text-default-500">
                        Usuarios activos: {selectedCompany.activeUsers.length}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Flujo A: Seleccionar usuario */}
              {flow === 'A' && stepA === 'select-user' && selectedCompany && (
                <div className="space-y-4">
                  <p className="text-sm text-default-600">
                    {selectedCompany.activeUsers.length === 1
                      ? <>¿Es <strong>{selectedCompany.activeUsers[0].alias ?? selectedCompany.activeUsers[0].name}</strong> el representante que gestionará las solicitudes de este contrato?</>
                      : <>La empresa <strong>{selectedCompany.name}</strong> tiene múltiples usuarios activos. Selecciona el representante que gestionará las solicitudes de este contrato:</>
                    }
                  </p>
                  <div className="space-y-2">
                    {selectedCompany.activeUsers.map(u => (
                      <button
                        key={u.id}
                        onClick={() => setSelectedUserId(u.id)}
                        className={`w-full flex items-center gap-3 p-3 rounded-lg border-2 transition-all text-left ${selectedUserId === u.id ? 'border-primary bg-primary/5' : 'border-default-200 hover:border-default-400'}`}
                      >
                        <User className="h-5 w-5 text-default-400 shrink-0" />
                        <div>
                          <p className="font-medium text-sm">{u.alias ?? u.name ?? 'Sin nombre'}</p>
                        </div>
                        {selectedUserId === u.id && <CheckCircle className="h-5 w-5 text-primary ml-auto" />}
                      </button>
                    ))}
                    <button
                      onClick={() => setSelectedUserId('none')}
                      className={`w-full flex items-center gap-3 p-3 rounded-lg border-2 transition-all text-left ${selectedUserId === 'none' ? 'border-warning bg-warning/5' : 'border-default-200 hover:border-default-400'}`}
                    >
                      <AlertCircle className="h-5 w-5 text-warning shrink-0" />
                      <div>
                        <p className="font-medium text-sm">El representante no está en esta lista</p>
                        <p className="text-xs text-default-500">Aún no tiene usuario activo en el sistema</p>
                      </div>
                      {selectedUserId === 'none' && <CheckCircle className="h-5 w-5 text-warning ml-auto" />}
                    </button>
                  </div>

                  {/* Panel de advertencia cuando el representante no existe */}
                  {selectedUserId === 'none' && (
                    <div className="space-y-3">
                      <div className="p-4 bg-warning-50 border border-warning-200 rounded-xl text-sm space-y-2">
                        <p className="font-semibold text-warning-800 flex items-center gap-2">
                          <AlertCircle className="h-4 w-4 shrink-0" />
                          El representante debe estar registrado en el sistema
                        </p>
                        <p className="text-warning-700">
                          Para vincular esta empresa al contrato, el representante debe tener una cuenta activa y aprobada por el administrador.
                        </p>
                      </div>
                      <div className="p-4 bg-default-50 border border-default-200 rounded-xl text-sm space-y-3">
                        <p className="font-medium text-default-700">¿Qué hacer?</p>
                        <ol className="list-decimal list-inside space-y-1 text-default-600 text-xs">
                          <li>Comparte el link de pre-registro con el representante de la sub-empresa.</li>
                          <li>Él completa el formulario con sus datos y los de su empresa.</li>
                          <li>El administrador del sistema aprueba la cuenta.</li>
                          <li>Vuelve aquí, actualiza la lista y el representante aparecerá para seleccionar.</li>
                        </ol>
                        <div className="flex items-center gap-2 mt-2">
                          <input
                            readOnly
                            value={`${typeof window !== 'undefined' ? window.location.origin : ''}/pre-register`}
                            className="flex-1 text-xs px-3 py-2 rounded-lg border border-default-200 bg-white dark:text-gray-800 text-default-600 font-mono"
                          />
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(`${window.location.origin}/pre-register`);
                              setCopiedLink(true);
                              setTimeout(() => setCopiedLink(false), 2000);
                            }}
                            className="px-3 py-2 text-xs font-medium rounded-lg bg-default-200 hover:bg-default-300 transition-colors whitespace-nowrap"
                          >
                            {copiedLink ? '✓ Copiado' : 'Copiar link'}
                          </button>
                        </div>
                        <button
                          onClick={loadCompanies}
                          disabled={loadingCompanies}
                          className="w-full text-xs font-medium px-3 py-2 rounded-lg border border-primary text-primary hover:bg-primary/5 transition-colors disabled:opacity-50"
                        >
                          {loadingCompanies ? 'Actualizando...' : '↻ Actualizar lista de usuarios'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Flujo A: Confirmar */}
              {flow === 'A' && stepA === 'confirm' && selectedCompany && (
                <div className="space-y-4">
                  <p className="text-sm text-default-600">Confirma los datos de la vinculación:</p>
                  <div className="divide-y divide-default-100">
                    <div className="py-3">
                      <p className="text-xs text-default-400 uppercase tracking-wide mb-1">Empresa a vincular</p>
                      <p className="font-semibold">{selectedCompany.name ?? 'Sin nombre'}</p>
                      <p className="text-sm text-default-500">RUT: {selectedCompany.rut}</p>
                    </div>
                    <div className="py-3">
                      <p className="text-xs text-default-400 uppercase tracking-wide mb-1">Contrato</p>
                      <p className="font-semibold">{contract.contractName}</p>
                      <p className="text-sm text-default-500">N° {contract.contractNumber}</p>
                    </div>
                    {selectedUserId && selectedUserId !== 'none' && (
                      <div className="py-3">
                        <p className="text-xs text-default-400 uppercase tracking-wide mb-1">Representante</p>
                        {(() => {
                          const u = selectedCompany.activeUsers.find(u => u.id === selectedUserId);
                          return u ? (
                            <>
                              <p className="font-semibold">{u.alias ?? u.name}</p>
                            </>
                          ) : null;
                        })()}
                      </div>
                    )}
                  </div>
                  <div className="p-3 bg-success-50 rounded-lg text-sm text-success-700">
                    La vinculación será activa de inmediato.
                  </div>
                </div>
              )}

              {/* Flujo B: Formulario */}
              {flow === 'B' && stepB === 'form' && (
                <div className="space-y-4">
                  {/* Opción: no tengo los datos */}
                  {!noDataMode ? (
                    <>
                      <div className="p-3 bg-primary-50 border border-primary-200 rounded-xl text-sm">
                        <p className="text-primary-700">Completa los datos de la nueva empresa y el email del representante. Se le enviará una invitación para que complete su registro.</p>
                      </div>
                      <p className="text-sm font-medium text-default-600">Datos de la empresa</p>
                      <Input label="Nombre de la empresa" value={companyName} onValueChange={setCompanyName} isRequired />
                      <Input label="RUT de la empresa" placeholder="12345678-9" value={companyRut} onValueChange={setCompanyRut} isRequired />
                      <Input label="Ciudad (opcional)" value={companyCity} onValueChange={setCompanyCity} />
                      <p className="text-sm font-medium text-default-600 pt-2">Representante</p>
                      <Input label="Email del representante" type="email" description="Se le enviará un correo con el link para completar su registro" value={repEmail} onValueChange={setRepEmail} isRequired />
                      <div className="p-3 bg-warning-50 rounded-lg text-sm text-warning-700">
                        Esta solicitud será revisada por el administrador del sistema antes de activarse.
                      </div>
                      <button
                        onClick={() => setNoDataMode(true)}
                        className="text-xs text-default-400 hover:text-default-600 underline w-full text-center pt-1"
                      >
                        No tengo los datos de la empresa aún
                      </button>
                    </>
                  ) : (
                    <div className="space-y-3">
                      <div className="p-4 bg-warning-50 border border-warning-200 rounded-xl text-sm space-y-2">
                        <p className="font-semibold text-warning-800 flex items-center gap-2">
                          <AlertCircle className="h-4 w-4 shrink-0" />
                          Necesitas los datos de la empresa para continuar
                        </p>
                        <p className="text-warning-700">
                          Para solicitar la incorporación de una nueva empresa, necesitas al menos el nombre, RUT y el email del representante.
                        </p>
                      </div>
                      <div className="p-4 bg-default-50 border border-default-200 rounded-xl text-sm space-y-3">
                        <p className="font-medium text-default-700">¿Qué hacer?</p>
                        <ol className="list-decimal list-inside space-y-1 text-default-600 text-xs">
                          <li>Solicita a tu contacto en la empresa sub-contratista que se registre directamente.</li>
                          <li>Compártele el link de pre-registro.</li>
                          <li>El administrador del sistema aprobará la cuenta.</li>
                          <li>Una vez aprobada, podrás vincularla desde <strong>Empresa Existente</strong>.</li>
                        </ol>
                        <div className="flex items-center gap-2 mt-2">
                          <input
                            readOnly
                            value={`${typeof window !== 'undefined' ? window.location.origin : ''}/pre-register`}
                            className="flex-1 text-xs px-3 py-2 rounded-lg border border-default-200 bg-white text-default-600 font-mono dark:text-gray-800"
                          />
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(`${window.location.origin}/pre-register`);
                              setCopiedLink(true);
                              setTimeout(() => setCopiedLink(false), 2000);
                            }}
                            className="px-3 py-2 text-xs font-medium rounded-lg bg-default-200 hover:bg-default-300 transition-colors whitespace-nowrap"
                          >
                            {copiedLink ? '✓ Copiado' : 'Copiar link'}
                          </button>
                        </div>
                      </div>
                      <button
                        onClick={() => setNoDataMode(false)}
                        className="text-xs text-primary hover:underline w-full text-center"
                      >
                        Ya tengo los datos, volver al formulario
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Flujo B: Confirmar */}
              {flow === 'B' && stepB === 'confirm' && (
                <div className="space-y-4">
                  <p className="text-sm text-default-600">Confirma los datos antes de enviar:</p>
                  <div className="divide-y divide-default-100">
                    <div className="py-3">
                      <p className="text-xs text-default-400 uppercase tracking-wide mb-1">Nueva empresa</p>
                      <p className="font-semibold">{companyName}</p>
                      <p className="text-sm text-default-500">RUT: {companyRut}</p>
                      {companyCity && <p className="text-sm text-default-500">Ciudad: {companyCity}</p>}
                    </div>
                    <div className="py-3">
                      <p className="text-xs text-default-400 uppercase tracking-wide mb-1">Representante</p>
                      <p className="text-sm text-default-500">{repEmail}</p>
                    </div>
                    <div className="py-3">
                      <p className="text-xs text-default-400 uppercase tracking-wide mb-1">Contrato</p>
                      <p className="font-semibold">{contract.contractName}</p>
                      <p className="text-sm text-default-500">N° {contract.contractNumber}</p>
                    </div>
                  </div>
                  <div className="p-3 bg-warning-50 rounded-lg text-sm text-warning-700">
                    Se enviará una invitación al representante para que complete su registro. El administrador revisará y activará la cuenta.
                  </div>
                </div>
              )}

              {error && (
                <div className="mt-2 p-3 bg-danger-50 rounded-lg text-sm text-danger-600">
                  {error}
                </div>
              )}
            </>
          )}
        </ModalBody>

        <ModalFooter>
          <Button variant="flat" onPress={handleClose} isDisabled={isSubmitting}>
            Cancelar
          </Button>

          {/* Botón Volver entre pasos */}
          {flow === 'A' && stepA === 'select-user' && (
            <Button variant="flat" onPress={() => setStepA('select-company')} isDisabled={isSubmitting}>
              ← Volver
            </Button>
          )}
          {flow === 'A' && stepA === 'confirm' && (
            <Button variant="flat" onPress={() => setStepA('select-user')} isDisabled={isSubmitting}>
              ← Volver
            </Button>
          )}
          {flow === 'B' && stepB === 'confirm' && (
            <Button variant="flat" onPress={() => setStepB('form')} isDisabled={isSubmitting}>
              ← Volver
            </Button>
          )}

          {/* Botón siguiente Flujo A */}
          {flow === 'A' && stepA === 'select-company' && (
            <Button
              color="primary"
              isDisabled={!selectedCompanyId || isLinked || (selectedCompany?.activeUsers.length === 0)}
              onPress={() => {
                if (!selectedCompany) return;
                setStepA('select-user');
              }}
            >
              Siguiente
            </Button>
          )}
          {flow === 'A' && stepA === 'select-user' && (
            <Button
              color="primary"
              isDisabled={!selectedUserId || selectedUserId === 'none'}
              onPress={() => setStepA('confirm')}
            >
              Siguiente
            </Button>
          )}
          {flow === 'A' && stepA === 'confirm' && (
            <Button
              color="primary"
              isLoading={isSubmitting}
              onPress={handleSubmitA}
            >
              Confirmar Vinculación
            </Button>
          )}

          {/* Botón siguiente Flujo B */}
          {flow === 'B' && stepB === 'form' && !noDataMode && (
            <Button
              color="secondary"
              isDisabled={!companyName || !companyRut || !repEmail}
              onPress={() => setStepB('confirm')}
            >
              Revisar
            </Button>
          )}
          {flow === 'B' && stepB === 'confirm' && (
            <Button
              color="secondary"
              isLoading={isSubmitting}
              onPress={handleSubmitB}
            >
              Enviar Solicitud
            </Button>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
