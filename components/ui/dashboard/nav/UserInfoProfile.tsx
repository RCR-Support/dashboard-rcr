'use client';
import { signOut } from "next-auth/react";
import Avatar from '@mui/material/Avatar';
import { RiArrowDropDownLine } from "react-icons/ri";
import {
    Dropdown,
    DropdownTrigger,
    DropdownMenu,
    DropdownItem
} from "@heroui/dropdown";

interface UserInfoProfileProps {
    name: string;
    email: string;
}

function stringAvatar(name: string) {
    return {
        children: `${name.split(' ')[0][0]}${name.split(' ')[1][0]}`,
    };
}

const UserInfoProfile: React.FC<UserInfoProfileProps> = ({ name, email }) => {

    const handleLogout = async () => {
        await signOut({
            callbackUrl: "/login",
        });
    };

    return (
        <Dropdown placement="bottom-end">
            <DropdownTrigger>
                <div className="flex items-center gap-2 cursor-pointer">
                    <Avatar {...stringAvatar(name)} src="" className="bg-[#03c9d7] dark:bg-[#327f84]" />
                    <div className="flex flex-col">
                        <p className="font-semibold truncate text-ellipsis max-w-44">{name}</p>
                        <span className="text-sm text-gray-500 truncate text-ellipsis max-w-44">{email}</span>
                    </div>
                    <RiArrowDropDownLine className="text-xl text-gray-500" />
                </div>
            </DropdownTrigger>
            <DropdownMenu aria-label="Profile Actions" variant="flat">
                <DropdownItem key="profile" className="h-14 gap-2" textValue='Profile'>
                    <p className="font-semibold truncate text-ellipsis max-w-44">{name}</p>
                    <div className="flex items-center gap-1">
                        <span className="text-sm text-gray-500 truncate text-ellipsis max-w-44">{email}</span>
                    </div>
                </DropdownItem>
                <DropdownItem   key="settings" textValue='My Settings'>My Settings</DropdownItem>
                <DropdownItem   key="team_settings" textValue='Team Settings'>Team Settings</DropdownItem>
                <DropdownItem   key="analytics" textValue='Analytics'>Analytics</DropdownItem>
                <DropdownItem   key="system" textValue='System'>System</DropdownItem>
                <DropdownItem   key="configurations" textValue='Configurations'>Configurations</DropdownItem>
                <DropdownItem   key="help_and_feedback" textValue='Help & Feedback'>Help & Feedback</DropdownItem>
                <DropdownItem   key="logout" color="danger"
                                className='text-red-500 dark:text-red-400' textValue='Logout'
                                onPress={handleLogout}>
                    Salir
                </DropdownItem>
            </DropdownMenu>
        </Dropdown>
    );
};

export default UserInfoProfile;
