import { listApplications } from '@/actions/applications/list-applications';
import ApplicationsClientPage from './ApplicationsClientPage';
import { Suspense } from 'react';
import { auth } from '@/auth';
import { db } from '@/lib/db';

interface Props {
  searchParams: Promise<{ contract?: string; view?: string }>;
}

export default async function ApplicationsPage({ searchParams }: Props) {
  const session = await auth();
  const params = await searchParams;
  const contractId = params?.contract;

  const result = await listApplications(contractId);

  // Si hay filtro por contrato, buscar info del contrato
  let contractInfo: { contractName: string; contractNumber: string } | null = null;
  if (contractId) {
    const contract = await db.contract.findUnique({
      where: { id: contractId },
      select: { contractName: true, contractNumber: true },
    });
    contractInfo = contract;
  }

  if (!result.ok) {
    return (
      <div className="container mx-auto py-10">
        <h1 className="text-2xl font-bold mb-6">Solicitudes</h1>
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-800 dark:text-red-200">
            Error: {result.error || 'Error al cargar solicitudes'}
          </p>
        </div>
      </div>
    );
  }

  const applications = result.applications || [];

  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <ApplicationsClientPage 
        initialApplications={applications}
        userRole={session?.user?.roles?.[0]}
        contractFilter={contractInfo}
      />
    </Suspense>
  );
}


