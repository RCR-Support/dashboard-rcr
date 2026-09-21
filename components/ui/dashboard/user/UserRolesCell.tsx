'use client';

import { Chip } from '@heroui/react';
import { Building2, Crown, Shield, UserCheck, Users } from 'lucide-react';
import type { User } from '@/interfaces';

const roleConfig = {
  admin: { name: 'Administrador', icon: Crown, color: 'danger' },
  sheq: { name: 'SHEQ', icon: Shield, color: 'primary' },
  adminContractor: { name: 'Admin Contrato', icon: Building2, color: 'secondary' },
  credential: { name: 'Credencial', icon: UserCheck, color: 'success' },
  user: { name: 'Usuario', icon: Users, color: 'default' },
};

export function UserRolesCell({ user }: { user: User }) {
  const lastLog = user.reassignmentLogs?.[0];
  const returnDate = lastLog?.returnDate ? new Date(lastLog.returnDate) : null;
  const returnPassed = Boolean(returnDate && returnDate < new Date());

  return (
    <div className="flex flex-col gap-1 min-w-48">
      <div className="flex items-center gap-1 flex-wrap">
        {Array.isArray(user.roles) && user.roles.length > 0 ? (
          user.roles.map(role => {
            const config = roleConfig[role as keyof typeof roleConfig] || {
              name: role,
              icon: Users,
              color: 'default',
            };
            const IconComponent = config.icon;
            return (
              <Chip
                key={role}
                size="sm"
                variant="flat"
                color={config.color as 'danger' | 'primary' | 'secondary' | 'success' | 'default'}
                startContent={<IconComponent size={12} />}
                className="capitalize"
              >
                {config.name}
              </Chip>
            );
          })
        ) : (
          <span className="text-default-500">N/A</span>
        )}
      </div>
      {user.roles?.includes('adminContractor') && (
        <div className="flex flex-col gap-1 mt-0.5">
          <div className="flex items-center gap-1 flex-wrap">
            <Chip
              size="sm"
              variant="dot"
              color={(user.contracts?.length ?? 0) === 0 ? 'default' : 'secondary'}
              className="text-xs"
            >
              {user.contracts?.length ?? 0} contrato{(user.contracts?.length ?? 0) !== 1 ? 's' : ''}
            </Chip>
            {!user.isActive && (
              <Chip size="sm" variant="flat" color="danger" className="text-xs">
                Sin responsable activo
              </Chip>
            )}
          </div>
          {lastLog?.mode === 'temporal' && (
            <Chip size="sm" variant="flat" color="warning" className="text-xs">
              {returnDate
                ? returnPassed
                  ? `Retorno: ${returnDate.toLocaleDateString('es-CL')} (pendiente)`
                  : `Ausente hasta ${returnDate.toLocaleDateString('es-CL')}`
                : 'Ausente (sin fecha de retorno)'}
            </Chip>
          )}
        </div>
      )}
    </div>
  );
}