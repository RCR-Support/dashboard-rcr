'use client';
import { useRouter } from 'next/navigation';
import EditActivityForm from '../editActivityForm';
import { withPermission } from '@/components/ui/auth/withPermission';
import type { ComponentProps } from 'react';

type ActivityProp = ComponentProps<typeof EditActivityForm>['activity'];

function EditActivityClient({ activity }: { activity: ActivityProp }) {
  const router = useRouter();
  return (
    <EditActivityForm
      activity={activity}
      onSuccess={() => {
        // Guardar el ID de la actividad en sessionStorage para expandirla después de la redirección
        sessionStorage.setItem('expandedActivityId', activity.id);
        router.push('/dashboard/activities');
      }}
    />
  );
}

const ProtectedEditActivity = withPermission(
  EditActivityClient,
  '/dashboard/activities/edit'
);
export default ProtectedEditActivity;
