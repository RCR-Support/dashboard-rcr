'use client';

import { withPermission } from '@/components/ui/auth/withPermission';
import CompanyForm from "@/components/ui/dashboard/company/company-form";
import { useEffect, useState } from 'react';
import { getCompanyById } from '@/actions/company/company-actions';
import { CompanySelectEdit } from '@/interfaces/CompanySelectEdit';

interface Props {
    params: {
        id: string;
    }
}

const EditCompanyPage = ( {params} : Props ) => {
    const [company, setCompany] = useState<CompanySelectEdit | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { id } = params;


    useEffect(() => {
        const loadCompany = async () => {
            try {
                const response = await getCompanyById(id);
                console.log('Respuesta del servidor:', response); // Para debugging

                if (response.success && response.company) {
                    setCompany(response.company);
                    console.log('Estado actualizado:', response.company); // Para debugging
                }
            } catch (error) {
                console.error('Error al cargar la empresa:', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadCompany();
    }, [id]);

    if (isLoading) {
        return <div className="flex justify-center items-center">Cargando...</div>;
    }

    if (error) {
        return <div className="flex justify-center items-center text-red-500">{error}</div>;
    }

    console.log('Company data:', company );

    return (
        <div className="flex flex-col justify-center items-center">
            <div className="grid grid-cols-12 grid-rows-auto gap-4 w-full lg:max-w-[1024px] card-box ">
                <div className="col-span-12 row-span-1 text-xl font-normal py-4">
                    Editar Empresa : {company?.name ? company.name : 'Sin Nombre'}
                </div>
                {company && (
                    <CompanyForm
                        initialData={company}
                        isEditing={true}
                    />
                )}
            </div>
        </div>
    )
}

const ProtectedCreateUserPage = withPermission(EditCompanyPage, '/dashboard/companies/createCompany');
export default ProtectedCreateUserPage;
