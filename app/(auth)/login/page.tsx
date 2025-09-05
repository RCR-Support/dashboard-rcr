import FormLogin from '@/components/ui/auth/form-login';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';

const LoginPage = async () => {
  const session = await auth();

  if (session) {
    redirect('/dashboard');
  }

  return (
    <div className="flex justify-center items-center text-4xl h-screen text-slate-800 dark:text-white">
      <FormLogin />
    </div>
  );
};

export default LoginPage;
