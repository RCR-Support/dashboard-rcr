import { auth } from "@/auth";
import Avatar from '@mui/material/Avatar';
import { FaBell } from 'react-icons/fa';
import UserInfoProfile from "./UserInfoProfile";

export default async function UserProfile() {
    const session = await auth();
    const user = session && session.user;

    const roles = {
        admin: 'Administrador',
        sheq: 'Sheq',
        user: 'Usuario',
    };

    const role = roles[user?.role as keyof typeof roles];

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
            <UserInfoProfile name={user?.name || ''} email={user?.email || ''} />
        </div>
    );
}
