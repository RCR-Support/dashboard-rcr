import FormLogin from '@/components/ui/auth/form-login';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';

const LoginPage = async () => {
  const session = await auth();

  if (session) {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-[#171c23] px-4">
      <FormLogin />
    </div>
  );
};

export default LoginPage;
