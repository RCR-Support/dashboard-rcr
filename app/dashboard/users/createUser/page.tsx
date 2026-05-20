'use client';

import FormRegister from '@/components/ui/dashboard/user/form-register';
import { withPermission } from '@/components/ui/auth/withPermission';
import Link from 'next/link';
import { Info } from 'lucide-react';

const CreateUserPage = () => {
  return (
    <div className="flex flex-col justify-center items-center">
      <div className="grid grid-cols-12 grid-rows-auto gap-4 w-full lg:max-w-[1024px] card-box ">
        <div className="col-span-12 row-span-1 text-xl font-normal py-4">
          Formulario creación de usuario
        </div>
        <div className="col-span-12 flex items-center gap-3 px-4 py-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
          <Info className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
          <p className="text-sm text-amber-800 dark:text-amber-200">
            El usuario debe pertenecer a una empresa. Verifica que su empresa esté registrada o{' '}
            <Link
              href="/dashboard/companies/createCompany"
              className="font-semibold underline hover:text-amber-900 dark:hover:text-amber-100"
            >
              créala aquí
            </Link>
            .
          </p>
        </div>
        <FormRegister />
      </div>
    </div>
  );
};

const ProtectedCreateUserPage = withPermission(
  CreateUserPage,
  '/dashboard/users/createUser'
);
export default ProtectedCreateUserPage;
