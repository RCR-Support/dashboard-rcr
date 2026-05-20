import { listActivities } from '@/actions/activities/list-activities';
import { notFound } from 'next/navigation';
import EditActivityClient from '../EditActivityClient';

export default async function EditActivityPage({
  params,
}: {
  params: { id: string };
}) {
  const activities = await listActivities();
  const activity = activities.find((a: { id: string }) => a.id === params.id);
  if (!activity) return notFound();

  // Map requiredDocumentations to include documentationId expected by the form
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mappedActivity = {
    ...activity,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    requiredDocumentations: activity.requiredDocumentations?.map((rd: any) => ({
      ...rd,
      documentationId: rd.documentation?.id ?? rd.id,
    })),
  };

  return (
    <div className="max-w-2xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Editar Actividad</h1>
      {/* Renderiza el formulario en un componente cliente para evitar error de event handler */}
      <EditActivityClient activity={mappedActivity} />
    </div>
  );
}
