'use client';

import CompanyForm from '@/components/ui/dashboard/company/company-form';
import { useEffect, useState } from 'react';
import { getCompanyById } from '@/actions/company/company-actions';
import { CompanySelectEdit } from '@/interfaces/CompanySelectEdit';
import { usePermissions } from '@/hooks/usePermissions';
import { useRouter } from 'next/navigation';

interface Props {
  params: {
    id: string;
  };
}

const EditCompanyPage = ({ params }: Props) => {
  const [company, setCompany] = useState<CompanySelectEdit | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { id } = params;
  const { can, isLoading: permissionsLoading } = usePermissions();
  const router = useRouter();

  // Verificar permisos
  const canEditAny = can('companies:edit:any');
  const canEditOwn = can('companies:edit:own');

  useEffect(() => {
    // Esperar a que carguen los permisos
    if (permissionsLoading) return;

    // Verificar permisos antes de cargar datos
    if (!canEditAny && !canEditOwn) {
      router.push('/unauthorized');
      return;
    }

    const loadCompany = async () => {
      try {
        const response = await getCompanyById(id);

        if (response.error) {
          setError(response.error);
          // Si el error es de permisos, redirigir
          if (response.error.includes('permiso') || response.error.includes('tuyas')) {
            router.push('/unauthorized');
          }
          return;
        }

        if (response.success && response.company) {
          setCompany(response.company);
        }
      } catch (error) {
        console.error('Error al cargar la empresa:', error);
        setError('Error al cargar la empresa');
      } finally {
        setIsLoading(false);
      }
    };

    loadCompany();
  }, [id, canEditAny, canEditOwn, permissionsLoading, router]);

  if (permissionsLoading || isLoading) {
    return (
      <div className="flex flex-col justify-center items-center">
        <div className="grid grid-cols-12 grid-rows-auto gap-4 w-full lg:max-w-[1024px] card-box">
          <div className="col-span-12 py-4">
            <div className="h-7 w-64 bg-default-200 rounded animate-pulse" />
          </div>
          <div className="col-span-12 md:col-span-6 space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 w-24 bg-default-200 rounded animate-pulse" />
                <div className="h-10 w-full bg-default-100 rounded animate-pulse" />
              </div>
            ))}
          </div>
          <div className="col-span-12 md:col-span-6 space-y-4">
            {[...Array(3)].map((_, i) => (
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
          onClick={() => router.push('/dashboard/companies')}
          className="text-primary underline text-sm hover:text-primary-600"
        >
          Volver al listado de empresas
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col justify-center items-center">
      <div className="grid grid-cols-12 grid-rows-auto gap-4 w-full lg:max-w-[1024px] card-box ">
        <div className="col-span-12 row-span-1 text-xl font-normal py-4 flex flex-col md:flex-row md:items-center md:gap-2">
          Editar Empresa :{' '}
          <span className="text-[#03c9d7]">
            {' '}
            {company?.name ? company.name : 'Sin Nombre'}{' '}
          </span>
        </div>
        {company && <CompanyForm initialData={company} isEditing={true} />}
      </div>
    </div>
  );
};

export default EditCompanyPage;
