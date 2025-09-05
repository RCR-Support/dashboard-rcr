import { listActivities } from '@/actions/activities/list-activities';
import dynamic from 'next/dynamic';

const ActivityForm = dynamic(() => import('./ActivityForm'), { ssr: false });
const ActivitiesClientPage = dynamic(() => import('./ActivitiesClientPage'), {
  ssr: false,
});

export default async function ActivitiesPage() {
  const activities = await listActivities();

  return (
    <div>
      <ActivitiesClientPage activities={activities} />
    </div>
  );
}
