import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { getCompanyById } from '@/actions/company/company-actions';
import { getCompanyContracts } from '@/actions/contract/get-company-contracts';
import CompanyForm from '@/components/ui/dashboard/company/company-form';
import { CompanySelectEdit } from '@/interfaces/CompanySelectEdit';
import ReloadButton from '@/components/ui/ReloadButton';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Building2, Link2 } from 'lucide-react';

export default async function MyCompanyPage() {
  const session = await auth();

  if (!session?.user) redirect('/login');

  const companyId = session.user.companyId;
  if (!companyId) {
    return (
      <div className="container mx-auto py-10 px-4">
        <h1 className="text-2xl font-bold mb-4">Mi Empresa</h1>
        <p className="text-gray-500 dark:text-gray-400">
          No tienes una empresa asignada. Contacta al administrador.
        </p>
      </div>
    );
  }

  const [result, contractsResult] = await Promise.all([
    getCompanyById(companyId),
    getCompanyContracts(companyId),
  ]);

  if (!result.success || !result.company) {
    return (
      <div className="container mx-auto py-10 px-4">
        <h1 className="text-2xl font-bold mb-4">Mi Empresa</h1>
        <p className="text-red-500 mb-4">Error al cargar los datos de tu empresa.</p>
        <ReloadButton />
      </div>
    );
  }

  const company: CompanySelectEdit = {
    value: result.company.value,
    name: result.company.name ?? '',
    rut: result.company.rut,
    phone: result.company.phone,
    status: result.company.status,
    city: result.company.city ?? null,
    url: result.company.url ?? null,
    logoUrl: result.company.logoUrl ?? null,
  };

  const contracts = contractsResult.ok ? (contractsResult.contracts ?? []) : [];
  const ownContracts = contracts.filter(c => !c.isSubcontract);
  const subContracts = contracts.filter(c => c.isSubcontract);

  return (
    <div className="container mx-auto py-10 px-4 max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Mi Empresa</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Puedes actualizar el teléfono, sitio web y logo de tu empresa.
        </p>
      </div>
      <CompanyForm initialData={company} isEditing isLimitedEdit />

      {/* Sección de contratos como empresa mandante */}
      {ownContracts.length > 0 && (
        <div className="mt-10">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-3 flex items-center gap-2">
            <Building2 size={18} className="text-amber-500" />
            Contratos activos ({ownContracts.length})
          </h2>
          <div className="space-y-3">
            {ownContracts.map(contract => (
              <div key={contract.id} className="border border-amber-200 dark:border-amber-800 bg-amber-50/40 dark:bg-amber-900/10 rounded-lg p-4">
                <p className="font-semibold text-sm text-slate-800 dark:text-amber-100">{contract.contractName}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">N° {contract.contractNumber}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {format(new Date(contract.initialDate), 'dd MMM yyyy', { locale: es })}
                  {' — '}
                  {format(new Date(contract.finalDate), 'dd MMM yyyy', { locale: es })}
                </p>
                {contract.userAc && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Administrador: <span className="font-semibold text-slate-700 dark:text-slate-200">{contract.userAc.displayName}</span>
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sección de contratos como sub-empresa */}
      {subContracts.length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-3 flex items-center gap-2">
            <Link2 size={18} className="text-cyan-500" />
            Participa como subcontratista en ({subContracts.length})
          </h2>
          <div className="space-y-3">
            {subContracts.map(contract => (
              <div key={contract.id} className="border border-cyan-200 dark:border-cyan-800 bg-cyan-50/40 dark:bg-cyan-900/10 rounded-lg p-4">
                <p className="font-semibold text-sm text-slate-800 dark:text-cyan-100">{contract.contractName}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">N° {contract.contractNumber}</p>
                {contract.mandanteName && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
                    <Building2 size={11} />
                    Empresa mandante: <span className="font-semibold text-slate-700 dark:text-slate-200">{contract.mandanteName}</span>
                  </p>
                )}
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {format(new Date(contract.initialDate), 'dd MMM yyyy', { locale: es })}
                  {' — '}
                  {format(new Date(contract.finalDate), 'dd MMM yyyy', { locale: es })}
                </p>
                {contract.userAc && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Administrador: <span className="font-semibold text-slate-700 dark:text-slate-200">{contract.userAc.displayName}</span>
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {contracts.length === 0 && (
        <div className="mt-10 text-center text-sm text-slate-500 dark:text-slate-400 py-6 border border-dashed border-slate-200 dark:border-slate-700 rounded-lg">
          Tu empresa no tiene contratos activos en este momento.
        </div>
      )}
    </div>
  );
}
