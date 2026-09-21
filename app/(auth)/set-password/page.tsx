import SetPasswordForm from '@/components/ui/auth/set-password-form';

interface SetPasswordPageProps {
  searchParams: {
    email?: string;
    token?: string;
  };
}

export default function SetPasswordPage({ searchParams }: SetPasswordPageProps) {
  if (!searchParams.email || !searchParams.token) {
    return <main className="flex min-h-screen items-center justify-center p-6">El enlace es inválido o está incompleto.</main>;
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <SetPasswordForm email={searchParams.email} token={searchParams.token} />
    </main>
  );
}