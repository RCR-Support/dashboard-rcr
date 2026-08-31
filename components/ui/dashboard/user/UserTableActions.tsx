import { Button, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger } from '@heroui/react';
import { ArrowRightLeft, Edit3, ToggleLeft, ToggleRight, Trash2, UserCheck, Users, UserX } from 'lucide-react';
import Link from 'next/link';
import { HiDotsVertical } from 'react-icons/hi';
import type { User } from '@/interfaces';
import type { PendingReturnLog } from './ReturnContractsModal';

interface UserTableActionsProps {
  user: User;
  onView: (user: User) => void;
  onChangeField: (user: User, field: 'isActive' | 'deletedLogic') => void;
  onPermanentDelete: (user: User) => void;
  onReassign: (user: User) => void;
  onReturnContracts: (user: User, pendingLogs: PendingReturnLog[]) => void;
}

export function UserTableActions({
  user,
  onView,
  onChangeField,
  onPermanentDelete,
  onReassign,
  onReturnContracts,
}: UserTableActionsProps) {
  const pendingReturnLogs = (user.reassignmentLogs ?? []).filter(
    (log) => log.mode === 'temporal' && !log.returnedAt
  ) as PendingReturnLog[];
  const isAdminContractor = user.roles?.includes('adminContractor');

  return (
    <div className="relative flex justify-end items-center gap-2">
      <Dropdown className="bg-default-100 border-1 border-default-200 w-[90px]">
        <DropdownTrigger>
          <Button isIconOnly radius="full" size="sm" variant="light" aria-label="Acciones de usuario">
            <HiDotsVertical size={16} className="text-default-400" />
          </Button>
        </DropdownTrigger>
        <DropdownMenu className="flex gap-6 text-slate-500 dark:text-slate-300">
          <DropdownItem key="view" startContent={<Users size={16} className="text-primary" />} onPress={() => onView(user)}>
            Ver más
          </DropdownItem>
          <DropdownItem key="edit" startContent={<Edit3 size={16} className="text-primary" />}>
            <Link href={`/dashboard/users/edit/${user.id}`} className="block w-full h-full">Editar</Link>
          </DropdownItem>
          <DropdownItem
            key="toggleActive"
            startContent={user.isActive ? <ToggleRight size={16} className="text-warning" /> : <ToggleLeft size={16} className="text-success" />}
            onPress={() => onChangeField(user, 'isActive')}
          >
            {user.isActive ? 'Deshabilitar' : 'Habilitar'}
          </DropdownItem>
          <DropdownItem
            key="toggleDeleted"
            startContent={user.deletedLogic ? <UserCheck size={16} className="text-success" /> : <UserX size={16} className="text-danger" />}
            onPress={() => onChangeField(user, 'deletedLogic')}
          >
            {user.deletedLogic ? 'Restaurar' : 'Eliminar'}
          </DropdownItem>
          {user.deletedLogic ? (
            <DropdownItem
              key="permanentDelete"
              startContent={<Trash2 size={16} className="text-danger" />}
              className="text-danger"
              color="danger"
              onPress={() => onPermanentDelete(user)}
            >
              Eliminar definitivo
            </DropdownItem>
          ) : null}
          {isAdminContractor ? (
            <DropdownItem key="reassign" startContent={<ArrowRightLeft size={16} className="text-secondary" />} onPress={() => onReassign(user)}>
              Traspasar contratos
            </DropdownItem>
          ) : null}
          {isAdminContractor && pendingReturnLogs.length > 0 ? (
            <DropdownItem
              key="returnContracts"
              startContent={<ArrowRightLeft size={16} className="text-success" />}
              onPress={() => onReturnContracts(user, pendingReturnLogs)}
            >
              Devolver contratos ({pendingReturnLogs.length})
            </DropdownItem>
          ) : null}
        </DropdownMenu>
      </Dropdown>
    </div>
  );
}