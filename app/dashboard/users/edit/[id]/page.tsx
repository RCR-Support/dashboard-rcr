'use client'

import FormRegister from "@/components/ui/dashboard/user/form-register";
import { withPermission } from '@/components/ui/auth/withPermission';
import { getUserById } from "@/actions/user/get-userById";
import { useEffect, useState } from 'react';
import { UserEdit } from '@/interfaces/user.interfaceEdit';

import { useRouter } from "next/navigation";

interface Props {
    params: {
        id: string;
    }
}

const EditUserPage = ({ params }: Props ) => {
    const [user, setUser] = useState<UserEdit | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { id } = params;

    useEffect(() => {
        const loadUser = async () => {
            try {
                const response = await getUserById(id);
                // Verificamos si response existe y tiene las propiedades esperadas
                if (!response) {
                    setError('Error al cargar el usuario: No hay respuesta del servidor');
                    return;
                }

                if (response.ok && response.user) {
                    setUser(response.user);
                } else {
                    setError(response.message || 'Error al cargar el usuario');
                }
            } catch (error) {
                console.error('Error al cargar el usuario:', error);
                setError('Error al cargar el usuario');
            } finally {
                setIsLoading(false);
            }
        };

        loadUser();
    }, [id]);

    if (isLoading) {
        return <div className="flex justify-center items-center">Cargando...</div>;
    }

    if (error) {
        return <div className="flex justify-center items-center text-red-500">{error}</div>;
    }

    return (
        <div className="flex flex-col justify-center items-center">
            <div className="grid grid-cols-12 grid-rows-auto gap-4 w-full lg:max-w-[1024px] card-box">
                <div className="col-span-12 row-span-1 text-xl font-normal py-4">
                    Editar usuario: {user?.displayName || 'Sin Nombre'}
                </div>
                {user && (
                    <FormRegister 
                        initialData={user}
                        isEditing={true}
                    />
                )}
            </div>
        </div>
    )
}

const ProtectedEditUserPage = withPermission(EditUserPage, '/dashboard/users/edit');
export default ProtectedEditUserPage;
