'use client';
import { useState, useTransition } from 'react';
import type { User } from "@/interfaces";
import Avatar from '@mui/material/Avatar';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@heroui/modal";
import { TfiPlus } from "react-icons/tfi";
import { Button, Input } from '@heroui/react';
import { CiSearch } from "react-icons/ci";
import { formatPhoneNumber } from '@/lib/formatPhoneNumber';
import { formatRun } from '../../../../lib/validations';
import { BlockDeleteModal } from '@/components/ui/block-delete-modal';
import { checkAssignedUsers } from '@/actions/user/get-checkAsignedUser';
import { AssignedUser } from '@/interfaces/admin.interface';

import { useRouter } from "next/navigation";
import { RoleEnum } from '@prisma/client';
import { IoClose } from 'react-icons/io5';
import { Pencil, Trash } from 'lucide-react';
import { TbSortAscending2, TbSortDescending2 } from 'react-icons/tb';
interface Props {
    users: User[];
}
export const CardUser = ({ users }: Props) => {
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [isAscending, setIsAscending] = useState(true);
    const openModal = (user: User) => {
        setSelectedUser(user);
        setIsOpen(true);
    };
    const closeModal = () => {
        setIsOpen(false);
        setSelectedUser(null);
    };
    const handleEdit = () => {
        if (selectedUser) {
            router.push(`/dashboard/users/edit/${selectedUser.id}`);
        }
    };
    function stringAvatar(displayName: string) {
        return {
            children: `${displayName.split(' ')[0][0]}${displayName.split(' ')[1][0]}`,
        };
    }
    const normalizeText = (text: string) =>
        text.normalize("NFD").replace(/[\u0300-\u036f]/g, ""); // Elimina tildes y diéresis
    const normalizedFilter = normalizeText(searchTerm.toLowerCase());
    const filteredUsers = users.filter((user) =>
        normalizeText(`${user.name} ${user.lastName} ${user.secondLastName}`).toLowerCase().includes(normalizedFilter) ||
        user.run?.toLowerCase().includes(searchTerm.toLowerCase())
    );



    const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);
    const [assignedUsers, setAssignedUsers] = useState<AssignedUser[]>([]);
    const [isPending, startTransition] = useTransition();

    const handleDelete = async () => {
        if (!selectedUser) return;
        try {
            // 1. Verificar si es adminContractor y tiene usuarios asignados
            const adminCheck = await checkAssignedUsers(selectedUser.id);
            console.log('Resultado check:', adminCheck);
            if (adminCheck && adminCheck.assignedUsers.length > 0) {
                console.log('Admin tiene usuarios asignados');
                setAssignedUsers(adminCheck.assignedUsers);
                setIsBlockModalOpen(true);
                return;
            }
            // 2. Si no es admin o no tiene usuarios, confirmar eliminación
            const confirmed = window.confirm("¿Estás seguro de eliminar este usuario?");
            if (!confirmed) return;
            startTransition(async () => {
                // Aquí irá la lógica de eliminación
                console.log('Procediendo con eliminación');
            });
        } catch (error) {
            console.error('Error en handleDelete:', error);
        }
    };

    const toggleSortOrder = () => {
        setIsAscending(!isAscending);
    };

    const sortedUsers = [...filteredUsers].sort((a, b) => {
        if (isAscending) {
            return a.name.localeCompare(b.name);
        } else {
            return b.name.localeCompare(a.name);
        }
    });

    return (
        <>
            <div className="w-full card-box col-span-12">
                <div className="flex flex-col gap-4">
                    <div className="flex justify-between   gap-3 items-end">
                            <Input
                                isClearable
                                classNames={{
                                    inputWrapper: "border-1 md:w-1/2",
                                }}
                                placeholder="Buscar por nombre o RUN..."
                                size="sm"
                                startContent={<CiSearch className="text-default-300" />}
                                value={searchTerm}
                                variant="bordered"
                                onClear={() => setSearchTerm("")}
                                onValueChange={setSearchTerm}
                            />
                            <button onClick={toggleSortOrder}>
                                {isAscending ? (
                                    <TbSortAscending2 className='text-2xl' />
                                ) : (
                                    <TbSortDescending2 className='text-2xl' />
                                )}
                            </button>
                    </div>
                </div>
            </div>
            <div className="grid grid-cols-12 grid-rows-auto gap-4 w-full col-span-12 mt-6">
                {sortedUsers.map((user) => (
                    <button key={user.id} onClick={() => openModal(user)} className="col-span-6 md:col-span-6 xl:col-span-3 card-box">
                        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                            <Avatar {...stringAvatar(user.displayName.toUpperCase())} src={user.image || ""} sx={{ width: 56, height: 56 }} className={user.image ? 'bg-white' : 'bg-[#03c9d7] dark:bg-[#327f84]'} />
                            <div className='flex flex-col'>
                                <div className="font-semibold truncate text-ellipsis max-w-36 xl:max-w-44">
                                    {user.userName}
                                </div>
                                <div className="hidden md:block truncate text-ellipsis max-w-36 2xl:max-w-44">
                                    {user.email}
                                </div>
                            </div>
                            <TfiPlus className="hidden md:block text-2xl text-[#03c9d7] dark:text-[#327f84]" />
                        </div>
                    </button>
                ))}

                {/* Modal de bloqueo */}
                <BlockDeleteModal
                    isOpen={isBlockModalOpen}
                    onClose={() => setIsBlockModalOpen(false)}
                    assignedUsers={assignedUsers}
                    adminName={selectedUser?.displayName || ''}
                />
                <Modal isOpen={isOpen} onClose={closeModal} size="md" backdrop='blur'>
                    <ModalContent>
                        <ModalHeader className='flex flex-col'>Información de contacto de:  <span className="text-[#03c9d7] text-xs font-semibold">{selectedUser?.userName}</span></ModalHeader>
                        <ModalBody>
                            {selectedUser && (
                                <div className="space-y-4">
                                    <p className='flex justify-start items-center gap-2'><span className="font-semibold">Nombre:</span> <span className="truncate text-ellipsis max-w-[360px]">{selectedUser.name} {selectedUser.middleName} {selectedUser.lastName} {selectedUser.secondLastName} </span></p>
                                    <p className='flex justify-start items-center gap-2'><span className="font-semibold">Email:</span> <span className="truncate text-ellipsis max-w-[360px]">{selectedUser.email}</span> </p>
                                    <p className='flex justify-start items-center gap-2'><span className="font-semibold">N° Telefono:</span> <span className="truncate text-ellipsis max-w-[360px]">{formatPhoneNumber(selectedUser.phoneNumber || "")}</span></p>

                                    <div className="border-b border-gray-200 dark:border-gray-800"></div>
                                    <p className='flex justify-start items-center gap-2'><span className="font-semibold">Empresa:</span> <span className="truncate text-ellipsis max-w-[360px]">{selectedUser.company?.name}</span></p>
                                    <p className='flex justify-start items-center gap-2'><span className="font-semibold">RUT:</span> <span className="truncate text-ellipsis max-w-[360px]">{formatRun(selectedUser.company?.rut || "")}</span></p>
                                    <p><span className="font-semibold">N° Telefono: </span> <span className="truncate text-ellipsis max-w-[360px]">{formatPhoneNumber(selectedUser.company?.phone || "")}</span></p>
                                    {selectedUser.adminContractorId && (
                                        <>
                                        <div className="border-b border-gray-200 dark:border-gray-800"></div>
                                        <h3 className="font-semibold text-sm">Administrador de contrato:</h3>
                                        <p className='flex justify-start items-center gap-2'><span className="font-semibold">Nombre:</span> <span className="truncate text-ellipsis max-w-[360px]">{selectedUser.adminContractor?.name} {selectedUser.adminContractor?.lastName} </span></p>
                                        <p className='flex justify-start items-center gap-2'><span className="font-semibold">Email:</span> <span className="truncate text-ellipsis max-w-[360px]">{selectedUser.adminContractor?.email}</span> </p>
                                        </>
                                    )}

                                    {/* Sección de usuarios asignados si es adminContractor */}
                                        {selectedUser.roles?.includes('adminContractor' as RoleEnum) && selectedUser.assignedUsers && (
                                            <>
                                        {selectedUser.assignedUsers.length === 0 ? (
                                                <p className="text-gray-500 dark:text-gray-400 text-sm">
                                                    No hay usuarios asignados a este administrador.
                                                </p>
                                            ) : (
                                                <>
                                                    <div className="border-b border-gray-200 dark:border-gray-800"></div>
                                                <div className="space-y-2">
                                                    <h3 className="font-semibold text-sm">Usuarios asignados a este administrador:</h3>
                                                    <div className="border rounded-md p-4 max-h-60 overflow-y-auto">
                                                        <ul className="space-y-3">
                                                            {selectedUser.assignedUsers.map((user) => (
                                                                <li key={user.id} className="text-sm border-b pb-2 last:border-0">
                                                                    <p className="font-medium">{user.displayName}</p>
                                                                    <p className="text-gray-500 dark:text-gray-400 text-xs">
                                                                        {user.email}
                                                                    </p>
                                                                    {user.company?.name && (
                                                                        <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">
                                                                            {user.company.name}
                                                                        </p>
                                                                    )}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                    <p className="text-xs text-amber-500">
                                                        Total usuarios asignados: {selectedUser.assignedUsers.length}
                                                    </p>
                                                </div>
                                                </>
                                            )}

                                            </>
                                        )}
                                </div>
                            )}
                        </ModalBody>
                        <ModalFooter className='flex justify-between items-center'>
                            <Button
                                color="default"
                                className="self-start text-left text-default-500 hover:bg-default-100 dark:hover:bg-default-800 dark:hover:text-neutral-800"
                                variant="flat"
                                onPress={closeModal}
                                startContent={<IoClose  className="h-4 w-4" />}
                            >
                                Cerrar
                            </Button>
                            <div className="flex gap-4">
                                <Button color="success" variant="flat"  onPress={handleEdit} startContent={<Pencil className="h-4 w-4"/>} >Editar</Button>
                                <Button color="danger" variant="flat"  onPress={handleDelete} startContent={<Trash className='h-4 w-4' />} >Eliminar</Button>
                            </div>
                        </ModalFooter>
                    </ModalContent>
                </Modal>
            </div>

        </>
    );
};
