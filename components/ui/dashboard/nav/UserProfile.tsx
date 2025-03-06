import { auth } from "@/auth";

import { db } from "@/lib/db";

import { FaBell } from 'react-icons/fa';
import UserInfoProfile from "./UserInfoProfile";

export default async function UserProfile() {
    const session = await auth();
    const user = session && session.user;

    const roles = {
        admin: 'Administrador',
        sheq: 'Sheq',
        adminContractor: 'Administrador de Contrato',
        user: 'Usuario',
        credential: 'Credenciales',
    };

    const role = roles[user?.role as keyof typeof roles];

    // Obtener los datos del usuario desde Prisma
    const userData = await db.user.findUnique({
        where: {
            email: user?.email as string,
        },
    })
    // console.log('los datos del usuario son:');
    // console.log(userData);

    if (!session) {
        return <div>Not authenticated</div>;
    }

    return (
        <div className="flex items-center space-x-4 max-w-80">
            <div className="relative">
                <div className="rounded-full p-4 cursor-pointer">
                    <FaBell />
                </div>
                <span className="absolute top-0 right-0 inline-flex items-center justify-center h-5 w-5 text-xs font-bold leading-none text-red-100 bg-[#fb9678] rounded-full">
                    3
                </span>
            </div>
            <UserInfoProfile
                name={`${userData?.displayName as string}`}
                userName={userData?.userName as string}
                email={userData?.email as string}
                role={role}
                image={userData?.image as string}
            />
        </div>
    );
}
