'use client';

import { Mail, Phone } from 'lucide-react';
import type { User } from '@/interfaces';
import { formatPhoneNumber } from '@/lib/formatPhoneNumber';

export function UserContactCell({ user }: { user: User }) {
  return (
    <div className="flex flex-col min-w-36 gap-1">
      <div className="flex items-center gap-1">
        <Mail size={12} className="text-gray-400" />
        <p className="text-bold text-small truncate">{user.email || 'N/A'}</p>
      </div>
      <div className="flex items-center gap-1">
        <Phone size={12} className="text-gray-400" />
        <p className="text-xs text-default-500">
          {user.phoneNumber ? formatPhoneNumber(user.phoneNumber) : '-'}
        </p>
      </div>
    </div>
  );
}