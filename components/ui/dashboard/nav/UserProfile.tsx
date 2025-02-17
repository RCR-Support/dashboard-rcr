import {auth} from "@/auth";

import Avatar from '@mui/material/Avatar';
import { FaBell } from 'react-icons/fa';
function stringAvatar(name: string) {
        return {
        children: `${name.split(' ')[0][0]}${name.split(' ')[1][0]}`,
        };
    }

export default async function UserProfile  ()  {

    const session = await auth();


    const user = session && session.user;

    const roles = {
    admin: 'Administrador',
    user: 'Usuario',
    };

    const role = roles[session?.user?.role as keyof typeof roles];

    if (!session) {
        return <div>Not authenticated</div>;
    }

    return (
        <div className="flex items-center space-x-4 max-w-80">
            <div className="relative">
                <div className="rounded-full p-4 cursor-pointer">
                    <FaBell />
                </div>
                {/* {user.notifications > 0 && ( */}
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center h-5 w-5 text-xs font-bold leading-none text-red-100 bg-[#fb9678] rounded-full">
                        3
                    </span>
                {/* )} */}
            </div>
            <div className="relative">
                <Avatar {...stringAvatar(`${user?.name}`)} src="" className="bg-[#03c9d7]" />
            </div>
            <div className="flex flex-col">
                <p className="font-semibold truncate text-ellipsis w-44">{user?.name}</p>
                <span className="text-sm text-gray-500 truncate">{role}</span>
            </div>
        </div>
    );
};

