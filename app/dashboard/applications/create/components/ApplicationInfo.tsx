'use client';

import { Contract } from '@/interfaces/contract.interface';

interface CompanyInfo {
  id?: string;
  name?: string;
  email?: string;
  phone?: string;
}

interface ApplicationInfoProps {
  companyInfo?: CompanyInfo;
  contractInfo?: Contract | null;
}

export function ApplicationInfo({ companyInfo = {}, contractInfo }: ApplicationInfoProps) {
  return (
    <div className="space-y-6 p-6 rounded-lg text-card-foreground bg-white shadow-xl dark:bg-[#282c34] dark:text-white">
      {/* Datos de la empresa */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Datos de la empresa</h3>
        <div className="space-y-2">
          <div className='flex gap-2 items-center'>
            <p className="text-sm text-muted-foreground">Nombre:</p>
            <p className="font-medium">{companyInfo.name || 'No disponible'}</p>
          </div>
          <div className='flex gap-2 items-center'>
            <p className="text-sm text-muted-foreground">Email:</p>
            <p className="font-medium">{companyInfo.email || 'No disponible'}</p>
          </div>
          <div className='flex gap-2 items-center'>
            <p className="text-sm text-muted-foreground">Teléfono:</p>
            <p className="font-medium">{companyInfo.phone || 'No disponible'}</p>
          </div>
        </div>
      </div>

      {/* Datos del contrato */}
      {contractInfo && (
        <>
        <div className='w-full border-b border-muted py-2'></div>
        <div>
          <h3 className="text-lg font-semibold mb-4">Datos del contrato</h3>
          <div className="space-y-2">
            <div className='flex gap-2 items-center'>
              <p className="text-sm text-muted-foreground">Número de contrato:</p>
              <p className="font-medium">{contractInfo.contractNumber || 'No disponible'}</p>
            </div>
            <div>
            
              <p className="text-sm text-muted-foreground">Administrador de contrato:</p>
              <p className="font-medium">{contractInfo.userAc?.displayName || 'No disponible'}</p>
              <p className="text-sm text-muted-foreground">{contractInfo.userAc?.email || 'No disponible'}</p>
            </div>
          </div>
        </div>
        </>
      )}
    </div>
  );
}
