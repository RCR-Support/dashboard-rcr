"use client";
import EditActivityForm from '../editActivityForm';
import { withPermission } from '@/components/ui/auth/withPermission';

function EditActivityClient({ activity }: { activity: any }) {
  return <EditActivityForm activity={activity} onSuccess={() => window.location.href = '/dashboard/activities'} />;
}

const ProtectedEditActivity = withPermission(EditActivityClient, '/dashboard/activities/edit');
export default ProtectedEditActivity;
