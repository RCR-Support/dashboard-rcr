'use client';

import { Chip } from '@heroui/react';
import type { User } from '@/interfaces';

interface UserStatusCellProps {
  field: 'deletedLogic' | 'isActive';
  isLoading: boolean;
  isUpdating: boolean;
  onChange: (user: User, field: 'deletedLogic' | 'isActive') => void;
  user: User;
}

export function UserStatusCell({
  field,
  isLoading,
  isUpdating,
  onChange,
  user,
}: UserStatusCellProps) {
  const isDeletionStatus = field === 'deletedLogic';
  const label = isDeletionStatus
    ? user.deletedLogic
      ? 'Eliminado'
      : 'Activo'
    : user.isActive
      ? 'Habilitado'
      : 'Pendiente';
  const color = isDeletionStatus
    ? user.deletedLogic
      ? 'danger'
      : 'success'
    : user.isActive
      ? 'success'
      : 'warning';
  const icon = isDeletionStatus
    ? user.deletedLogic
      ? '❌'
      : '✅'
    : user.isActive
      ? '✅'
      : '⚠️';

  return (
    <button
      className="focus:outline-none"
      disabled={isUpdating}
      onClick={() => onChange(user, field)}
    >
      <Chip
        className="capitalize cursor-pointer flex items-center gap-1"
        color={color}
        size="sm"
        variant="flat"
      >
        <span className="mr-1">{icon}</span>
        {label}
        {isLoading && (
          <span className="loader w-3 h-3 border-2 border-t-2 border-t-transparent rounded-full animate-spin inline-block" />
        )}
      </Chip>
    </button>
  );
}