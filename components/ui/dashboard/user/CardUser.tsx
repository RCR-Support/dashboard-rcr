'use client';
import { useState, useTransition } from 'react';
import type { User } from '@/interfaces';
import Avatar from '@mui/material/Avatar';
import UserModal from './UserModal';
import { TfiPlus } from 'react-icons/tfi';
import { Button, Input } from '@heroui/react';
import { CiSearch } from 'react-icons/ci';
import { formatPhoneNumber } from '@/lib/formatPhoneNumber';
import { formatRun } from '../../../../lib/validations';
import { BlockDeleteModal } from '@/components/ui/block-delete-modal';
import { checkAssignedUsers } from '@/actions/user/get-checkAsignedUser';
import { AssignedUser } from '@/interfaces/admin.interface';
import { useRouter } from 'next/navigation';
import { RoleEnum } from '@prisma/client';
import { TbSortAscending2, TbSortDescending2 } from 'react-icons/tb';
import { Users, Crown, Shield, Building2, Calendar, Activity, UserCheck, UserX, Clock } from 'lucide-react';
import { Tooltip } from '@heroui/tooltip';

async function softDeleteUser(id: string, deletedLogic: boolean) {
  const res = await fetch('/api/users', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, deletedLogic }),
  });
  if (!res.ok) throw new Error('Error al eliminar usuario');
  return res.json();
}
async function permanentDeleteUser(id: string) {
  const res = await fetch('/api/users', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id }),
  });
  const data = await res.json();
  if (!res.ok) throw data;
  return data;
}
interface Props {
  users: User[];
}
export const CardUser = ({ users }: Props) => {
  const router = useRouter();
  
  // Calcular estadísticas
  const stats = {
    total: users.length,
    active: users.filter(u => u.isActive && !u.deletedLogic).length,
    inactive: users.filter(u => !u.isActive || u.deletedLogic).length,
    admins: users.filter(u => u.roles?.includes('admin') || u.roles?.includes('adminContractor')).length,
    companies: new Set(users.filter(u => u.company?.id).map(u => u.company!.id)).size,
    recentUsers: users.filter(u => {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      return u.createdAt ? new Date(u.createdAt) > oneWeekAgo : false;
    }).length
  };
  
  const [isOpen, setIsOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAscending, setIsAscending] = useState(true);
  const openModal = (user: User) => {
    setSelectedUser(user);
    setIsOpen(true);
  };
  const closeModal = () => {
    setIsOpen(false);
    setSelectedUser(null);
  };
  const handleEdit = () => {
    if (selectedUser) {
      router.push(`/dashboard/users/edit/${selectedUser.id}`);
    }
  };
  function stringAvatar(displayName: string) {
    const parts = displayName.trim().split(' ');
    const first = parts[0]?.[0] ?? '';
    const second = parts[1]?.[0] ?? '';
    return {
      children: `${first}${second}`,
    };
  }
  const normalizeText = (text: string) =>
    text.normalize('NFD').replace(/[\u0300-\u036f]/g, ''); // Elimina tildes y diéresis
  const normalizedFilter = normalizeText(searchTerm.toLowerCase());
  const filteredUsers = users.filter(
    user =>
      normalizeText(`${user.name} ${user.lastName} ${user.secondLastName}`)
        .toLowerCase()
        .includes(normalizedFilter) ||
      user.run?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);
  const [assignedUsers, setAssignedUsers] = useState<AssignedUser[]>([]);
  const [isPending, startTransition] = useTransition();

  // Función para obtener el rol principal del usuario
  const getPrimaryRole = (roles: string[] | undefined) => {
    if (!roles || roles.length === 0) return { name: 'Sin rol', color: 'bg-gray-500', icon: Users };
    
    const roleHierarchy = ['admin', 'sheq', 'adminContractor', 'credential', 'user'];
    const primaryRole = roleHierarchy.find(role => roles.includes(role)) || roles[0];
    
    const roleConfig = {
      admin: { name: 'Admin', color: 'bg-red-500', icon: Crown },
      sheq: { name: 'SHEQ', color: 'bg-blue-500', icon: Shield },
      adminContractor: { name: 'Admin Contrato', color: 'bg-purple-500', icon: Building2 },
      credential: { name: 'Credencial', color: 'bg-green-500', icon: UserCheck },
      user: { name: 'Usuario', color: 'bg-gray-500', icon: Users },
    };
    
    return roleConfig[primaryRole as keyof typeof roleConfig] || 
           { name: primaryRole, color: 'bg-gray-500', icon: Users };
  };

  const handlePermanentDelete = async () => {
    if (!selectedUser) return;
    const displayName = selectedUser.displayName;
    const input = window.prompt(
      `Esta acción NO SE PUEDE DESHACER.\nEl usuario "${displayName}" será eliminado permanentemente.\n\nEscribe ELIMINAR para confirmar:`
    );
    if (input !== 'ELIMINAR') return;
    try {
      await permanentDeleteUser(selectedUser.id);
      closeModal();
      router.refresh();
    } catch (err: unknown) {
      const errData = err as { error?: string; blockers?: string[] };
      const msg = errData?.blockers?.length
        ? `${errData.error}\n\nRegistros asociados:\n• ${errData.blockers.join('\n• ')}`
        : (errData?.error ?? 'Error inesperado');
      alert(msg);
    }
  };

  const handleDelete = async () => {
    if (!selectedUser) return;
    try {
      // 1. Verificar si es adminContractor y tiene usuarios asignados
      const adminCheck = await checkAssignedUsers(selectedUser.id);
      if (adminCheck && adminCheck.assignedUsers.length > 0) {
        setAssignedUsers(adminCheck.assignedUsers);
        setIsBlockModalOpen(true);
        return;
      }
      // 2. Si no es admin o no tiene usuarios, confirmar eliminación
      const confirmed = window.confirm(
        '¿Estás seguro de eliminar este usuario?'
      );
      if (!confirmed) return;
      startTransition(async () => {
        try {
          await softDeleteUser(selectedUser.id, true);
          closeModal();
          router.refresh();
        } catch {
          alert('Error al eliminar el usuario');
        }
      });
    } catch {
      alert('Error al verificar el usuario');
    }
  };

  const toggleSortOrder = () => {
    setIsAscending(!isAscending);
  };

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    if (isAscending) {
      return a.name.localeCompare(b.name);
    } else {
      return b.name.localeCompare(a.name);
    }
  });

  return (
    <>
      {/* Dashboard de Estadísticas */}
      <div className="w-full col-span-12 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Usuarios */}
          <Tooltip content="Número total de usuarios registrados en el sistema">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 rounded-lg text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium opacity-90">Total Usuarios</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <Users size={24} className="opacity-80" />
              </div>
            </div>
          </Tooltip>

          {/* Usuarios Activos */}
          <Tooltip content="Usuarios habilitados y sin eliminar">
            <div className="bg-gradient-to-r from-green-500 to-green-600 p-4 rounded-lg text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium opacity-90">Activos</p>
                  <p className="text-2xl font-bold">{stats.active}</p>
                  <p className="text-xs opacity-75">{Math.round((stats.active / stats.total) * 100)}% del total</p>
                </div>
                <UserCheck size={24} className="opacity-80" />
              </div>
            </div>
          </Tooltip>

          {/* Administradores */}
          <Tooltip content="Usuarios con roles administrativos (Admin y Admin Contrato)">
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-4 rounded-lg text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium opacity-90">Administradores</p>
                  <p className="text-2xl font-bold">{stats.admins}</p>
                  <p className="text-xs opacity-75">{Math.round((stats.admins / stats.total) * 100)}% del total</p>
                </div>
                <Crown size={24} className="opacity-80" />
              </div>
            </div>
          </Tooltip>

          {/* Usuarios Recientes */}
          <Tooltip content="Usuarios registrados en los últimos 7 días">
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-4 rounded-lg text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium opacity-90">Nuevos (7d)</p>
                  <p className="text-2xl font-bold">{stats.recentUsers}</p>
                  <p className="text-xs opacity-75">{stats.companies} empresas</p>
                </div>
                <Activity size={24} className="opacity-80" />
              </div>
            </div>
          </Tooltip>
        </div>
      </div>

      <div className="w-full card-box col-span-12">
        <div className="flex flex-col gap-4">
          <div className="flex justify-between   gap-3 items-end">
            <Input
              isClearable
              classNames={{
                inputWrapper: 'border-1 md:w-1/2',
              }}
              placeholder="Buscar por nombre o RUN..."
              size="sm"
              startContent={<CiSearch className="text-default-300" />}
              value={searchTerm}
              variant="bordered"
              onClear={() => setSearchTerm('')}
              onValueChange={setSearchTerm}
            />
            <button onClick={toggleSortOrder}>
              {isAscending ? (
                <TbSortAscending2 className="text-2xl" />
              ) : (
                <TbSortDescending2 className="text-2xl" />
              )}
            </button>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-12 grid-rows-auto gap-4 w-full col-span-12 mt-6">
        {sortedUsers.map(user => {
          const primaryRole = getPrimaryRole(user.roles);
          const isActive = user.isActive && !user.deletedLogic;
          const createdDate = user.createdAt ? new Date(user.createdAt) : new Date();
          const isRecent = (Date.now() - createdDate.getTime()) < (7 * 24 * 60 * 60 * 1000);

          return (
            <Tooltip 
              key={user.id}
              content={
                <div className="p-2">
                  <p className="font-semibold">{user.displayName}</p>
                  <p className="text-sm">{user.email}</p>
                  <p className="text-sm">RUN: {user.run ? formatRun(user.run) : 'N/A'}</p>
                  <p className="text-sm">Empresa: {user.company?.name || 'Sin empresa'}</p>
                  <p className="text-sm">Estado: {isActive ? 'Activo' : 'Inactivo'}</p>
                  <p className="text-sm">Creado: {createdDate.toLocaleDateString('es-CL')}</p>
                </div>
              }
            >
              <button
                onClick={() => openModal(user)}
                className="col-span-6 md:col-span-6 xl:col-span-3 card-box hover:shadow-lg transition-all duration-200 relative"
              >
                {/* Badge de estado */}
                <div className="absolute top-2 right-2 flex gap-1">
                  {isRecent && (
                    <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full">
                      Nuevo
                    </span>
                  )}
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    isActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {isActive ? 'Activo' : 'Inactivo'}
                  </span>
                </div>

                <div className="flex flex-col gap-3 p-2">
                  {/* Avatar y información básica */}
                  <div className="flex items-center gap-3">
                    <Avatar
                      {...stringAvatar(user.displayName.toUpperCase())}
                      src={user.image || ''}
                      sx={{ width: 48, height: 48 }}
                      className={
                        user.image ? 'bg-white' : 'bg-[#03c9d7] dark:bg-[#327f84]'
                      }
                    />
                    <div className="flex-1 text-left">
                      <div className="font-semibold truncate text-sm">
                        {user.userName}
                      </div>
                      <div className="text-xs text-gray-500 truncate">
                        {user.email}
                      </div>
                    </div>
                  </div>

                  {/* Badge de rol principal */}
                  <div className="flex items-center justify-center">
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium text-white ${primaryRole.color}`}>
                      <primaryRole.icon size={12} />
                      {primaryRole.name}
                    </span>
                  </div>

                  {/* Información adicional */}
                  <div className="text-xs text-gray-500 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Building2 size={12} />
                      <span className="truncate">
                        {user.company?.name || 'Sin empresa'}
                      </span>
                    </div>
                  </div>

                  {/* Indicador de última actividad */}
                  <div className="flex items-center justify-center gap-1 text-xs text-gray-400">
                    <Clock size={12} />
                    <span>
                      Creado {createdDate.toLocaleDateString('es-CL')}
                    </span>
                  </div>
                </div>
              </button>
            </Tooltip>
          );
        })}

        {/* Modal de bloqueo */}
        <BlockDeleteModal
          isOpen={isBlockModalOpen}
          onClose={() => setIsBlockModalOpen(false)}
          assignedUsers={assignedUsers}
          adminName={selectedUser?.displayName || ''}
        />
        <UserModal user={selectedUser} isOpen={isOpen} onClose={closeModal} onEdit={handleEdit} onDelete={handleDelete} onPermanentDelete={handlePermanentDelete} />
      </div>
    </>
  );
};
