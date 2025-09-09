import { db } from '@/lib/db';
import { notFound } from 'next/navigation';

export default async function ApplicationPage({
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
      <h1 className="text-2xl font-bold mb-6">Detalles de la Solicitud</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Información del Trabajador</h2>
          <div className="space-y-2">
            <p><span className="font-medium">Nombre:</span> {application.workerName} {application.workerPaternal} {application.workerMaternal}</p>
            <p><span className="font-medium">RUN:</span> {application.workerRun}</p>
            {application.license && (
              <p><span className="font-medium">Licencia:</span> {application.license}</p>
            )}
            {application.licenseExpiration && (
              <p><span className="font-medium">Vencimiento de Licencia:</span> {application.licenseExpiration.toLocaleDateString()}</p>
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Información del Contrato</h2>
          <div className="space-y-2">
            <p><span className="font-medium">Empresa:</span> {application.company?.name}</p>
            <p><span className="font-medium">Estado:</span> {application.status}</p>
            <p><span className="font-medium">Estado AC:</span> {application.stateAc}</p>
            <p><span className="font-medium">Estado SHEQ:</span> {application.stateSheq}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Actividades Solicitadas</h2>
          <ul className="list-disc list-inside space-y-2">
            {application.activities.map((activity) => (
              <li key={activity.id}>{activity.name}</li>
            ))}
          </ul>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Zonas</h2>
          <ul className="list-disc list-inside space-y-2">
            {application.zones.map((zone) => (
              <li key={zone.id}>{zone.name}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
