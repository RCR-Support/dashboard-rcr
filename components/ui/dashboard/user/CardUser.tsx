'use client';
import { useState } from 'react';
import type { User } from "@/interfaces";
import Avatar from '@mui/material/Avatar';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@heroui/modal";
import { TfiPlus } from "react-icons/tfi";
import { Button } from '@heroui/react';

interface Props {
    users: User[];
}

export const CardUser = ({ users }: Props) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);

    const openModal = (user: User) => {
        setSelectedUser(user);
        setIsOpen(true);
    };

    const closeModal = () => {
        setIsOpen(false);
        setSelectedUser(null);
    };

    function stringAvatar(displayName: string) {
        return {
            children: `${displayName.split(' ')[0][0]}${displayName.split(' ')[1][0]}`,
        };
    }

    return (
        <div className="grid grid-cols-12 grid-rows-auto gap-4 w-full col-span-12 mt-6">
            {users.map((user) => (
                <button key={user.id} onClick={() => openModal(user)} className="col-span-3 card-box">
                    <div className="flex gap-4 items-center justify-between">
                        <Avatar {...stringAvatar(user.displayName.toUpperCase())} src="" className="bg-[#03c9d7] dark:bg-[#327f84]" />
                        <div className='flex flex-col'>
                            <div className="font-semibold truncate text-ellipsis max-w-44">
                                {user.displayName}
                            </div>
                            <div className="truncate text-ellipsis max-w-44">
                                {user.email}
                            </div>
                        </div>
                        <TfiPlus className="text-2xl text-[#03c9d7] dark:text-[#327f84]" />
                    </div>
                </button>
            ))}

            <Modal isOpen={isOpen} onClose={closeModal} size="md" backdrop='blur'>
                <ModalContent>
                    <ModalHeader>Información del Usuario</ModalHeader>
                    <ModalBody>
                        {selectedUser && (
                            <div className="space-y-4">
                                <p><strong>Nombre:</strong> {selectedUser.displayName}</p>
                                <p><strong>Email:</strong> {selectedUser.email}</p>
                                <p><strong>Rol:</strong> {selectedUser.role}</p>
                            </div>
                        )}
                    </ModalBody>
                    <ModalFooter>
                        <Button color="success" variant="flat"  onPress={closeModal} >Editar</Button>
                        <Button color="danger" variant="flat"  onPress={closeModal} >Eliminar</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </div>
    );
};
