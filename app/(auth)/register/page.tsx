import { auth } from '@/auth';

import FormRegister from '@/components/ui/auth/form-register';
import { redirect } from 'next/navigation';

const RegisterPage = async () => {
  const session = await auth();

  if (session?.user?.roles?.includes('admin')) {
    redirect('/dashboard');
  }

  return (
    <div className="flex justify-center items-center text-4xl h-screen text-slate-800 dark:text-white">
      <FormRegister />
    </div>
  );
};

export default RegisterPage;
