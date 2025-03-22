"use client";
import { signOut, useSession } from "next-auth/react";
import Avatar from '@mui/material/Avatar';
import { RiArrowDropDownLine } from "react-icons/ri";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem
} from "@heroui/dropdown";
import { useRoleStore } from "@/store/ui/roleStore";
import { useUserRoleContext } from "@/context/UserRoleContext";
import { useRouter } from "next/navigation";

interface UserInfoProfileProps {
  name: string;
  userName: string;
  email: string;
  role: string;
  image?: string;
}

function stringAvatar(name: string) {
  const words = name.split(" ");
  if (words.length < 2) return { children: words[0][0] };
  return {
    children: `${words[0][0]}${words[1][0]}`,
  };
}

const UserInfoProfile: React.FC<UserInfoProfileProps> = ({ name, userName, email, role, image }) => {
  const resetRole = useRoleStore((state) => state.resetRole);
  const { setShowRoleModal } = useUserRoleContext();
  
  const { data: session } = useSession(); // Añadimos esto para verificar los roles disponibles
  const router = useRouter();

  const handleLogout = async () => {
    resetRole();
    const result = await signOut({ redirect: false, callbackUrl: "/login" });
    console.log("Resultado de signOut:", result);
    if (result.url) {
      window.location.href = result.url;
    } else {
      window.location.href = "/login";
    }
  };

  const handleChangeRole = () => {
    console.log("UserInfoProfile: Cambiar rol - reseteando role-storage");
    // Borramos el rol seleccionado
    resetRole();
    // Forzamos un refresh de la página para que el DashboardLayout detecte que el rol es null y muestre el modal.
    window.location.reload();
  };
  const renderChangeRoleItem = () => {
    if (session?.user?.roles && session.user.roles.length > 1) {
      return (
        <DropdownItem
          key="change_role"
          textValue="Cambiar rol"
          onPress={handleChangeRole}
        >
          Cambiar rol
        </DropdownItem>
      );
    }
    return null;
  };

  return (
    <Dropdown placement="bottom-end">
      <DropdownTrigger>
        <div className="flex items-center gap-2 cursor-pointer">
          <Avatar {...stringAvatar(name)} src={image} className="bg-[#03c9d7] dark:bg-[#327f84] uppercase" />
          <div className="flex flex-col">
            <p className="font-semibold truncate text-ellipsis max-w-44">{name}</p>
            <span className="text-sm text-gray-500 truncate text-ellipsis max-w-44">{role}</span>
          </div>
          <RiArrowDropDownLine className="text-xl text-gray-500" />
        </div>
      </DropdownTrigger>
      <DropdownMenu aria-label="Profile Actions" variant="flat">
        <DropdownItem key="profile" className="h-14 gap-2" textValue="Profile">
          <p className="font-semibold truncate text-ellipsis max-w-44">{userName}</p>
          <div className="flex items-center gap-1">
            <span className="text-sm text-gray-500 truncate text-ellipsis max-w-44">{email}</span>
          </div>
        </DropdownItem>
        <DropdownItem key="settings" textValue="My Settings">My Settings</DropdownItem>
        <DropdownItem key="team_settings" textValue="Team Settings">Team Settings</DropdownItem>
        <DropdownItem key="analytics" textValue="Analytics">Analytics</DropdownItem>
        <DropdownItem key="system" textValue="System">System</DropdownItem>
        <DropdownItem key="configurations" textValue="Configurations">Configurations</DropdownItem>
        {renderChangeRoleItem()}
        <DropdownItem
          key="logout"
          color="danger"
          className="text-red-500 dark:text-red-400"
          textValue="Logout"
          onPress={handleLogout}
        >
          Salir
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
};

export default UserInfoProfile;
