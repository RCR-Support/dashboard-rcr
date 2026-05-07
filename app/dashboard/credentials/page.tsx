import { listApprovedApplications } from '@/actions/credentials/list-approved-applications';
import { auth } from '@/auth';
import CredentialsClientPage from './CredentialsClientPage';

export default async function CredentialsPage() {
  const session = await auth();
  const result = await listApprovedApplications();

  if (!result.ok) {
    return (
      <div className="container mx-auto py-10">
        <h1 className="text-2xl font-bold mb-6">Credenciales</h1>
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-800 dark:text-red-200">
            Error: {result.error || 'Error al cargar credenciales'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <CredentialsClientPage
      applications={result.applications || []}
      userRole={session?.user?.roles?.[0]}
    />
  );
}
