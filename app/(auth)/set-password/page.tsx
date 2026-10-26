import SetPasswordForm from '@/components/ui/auth/set-password-form';

interface SetPasswordPageProps {
  searchParams: Promise<{
    email?: string;
    token?: string;
  }>;
}

export default async function SetPasswordPage({ searchParams }: SetPasswordPageProps) {
  const params = await searchParams;

  if (!params.email || !params.token) {
    return <main className="flex min-h-screen items-center justify-center p-6">El enlace es inválido o está incompleto.</main>;
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <SetPasswordForm email={params.email} token={params.token} />
    </main>
  );
}