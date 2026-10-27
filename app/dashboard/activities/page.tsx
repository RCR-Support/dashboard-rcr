import { listActivitiesWithStatus } from '@/actions/activities/list-activities';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import ActivitiesClientPage from './ActivitiesClientPage';

export default async function ActivitiesPage() {
  const session = await auth();
  if (!session?.user) redirect('/login');

  const result = await listActivitiesWithStatus();

  if (!result.ok) {
    return (
      <div className="mx-auto mt-8 max-w-3xl rounded-lg border border-danger-200 bg-danger-50 p-5 text-danger-800">
        <h2 className="font-semibold">No se pudo cargar el catálogo</h2>
        <p className="mt-1 text-sm">{result.error}</p>
      </div>
    );
  }

  return (
    <div>
      <ActivitiesClientPage activities={result.activities} />
    </div>
  );
}
