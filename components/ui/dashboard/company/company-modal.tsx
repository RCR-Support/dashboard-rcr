import { CompanySelect } from '@/interfaces/company.interface';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from '@heroui/modal';
import { Button } from '@heroui/react';
import { useRouter } from 'next/navigation';
import { useCompanyStore } from '@/store/ui/useCompanyStore';
import { Phone, Globe, MapPin, Pencil, Trash, Building2, Link2 } from 'lucide-react';
import { formatPhoneNumber } from '@/lib/formatPhoneNumber';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { IoClose } from 'react-icons/io5';
import { usePermissions } from '@/hooks/usePermissions';
import { useSession } from 'next-auth/react';
import { deleteCompany } from '@/actions/company/company-actions';
import { useState } from 'react';

interface CompanyModalProps {
  isOpen: boolean;
  onClose: () => void;
  company: CompanySelect | null;
}

export const CompanyModal = ({
  isOpen,
  onClose,
  company,
}: CompanyModalProps) => {
  const router = useRouter();
  const setEditingCompany = useCompanyStore(state => state.setEditingCompany);
  const { can } = usePermissions();
  const { data: session } = useSession();

  // Verificar permisos de edición
  const canEditAny = can('companies:edit:any');
  const canEditOwn = can('companies:edit:own');
  
  // Si puede editar solo las propias, verificar ownership
  const userCompanyId = session?.user?.companyId;
  const canEditThisCompany = canEditAny || (canEditOwn && company?.value === userCompanyId);

  // Solo admin puede eliminar
  const canDelete = can('companies:delete');
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleEdit = () => {
    if (company && canEditThisCompany) {
      setEditingCompany(company);
      onClose();
      router.push(`/dashboard/companies/edit/${company.value}`);
    }
  };

  const handleDelete = async () => {
    if (!company) return;
    setDeleteError(null);
    const confirmed = window.confirm(
      `¿Estás seguro de eliminar la empresa "${company.label.split(' (')[0]}"?`
    );
    if (!confirmed) return;
    setIsDeleting(true);
    try {
      const result = await deleteCompany(company.value);
      if (result.error) {
        setDeleteError(result.error);
      } else {
        onClose();
        router.refresh();
      }
    } catch {
      setDeleteError('Error al eliminar la empresa');
    } finally {
      setIsDeleting(false);
    }
  };
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      backdrop="blur"
      scrollBehavior="inside"
    >
      <ModalContent>
        <ModalHeader className="flex flex-col">
          Información de la empresa
          <span className="text-[#03c9d7] text-xs font-semibold">
            {company?.label.split(' (')[0]}
          </span>
        </ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <p className="flex justify-start items-center gap-2">
              <span className="font-semibold">RUT:</span>
              <span className="truncate text-ellipsis max-w-[360px]">
                {company?.label.split('(')[1]?.replace(')', '')}
              </span>
            </p>
            {company?.description.split(' | ').map((info, index) => {
              let icon = null;
              let label = '';
              let value = info;

              if (info.includes('📞')) {
                icon = <Phone className="h-4 w-4" />;
                label = 'Teléfono:';
                value = formatPhoneNumber(info.replace('📞', '').trim());
              } else if (info.includes('🌐')) {
                icon = <Globe className="h-4 w-4" />;
                label = 'URL:';
                value = info.replace('🌐', '').trim();
              } else if (info.includes('📍')) {
                icon = <MapPin className="h-4 w-4" />;
                label = 'Ciudad:';
                value = info.replace('📍', '').trim();
              }

              if (value) {
                const isUrl = info.includes('🌐');
                return (
                  <p
                    key={index}
                    className="flex justify-start items-center gap-2"
                  >
                    {icon}
                    <span className="font-semibold">{label}</span>
                    {isUrl ? (
                      <a
                        href={/^https?:\/\//i.test(value) ? value : `https://${value}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="truncate text-ellipsis max-w-[360px] text-cyan-500 hover:underline"
                      >
                        {value}
                      </a>
                    ) : (
                      <span className="truncate text-ellipsis max-w-[360px]">
                        {value}
                      </span>
                    )}
                  </p>
                );
              }
              return null;
            })}

            {company?.users && company.users.length > 0 && (
              <>
                <div className="border-t border-gray-200 dark:border-gray-700 my-4"></div>
                <div>
                  <h4 className="font-medium mb-3">Usuarios asociados</h4>
                  <div className="space-y-3">
                    {company.users.map(user => (
                      <div
                        key={user.id}
                        className="bg-gray-100 dark:bg-gray-800 p-2 rounded-lg"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-sm">
                              {user.displayName}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {user.email}
                            </p>
                          </div>
                          <div className="text-xs bg-primary/10 px-2 py-1 rounded-full">
                            {user.roles.map(r => r.role.name).join(', ')}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Sección: Esta empresa es sub-empresa de... */}
            {company?.asSubcontractor && company.asSubcontractor.length > 0 && (
              <>
                <div className="border-t border-cyan-200 dark:border-cyan-800 my-4" />
                <div>
                  <h4 className="font-medium mb-3 flex items-center gap-2 text-cyan-700 dark:text-cyan-400">
                    <Link2 className="h-4 w-4" />
                    Participa como subcontratista en
                    <span className="text-xs bg-cyan-100 dark:bg-cyan-900/40 px-2 py-0.5 rounded-full">
                      {company.asSubcontractor.length}
                    </span>
                  </h4>
                  <div className="space-y-2">
                    {company.asSubcontractor.map(sc => (
                      <div key={sc.contractId} className="bg-cyan-50 dark:bg-cyan-900/20 border border-cyan-200 dark:border-cyan-800 p-2 rounded-lg">
                        <p className="font-semibold text-sm text-cyan-800 dark:text-cyan-200">{sc.contractName}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">N° {sc.contractNumber}</p>
                        {sc.mandanteName && (
                          <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-1">
                            <Building2 size={11} />
                            Empresa mandante: <span className="font-semibold text-slate-700 dark:text-slate-300">{sc.mandanteName}</span>
                          </p>
                        )}
                        <span className="inline-block mt-1 text-xs px-2 py-0.5 rounded-full bg-cyan-200 dark:bg-cyan-800 text-cyan-800 dark:text-cyan-200">
                          {sc.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Sección de Contratos */}
            {company?.contracts && company.contracts.length > 0 && (
              <>
                <div className="border-t border-gray-200 dark:border-gray-700 my-4"></div>
                <div>
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    Contratos (mandante)
                    <span className="text-xs bg-primary/10 px-2 py-1 rounded-full text-amber-500 dark:text-amber-300">
                      {company.contracts.length}
                    </span>
                  </h4>
                  <div className="space-y-3">
                    {company.contracts.map(contract => (
                      <div
                        key={contract.id}
                        className="bg-gray-100 dark:bg-gray-800 p-2 rounded-lg"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <p className="font-semibold uppercase text-sm dark:text-amber-100">
                              {contract.contractName}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              N° de contrato:{' '}
                              <span className="font-semibold text-amber-400 dark:text-amber-100">
                                {contract.contractNumber}
                              </span>
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Inicio:{' '}
                              <span className="font-semibold text-amber-400 dark:text-amber-100">
                                {format(new Date(contract.initialDate), 'dd MMM yyyy', { locale: es })}
                              </span>
                              {' — '}
                              Fin:{' '}
                              <span className="font-semibold text-amber-400 dark:text-amber-100">
                                {format(new Date(contract.finalDate), 'dd MMM yyyy', { locale: es })}
                              </span>
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Administrador:{' '}
                              <span className="font-semibold text-amber-400 dark:text-amber-100">
                                {contract.userAc?.displayName || 'Sin administrador'}
                              </span>
                            </p>
                            {/* Sub-empresas vinculadas a este contrato */}
                            {contract.subcompanies && contract.subcompanies.length > 0 && (
                              <div className="mt-2 pl-2 border-l-2 border-cyan-300 dark:border-cyan-700">
                                <p className="text-xs font-semibold text-cyan-600 dark:text-cyan-400 mb-1 flex items-center gap-1">
                                  <Link2 size={11} />
                                  Sub-empresas contratistas ({contract.subcompanies.length})
                                </p>
                                {contract.subcompanies.map(sub => (
                                  <div key={sub.id} className="flex flex-col text-xs text-slate-600 dark:text-slate-300 py-0.5 gap-0.5">
                                    <div className="flex items-center justify-between">
                                      <span className="flex items-center gap-1">
                                        <Building2 size={11} className="text-cyan-500" />
                                        {sub.name ?? sub.rut}
                                      </span>
                                      <span className="px-1.5 py-0.5 rounded-full bg-cyan-100 dark:bg-cyan-900/40 text-cyan-700 dark:text-cyan-300">
                                        {sub.status}
                                      </span>
                                    </div>
                                    <span className="text-[10px] text-slate-400 dark:text-slate-500 pl-4">
                                      Rep: {sub.representativeName ?? <span className="italic">Sin representante asignado</span>}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </ModalBody>
        <ModalFooter className="flex flex-col gap-2">
          {deleteError && (
            <div className="w-full text-sm text-danger bg-danger-50 dark:bg-danger-950/20 px-3 py-2 rounded-lg">
              {deleteError}
            </div>
          )}
          <div className="flex justify-between items-center w-full">
            <div className="flex gap-4">
              {canDelete && (
                <Button
                  color="danger"
                  variant="flat"
                  onPress={handleDelete}
                  isLoading={isDeleting}
                  startContent={!isDeleting ? <Trash className="h-4 w-4" /> : undefined}
                >
                  Eliminar
                </Button>
              )}
            </div>
            <div className="flex gap-4">
              <Button
                color="default"
                className="text-default-500 hover:bg-default-100 dark:hover:bg-default-800 dark:hover:text-neutral-800"
                variant="flat"
                onPress={onClose}
                startContent={<IoClose className="h-4 w-4" />}
              >
                Cerrar
              </Button>
              {canEditThisCompany && (
                <Button
                  color="success"
                  variant="flat"
                  onPress={handleEdit}
                  startContent={<Pencil className="h-4 w-4" />}
                >
                  Editar
                </Button>
              )}
            </div>
          </div>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
