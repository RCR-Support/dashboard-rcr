import { redirect } from 'next/navigation';
import { getApprovedApplication } from '@/actions/credentials/get-approved-application';
import PrintCredential from './PrintCredential';

interface Props {
  params: Promise<{ id: string }>;
}

export const metadata = {
  title: 'Imprimir Credencial',
};

export default async function PrintCredentialPage({ params }: Props) {
  const { id } = await params;
  const result = await getApprovedApplication(id);

  if (!result.ok || !result.application) {
    redirect('/dashboard/applications');
  }

  return <PrintCredential application={result.application} />;
}
