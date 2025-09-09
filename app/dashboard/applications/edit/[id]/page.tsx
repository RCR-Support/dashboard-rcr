import { db } from '@/lib/db';
import { notFound } from 'next/navigation';

export default async function EditApplicationPage({
  params,
}: {
  params: { id: string };
}) {
  const application = await db.application.findUnique({
    where: {
      id: params.id,
    },
    include: {
      company: true,
      contract: true,
      activities: true,
      zones: true,
    },
  });

  if (!application) {
    notFound();
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Editar Solicitud</h1>
      <p>Esta página está en desarrollo...</p>
    </div>
  );
}
