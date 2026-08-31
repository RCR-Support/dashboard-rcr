import { listActivities } from '@/actions/activities/list-activities';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import ActivitiesClientPage from './ActivitiesClientPage';

export default async function ActivitiesPage() {
  const session = await auth();
  if (!session?.user) redirect('/login');

  const activities = await listActivities();

  return (
    <div>
      <ActivitiesClientPage activities={activities} />
    </div>
  );
}
