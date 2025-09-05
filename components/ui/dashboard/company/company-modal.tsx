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
import { Phone, Globe, MapPin, Pencil, Trash } from 'lucide-react';
import { formatPhoneNumber } from '@/lib/formatPhoneNumber';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { IoClose } from 'react-icons/io5';

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

  const handleEdit = () => {
    if (company) {
      setEditingCompany(company);
      onClose();
      router.push(`/dashboard/companies/edit/${company.value}`);
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
                return (
                  <p
                    key={index}
                    className="flex justify-start items-center gap-2"
                  >
                    {icon}
                    <span className="font-semibold">{label}</span>
                    <span className="truncate text-ellipsis max-w-[360px]">
                      {value}
                    </span>
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

            {/* Sección de Contratos */}
            {company?.contracts && company.contracts.length > 0 && (
              <>
                <div className="border-t border-gray-200 dark:border-gray-700 my-4"></div>
                <div>
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    Contratos
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
                          <div>
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
                              Inicio contrato:{' '}
                              <span className="font-semibold text-amber-400 dark:text-amber-100">
                                {format(
                                  new Date(contract.initialDate),
                                  'dd MMM yyyy',
                                  { locale: es }
                                )}
                              </span>{' '}
                              {' - '} Final contrato:{' '}
                              <span className="font-semibold text-amber-400 dark:text-amber-100">
                                {format(
                                  new Date(contract.finalDate),
                                  'dd MMM yyyy',
                                  { locale: es }
                                )}
                              </span>
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Administrador:{' '}
                              <span className="font-semibold text-amber-400 dark:text-amber-100">
                                {contract.userAc?.displayName ||
                                  'Sin administrador'}
                              </span>
                            </p>
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
            <Button
              color="success"
              variant="flat"
              onPress={handleEdit}
              startContent={<Pencil className="h-4 w-4" />}
            >
              Editar
            </Button>
            <Button
              color="danger"
              variant="flat"
              onPress={onClose}
              startContent={<Trash className="h-4 w-4" />}
            >
              Eliminar
            </Button>
          </div>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
