import { listDocumentations } from '@/actions/documentations/list-documentations';
import dynamic from 'next/dynamic';

const DocumentationForm = dynamic(() => import('./DocumentationForm'), {
  ssr: false,
});

export default async function DocumentationsPage() {
  const documentations = await listDocumentations();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Documentaciones</h1>
      <DocumentationForm />
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-8">
        {documentations.map((doc: any) => (
          <div
            key={doc.id}
            className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 flex flex-col items-center"
          >
            <h3 className="font-semibold mb-1 text-center">{doc.name}</h3>
            <span className="text-xs text-gray-500 dark:text-gray-300">
              {doc.isGlobal
                ? 'Global (válido para todas las actividades)'
                : 'Curso específico para el área a desarrollar'}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-300">
              Expira: {doc.expires ? 'Sí' : 'No'}
            </span>
            {doc.expirationDate && (
              <span className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                Expira el: {new Date(doc.expirationDate).toLocaleDateString()}
              </span>
            )}
            {/* Aquí puedes agregar botones de editar/eliminar */}
          </div>
        ))}
      </div>
    </div>
  );
}
