'use client';

import { Clock, UserCheck } from 'lucide-react';
import type { User } from '@/interfaces';

interface UserActivityCellProps {
  type: 'created' | 'lastActive';
  user: User;
}

export function formatShortDate(dateString: string | Date | null | undefined) {
  if (!dateString) return '-';
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  if (Number.isNaN(date.getTime())) return '-';

  return `${String(date.getDate()).padStart(2, '0')}-${String(
    date.getMonth() + 1
  ).padStart(2, '0')}-${String(date.getFullYear()).slice(-2)}`;
}

function getRelativeTime(dateString: string | Date | null | undefined) {
  if (!dateString) return 'Sin fecha';
  const targetDate = typeof dateString === 'string' ? new Date(dateString) : dateString;
  if (Number.isNaN(targetDate.getTime())) return 'Fecha inválida';

  const diffInDays = Math.floor(
    (new Date().getTime() - targetDate.getTime()) / (1000 * 60 * 60 * 24)
  );
  if (diffInDays === 0) return 'Hoy';
  if (diffInDays === 1) return 'Ayer';
  if (diffInDays < 7) return `Hace ${diffInDays} día${diffInDays > 1 ? 's' : ''}`;
  if (diffInDays < 30) {
    const weeks = Math.floor(diffInDays / 7);
    return `Hace ${weeks} semana${weeks > 1 ? 's' : ''}`;
  }
  if (diffInDays < 365) {
    const months = Math.floor(diffInDays / 30);
    return `Hace ${months} mes${months > 1 ? 'es' : ''}`;
  }
  const years = Math.floor(diffInDays / 365);
  return `Hace ${years} año${years > 1 ? 's' : ''}`;
}

export function UserActivityCell({ type, user }: UserActivityCellProps) {
  const isLastActive = type === 'lastActive';
  const date = isLastActive ? user.lastActive : user.createdAt;
  const Icon = isLastActive ? UserCheck : Clock;

  return (
    <div className="flex flex-col min-w-32">
      <div className="flex items-center gap-1">
        <Icon
          size={12}
          className={isLastActive && !user.lastActive ? 'text-gray-300' : isLastActive ? 'text-green-500' : 'text-gray-400'}
        />
        <p className="text-bold text-small">
          {isLastActive && !user.lastActive ? 'Sin actividad' : getRelativeTime(date)}
        </p>
      </div>
      {(!isLastActive || user.lastActive) && (
        <p className="text-xs text-default-500">{formatShortDate(date)}</p>
      )}
    </div>
  );
}