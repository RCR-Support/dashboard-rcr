import { fetchCompanies } from '@/actions';
import CompaniesTable from '@/components/ui/dashboard/company/companies-table';
import { CompanySelect } from '@/interfaces/company.interface';
import { Button } from '@heroui/button';
import { Suspense } from 'react';
import Link from 'next/link';
import { MdOutlineAddBusiness } from 'react-icons/md';

export default async function CompaniesPage() {
  const { ok, companies = [] } = await fetchCompanies();
  if (!ok) {
    throw new Error('Error al cargar empresas');
  }

  // Ya no necesitamos mapear porque companies ya viene en el formato CompanySelect
  const companiesToShow: CompanySelect[] = companies;

  return (
    <div className="grid grid-cols-12 grid-rows-auto gap-4 w-full mx-auto lg:max-w-[100%]">
      <div className="col-span-12 text-xl font-normal card-box flex justify-between">
        <h1>Listado de empresas</h1>
        <Link href="/dashboard/companies/createCompany">
          <Button
            size="sm"
            variant="ghost"
            color="success"
            startContent={<MdOutlineAddBusiness />}
          >
            {' '}
            <span className="flex items-center gap-2 hover:text-white">
              Crear empresa
            </span>{' '}
          </Button>
        </Link>
      </div>
      <div className="col-span-12">
        <Suspense fallback={<div>Cargando...</div>}>
          <CompaniesTable companies={companiesToShow} />
        </Suspense>
      </div>
    </div>
  );
}
