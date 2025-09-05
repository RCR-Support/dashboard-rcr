'use client';

import { Contract } from '@/interfaces/contract.interface';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Edit2, PlusCircle, User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ContractListProps {
  contracts?: Contract[];
  onEditContract?: (contract: Contract) => void;
  onAddContract?: () => void;
  isEditing?: boolean;
}

export const ContractList = ({
  contracts = [],
  onEditContract,
  onAddContract,
  isEditing = false,
}: ContractListProps) => {
  console.log('contracts', contracts);
  if (contracts.length === 0) {
    return (
      <div className="text-center py-8 text-slate-500 dark:text-slate-400">
        <p className=" underline pb-2">Aún no tienes contratos asignados.</p>

        {isEditing ? (
          <p className="text-sm">
            Utiliza el botón &quot;Agregar Contrato&quot; para comenzar.
          </p>
        ) : (
          <div className="space-y-2 text-slate-500 dark:text-slate-300">
            <p className="text-sm">Primero debes crear la empresa</p>
            <p className="text-sm">
              Una vez creada, podrás gestionar sus contratos.
            </p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-2 mt-4">
      {/* Encabezados de la tabla - visible solo en tablet y desktop */}
      <div className="hidden md:grid md:grid-cols-6 md:gap-4 md:px-4 md:py-1 md:font-semibold md:text-sm md:text-slate-500 dark:md:text-slate-200">
        <div>Nombre</div>
        <div>Número</div>
        <div>Fecha Inicio</div>
        <div>Fecha Fin</div>
        <div>Administrador</div>
        <div className="text-right">Acciones</div>
      </div>
      {/* Lista de contratos */}
      {contracts.map(contract => (
        <div
          key={contract.id}
          className={cn(
            // Estilos base
            'border rounded-lg border-slate-200 dark:border-slate-700',
            // Mobile: diseño en columnas
            'flex flex-col p-4 space-y-1 relative',
            // Tablet/Desktop: diseño en grid
            'md:grid md:grid-cols-6 md:gap-4 md:items-center md:space-y-0 md:p-4'
          )}
        >
          {/* Nombre del Contrato */}
          <h4 className="font-medium md:font-normal">
            {contract.contractName}
          </h4>
          {/* Número de Contrato */}
          <p className="text-sm text-slate-500 dark:text-slate-400">
            <span className="md:hidden">Número: </span>
            {contract.contractNumber}
          </p>

          {/* Fecha Inicio */}
          <div className="text-xs md:text-sm text-slate-500 dark:text-slate-400">
            <span className="md:hidden">Inicio: </span>
            {format(new Date(contract.initialDate), 'dd MMM yyyy', {
              locale: es,
            })}
          </div>

          {/* Fecha Fin */}
          <div className="text-xs md:text-sm text-slate-500 dark:text-slate-400">
            <span className="md:hidden">Fin: </span>
            {format(new Date(contract.finalDate), 'dd MMM yyyy', {
              locale: es,
            })}
          </div>

          {/* Administrador */}
          {contract.userAc && (
            <div className="flex items-center gap-2 text-xs md:text-sm text-slate-500 dark:text-slate-400">
              <User size={14} className="md:hidden" />
              <span className="md:hidden">Administrador: </span>
              {contract.userAc.displayName}
            </div>
          )}

          <div
            className={cn(
              // Base styles
              'flex justify-end',
              // Mobile: posición absoluta y z-index para estar sobre el contenido
              'absolute right-2 top-2 z-10',
              // Desktop: posición normal en la tabla
              'md:relative md:right-auto md:top-auto md:z-auto'
            )}
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEditContract?.(contract)}
              className={cn(
                // Mobile: botón circular con fondo
                'h-8 w-8 p-0 rounded-full bg-white dark:bg-gray-800 shadow-sm',
                'hover:bg-gray-100 dark:hover:bg-gray-700',
                'border border-gray-200 dark:border-gray-600',
                // Desktop: botón normal
                'md:h-auto md:w-auto md:p-2 md:rounded-md md:bg-transparent',
                'md:shadow-none md:border-none'
              )}
            >
              <Edit2 size={16} className="md:mr-2" />
              <span className="hidden md:inline">Editar</span>
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};
