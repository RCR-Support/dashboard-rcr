'use client';

import FormRegister from '@/components/ui/dashboard/user/form-register';
import { withPermission } from '@/components/ui/auth/withPermission';
import { getUserById } from '@/actions/user/get-userById';
import { useEffect, useState } from 'react';
import { UserEdit } from '@/interfaces/user.interfaceEdit';

import { useRouter } from 'next/navigation';

interface Props {
  params: {
    id: string;
  };
}

const EditUserPage = ({ params }: Props) => {
  const router = useRouter();
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
    return (
      <div className="flex flex-col justify-center items-center">
        <div className="grid grid-cols-12 grid-rows-auto gap-4 w-full lg:max-w-[1024px] card-box">
          <div className="col-span-12 py-4">
            <div className="h-7 w-64 bg-default-200 rounded animate-pulse" />
          </div>
          <div className="col-span-12 md:col-span-6 space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 w-24 bg-default-200 rounded animate-pulse" />
                <div className="h-10 w-full bg-default-100 rounded animate-pulse" />
              </div>
            ))}
          </div>
          <div className="col-span-12 md:col-span-6 space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 w-24 bg-default-200 rounded animate-pulse" />
                <div className="h-10 w-full bg-default-100 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[300px] gap-4">
        <div className="text-danger text-lg font-medium">{error}</div>
        <button
          onClick={() => router.push('/dashboard/users')}
          className="text-primary underline text-sm hover:text-primary-600"
        >
          Volver al listado de usuarios
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col justify-center items-center">
      <div className="grid grid-cols-12 grid-rows-auto gap-4 w-full lg:max-w-[1024px] card-box">
        <div className="col-span-12 row-span-1 text-xl font-normal py-4">
          Editar usuario: {user?.displayName || 'Sin Nombre'}
        </div>
        {user && <FormRegister initialData={user} isEditing={true} />}
      </div>
    </div>
  );
};

const ProtectedEditUserPage = withPermission(
  EditUserPage,
  '/dashboard/users/edit'
);
export default ProtectedEditUserPage;
