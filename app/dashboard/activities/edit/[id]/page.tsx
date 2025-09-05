import { listActivities } from '@/actions/activities/list-activities';
import EditActivityForm from '../../editActivityForm';
import { notFound } from 'next/navigation';
import EditActivityClient from '../EditActivityClient';

export default async function EditActivityPage({
  params,
}: {
  params: { id: string };
}) {
  const activities = await listActivities();
  const activity = activities.find((a: any) => a.id === params.id);
  if (!activity) return notFound();

  return (
    <div className="max-w-2xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Editar Actividad</h1>
      {/* Renderiza el formulario en un componente cliente para evitar error de event handler */}
      <EditActivityClient activity={activity} />
    </div>
  );
}
