import { CompanySelect } from "@/interfaces/company.interface";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@heroui/modal";
import { Button } from "@heroui/react";
import { useRouter } from 'next/navigation';
import { useCompanyStore } from '@/store/ui/useCompanyStore';
import { Phone, Globe, MapPin } from "lucide-react";
import { formatPhoneNumber } from "@/lib/formatPhoneNumber";

interface CompanyModalProps {
    isOpen: boolean;
    onClose: () => void;
    company: CompanySelect | null;
}

export const CompanyModal = ({ isOpen, onClose, company }: CompanyModalProps) => {
    const router = useRouter();
    const setEditingCompany = useCompanyStore((state) => state.setEditingCompany);

    const handleEdit = () => {
        if (company) {
            setEditingCompany(company);
            onClose();
            router.push(`/dashboard/companies/edit/${company.value}`);
        }
    };
    return (
        <Modal isOpen={isOpen} onClose={onClose} size="md" backdrop='blur'>
            <ModalContent>
                <ModalHeader className='flex flex-col'>
                        Información de la empresa
                        <span className="text-[#03c9d7] text-xs font-semibold">
                            {company?.label.split(' (')[0]}
                        </span>
                </ModalHeader>
                <ModalBody>
                    <div className="space-y-4">
                            <p className='flex justify-start items-center gap-2'>
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
                                    <p key={index} className='flex justify-start items-center gap-2'>
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
                    </div>
                </ModalBody>
                <ModalFooter>
                    <Button
                        color="success"
                        variant="flat"
                        onPress={handleEdit}
                    >
                        Editar
                    </Button>
                    <Button
                        color="danger"
                        variant="flat"
                        onPress={onClose}
                    >
                        Eliminar
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};
