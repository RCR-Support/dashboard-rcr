'use client';

import { Building2, Link2 } from 'lucide-react';
import type { User } from '@/interfaces';
import { formatRun } from '@/lib/validations';

interface UserCompanyCellProps {
  isLoading: boolean;
  onOpenCompany: (companyId: string, companyName: string) => void;
  user: User;
}

export function UserCompanyCell({
  isLoading,
  onOpenCompany,
  user,
}: UserCompanyCellProps) {
  return (
    <div className="flex flex-col min-w-32 max-w-56">
      <div className="flex items-center gap-1">
        <Building2 size={12} className="text-gray-400" />
        <p className="text-bold text-small capitalize truncate text-ellipsis max-w-52">
          {user.company?.id ? (
            <button
              onClick={() => onOpenCompany(user.company!.id, user.company!.name ?? '')}
              disabled={isLoading}
              className="text-primary hover:underline disabled:opacity-50 disabled:cursor-wait"
            >
              {isLoading ? 'Cargando...' : user.company.name}
            </button>
          ) : (
            user.company?.name || 'Sin empresa'
          )}
        </p>
      </div>
      <p className="text-bold text-tiny capitalize text-default-500">
        {user.company?.rut ? formatRun(user.company.rut) : 'N/A'}
      </p>
      {user.asSubcontractor && user.asSubcontractor.length > 0 && (
        <div className="mt-1 flex flex-col gap-0.5">
          {user.asSubcontractor.map((subcontract, index) => (
            <span
              key={index}
              title={`Representante subcontrato — Sub de: ${subcontract.mandanteName ?? 'Empresa mandante'} — Contrato: ${subcontract.contractName}`}
              className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full bg-cyan-100 dark:bg-cyan-900/40 text-cyan-700 dark:text-cyan-300 font-medium truncate max-w-full"
            >
              <Link2 size={9} className="shrink-0" />
              Rep. Sub de: {subcontract.mandanteName ?? '—'}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}