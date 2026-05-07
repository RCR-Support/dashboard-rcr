import { getApprovedApplication } from '@/actions/credentials/get-approved-application';
import CredentialDetail from './CredentialDetail';
import Link from 'next/link';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function CredentialDetailPage({ params }: Props) {
  const { id } = await params;
  const result = await getApprovedApplication(id);

  if (!result.ok || !result.application) {
    return (
      <div className="container mx-auto py-10">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-800 dark:text-red-200">
            {result.error || 'Error al cargar la solicitud'}
          </p>
          <Link href="/dashboard/credentials" className="text-blue-500 hover:underline mt-2 inline-block">
            ← Volver al listado
          </Link>
        </div>
      </div>
    );
  }

  return <CredentialDetail application={result.application} />;
}
