import EditCompanyClient from './EditCompanyClient';

interface Props {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditCompanyPage({ params }: Props) {
  const { id } = await params;
  return <EditCompanyClient id={id} />;
}
