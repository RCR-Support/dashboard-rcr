'use client';
import { useState } from 'react';
import { signOut, useSession } from 'next-auth/react';
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from '@heroui/dropdown';
import { Building2, ChevronDown, KeyRound, LogOut, MapPin, Phone, RefreshCw, UserPen } from 'lucide-react';
import { useRoleStore } from '@/store/ui/roleStore';
import Image from 'next/image';
import ChangePasswordModal from './ChangePasswordModal';
import EditProfileModal from './EditProfileModal';

interface UserInfoProfileProps {
  name: string;
  email: string;
  role: string;
  image?: string;
}

function getInitials(name: string) {
  const words = name.trim().split(' ').filter(Boolean);
  if (words.length === 0) return '?';
  if (words.length === 1) return words[0][0].toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

const UserInfoProfile: React.FC<UserInfoProfileProps> = ({ name, email, role, image }) => {
  const resetRole = useRoleStore(state => state.resetRole);
  const { data: session } = useSession();
  const [changePwOpen, setChangePwOpen] = useState(false);
  const [editProfileOpen, setEditProfileOpen] = useState(false);

  const handleLogout = async () => {
    resetRole();
    // Borrar el cookie explícitamente para evitar que el rol persista entre sesiones
    useRoleStore.persist.clearStorage();
    const result = await signOut({ redirect: false, callbackUrl: '/login' });
    window.location.href = result?.url || '/login';
  };

  const handleChangeRole = () => {
    resetRole();
    window.location.reload();
  };

  const hasMultipleRoles = (session?.user?.roles?.length ?? 0) > 1;
  const company = session?.user?.company;

  return (
    <>
    <Dropdown placement="bottom-end">
      <DropdownTrigger>
        <button className="flex items-center gap-2 rounded-lg px-2 py-1 hover:bg-default-100 transition-colors outline-none">
          {/* Avatar */}
          <div className="relative h-9 w-9 shrink-0 rounded-full overflow-hidden bg-[#03c9d7] dark:bg-[#327f84] flex items-center justify-center text-white font-semibold text-sm select-none">
            {image ? (
              <Image src={image} alt={name} fill sizes="36px" className="object-cover" />
            ) : (
              getInitials(name)
            )}
          </div>

          {/* Nombre + rol */}
          <div className="flex flex-col items-start leading-tight hidden sm:flex">
            <span className="font-semibold text-sm truncate max-w-[140px]">{name}</span>
            <span className="text-xs text-default-500 truncate max-w-[140px]">{role}</span>
          </div>

          <ChevronDown className="h-4 w-4 text-default-400 shrink-0" />
        </button>
      </DropdownTrigger>

      <DropdownMenu aria-label="Opciones de perfil" variant="flat">
        {/* Info del usuario — no clickeable */}
        <DropdownItem
          key="profile"
          isReadOnly
          className="opacity-100 cursor-default"
          textValue="Perfil"
        >
          <div className="flex flex-col gap-1.5 py-1 min-w-[200px]">
            <div className="flex flex-col leading-tight">
              <span className="font-semibold text-sm">{name}</span>
              <span className="text-xs text-default-500">{email}</span>
              <span className="text-xs text-default-400">{role}</span>
            </div>
            {(company?.name || company?.phone || company?.city) && (
              <div className="flex flex-col gap-1 pt-1 border-t border-default-200">
                {company?.name && (
                  <div className="flex items-center gap-1.5 text-xs text-default-500">
                    <Building2 className="h-3 w-3 shrink-0 text-default-400" />
                    <span className="truncate">{company.name}</span>
                  </div>
                )}
                {company?.phone && (
                  <div className="flex items-center gap-1.5 text-xs text-default-500">
                    <Phone className="h-3 w-3 shrink-0 text-default-400" />
                    <span>{company.phone}</span>
                  </div>
                )}
                {company?.city && (
                  <div className="flex items-center gap-1.5 text-xs text-default-500">
                    <MapPin className="h-3 w-3 shrink-0 text-default-400" />
                    <span>{company.city}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </DropdownItem>

        {/* Cambiar rol — solo si tiene más de uno */}
        {hasMultipleRoles ? (
          <DropdownItem
            key="change_role"
            startContent={<RefreshCw className="h-4 w-4" />}
            onPress={handleChangeRole}
            textValue="Cambiar rol"
          >
            Cambiar rol
          </DropdownItem>
        ) : <DropdownItem key="empty" className="hidden" textValue="" />}

        <DropdownItem
          key="edit_profile"
          startContent={<UserPen className="h-4 w-4" />}
          onPress={() => setEditProfileOpen(true)}
          textValue="Editar perfil"
        >
          Editar perfil
        </DropdownItem>

        <DropdownItem
          key="change_password"
          startContent={<KeyRound className="h-4 w-4" />}
          onPress={() => setChangePwOpen(true)}
          textValue="Cambiar contraseña"
        >
          Cambiar contraseña
        </DropdownItem>

        <DropdownItem
          key="logout"
          color="danger"
          className="text-danger"
          startContent={<LogOut className="h-4 w-4" />}
          onPress={handleLogout}
          textValue="Cerrar sesión"
        >
          Cerrar sesión
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>

    <ChangePasswordModal isOpen={changePwOpen} onClose={() => setChangePwOpen(false)} />
    <EditProfileModal isOpen={editProfileOpen} onClose={() => setEditProfileOpen(false)} />
    </>
  );
};

export default UserInfoProfile;
