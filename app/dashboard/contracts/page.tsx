import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { hasActionPermission } from '@/config/action-permissions';
import { listContracts } from '@/actions/contract/list-contracts';
import ContractsClientPage from './ContractsClientPage';
import { ReloadButton } from '@/components/ui/ReloadButton';

export default async function ContractsPage() {
  const session = await auth();
  
  if (!session?.user) {
    redirect('/auth/login');
  }

  const userRoles = session.user.roles || [];
  const canViewAll = hasActionPermission('contracts:view:all', userRoles);
  const canViewAssigned = hasActionPermission('contracts:view:assigned', userRoles);
  const canViewCompany = hasActionPermission('contracts:view:company', userRoles);

  if (!canViewAll && !canViewAssigned && !canViewCompany) {
    redirect('/unauthorized');
  }

  const result = await listContracts();

  if (!result.ok) {
    return (
      <div className="container mx-auto py-10">
        <h1 className="text-2xl font-bold mb-6">Contratos</h1>
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-center justify-between gap-4">
          <p className="text-red-800 dark:text-red-200">
            {result.error || 'Error al cargar contratos'}
          </p>
          <ReloadButton label="Reintentar" />
        </div>
      </div>
    );
  }

  const contracts = result.contracts || [];

  const canLinkSubcontract = hasActionPermission('subcontracts:create', userRoles);
  const canEdit = hasActionPermission('contracts:edit:any', userRoles) || hasActionPermission('contracts:edit:assigned', userRoles);

  return (
    <ContractsClientPage 
      contracts={contracts}
      canCreate={canViewAll}
      isAdmin={canViewAll}
      canLinkSubcontract={canLinkSubcontract}
      canEdit={canEdit}
    />
  );
}
