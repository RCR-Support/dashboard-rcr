import { fetchCompanies } from '@/actions';
import CompaniesTable from '@/components/ui/dashboard/company/companies-table';
import { CompanySelect } from '@/interfaces/company.interface';
import { Button } from '@heroui/button';
import { Suspense } from 'react';
import Link from 'next/link';
import { MdOutlineAddBusiness } from 'react-icons/md';
import { auth } from '@/auth';
import { hasActionPermission } from '@/config/action-permissions';
import { redirect } from 'next/navigation';
import { RoleEnum } from '@prisma/client';

interface CompaniesPageProps {
  searchParams: { filter?: string };
}

export default async function CompaniesPage({ searchParams }: CompaniesPageProps) {
  // Verificar permisos server-side
  const session = await auth();
  if (!session?.user) {
    redirect('/auth/login');
  }

  const userRoles = session.user.roles || [];
  const canViewAll = hasActionPermission('companies:view:all', userRoles);
  const canCreate = hasActionPermission('companies:create', userRoles);

  if (!canViewAll) {
    redirect('/unauthorized');
  }

  const isAC = userRoles.includes(RoleEnum.adminContractor);
  // AC ve "mis empresas" por defecto; puede cambiar a "todas"
  const filterMode = isAC && searchParams.filter !== 'all' ? 'mine' : 'all';

  const { ok, companies = [], message } = await fetchCompanies({ filterMode });

  const companiesToShow: CompanySelect[] = companies;

  return (
    <div className="grid grid-cols-12 grid-rows-auto gap-4 w-full mx-auto lg:max-w-[100%]">
      <div className="col-span-12 text-xl font-normal card-box flex justify-between items-center flex-wrap gap-2">
        <h1>Listado de empresas</h1>
        <div className="flex items-center gap-3">
          {/* Toggle de filtro solo para AC */}
          {isAC && (
            <div className="flex gap-1 text-sm">
              <Link
                href="/dashboard/companies"
                className={`px-3 py-1 rounded-md border transition-colors ${
                  filterMode === 'mine'
                    ? 'bg-primary text-white border-primary'
                    : 'border-gray-300 hover:border-primary text-gray-600 dark:text-gray-300'
                }`}
              >
                Mis empresas
              </Link>
              <Link
                href="/dashboard/companies?filter=all"
                className={`px-3 py-1 rounded-md border transition-colors ${
                  filterMode === 'all'
                    ? 'bg-primary text-white border-primary'
                    : 'border-gray-300 hover:border-primary text-gray-600 dark:text-gray-300'
                }`}
              >
                Todas
              </Link>
            </div>
          )}
          {canCreate && (
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
          )}
        </div>
      </div>
      <div className="col-span-12">
        {!ok ? (
          <div className="card-box text-sm text-red-600 dark:text-red-400">
            {message || 'Error al cargar empresas'}
          </div>
        ) : (
          <Suspense fallback={<div>Cargando...</div>}>
            <CompaniesTable companies={companiesToShow} />
          </Suspense>
        )}
      </div>
    </div>
  );
}
