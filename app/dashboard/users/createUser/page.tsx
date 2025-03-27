'use client'

import FormRegister from "@/components/ui/dashboard/user/form-register";
import { withPermission } from '@/components/ui/auth/withPermission';

const CreateUserPage = () => {
    return (
        <div className="flex flex-col justify-center items-center">
            <div className="grid grid-cols-12 grid-rows-auto gap-4 w-full lg:max-w-[1024px] card-box ">
                <div className="col-span-12 row-span-1 text-xl font-normal py-4">
                    Formulario creacion de usuario
                </div>
                <FormRegister />
            </div>
        </div>
    )
}

const ProtectedCreateUserPage = withPermission(CreateUserPage, '/dashboard/users/createUser');
export default ProtectedCreateUserPage;
