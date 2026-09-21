import EditUserClient from './EditUserClient';

interface Props {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditUserPage({ params }: Props) {
  const { id } = await params;
  return <EditUserClient id={id} />;
}
