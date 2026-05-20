import { listActivities } from '@/actions/activities/list-activities';
import dynamic from 'next/dynamic';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';

const ActivitiesClientPage = dynamic(() => import('./ActivitiesClientPage'), {
  ssr: false,
});

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
