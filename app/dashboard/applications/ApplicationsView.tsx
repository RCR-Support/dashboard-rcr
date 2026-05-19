'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { FaAddressCard } from 'react-icons/fa6';
import { PiUserListFill } from 'react-icons/pi';
import { Tooltip } from '@heroui/tooltip';
import { ApplicationsTable } from './components/ApplicationsTable';
import { ApplicationsCards } from './components/ApplicationsCards';

interface Application {
  id: string;
  workerName: string;
  workerPaternal: string;
  workerMaternal: string;
  workerRun: string;
  status: string;
  stateAc: string;
  stateSheq: string;
  licenseExpiration: Date | null;
  createdAt: Date;
  company?: {
    name: string | null;
  } | null;
  contract: {
    contractNumber: string;
    contractName: string;
  } | null;
  userAc?: {
    displayName: string;
    email: string;
  } | null;
  userSheq?: {
    displayName: string;
    email: string;
  } | null;
  activities: Array<{
    name: string;
  }>;
  documentationFiles: Array<{
    url: string;
    type: string;
    documentationId: string | null;
    expiresAt?: Date | string | null;
  }>;
}

interface Props {
  applications: Application[];
  userRole?: string;
  canEdit?: boolean;
  canDelete?: boolean;
}

export default function ApplicationsView({ applications, userRole, canEdit = false, canDelete = false }: Props) {
  const searchParams = useSearchParams();
  const view = searchParams?.get('view') || 'table'; // table por defecto
  const router = useRouter();

  const toggleView = (newView: 'cards' | 'table') => {
    const params = new URLSearchParams(searchParams?.toString() || '');
    params.set('view', newView);
    router.push(`?${params.toString()}`, { scroll: false });
  };

  return (
    <div
      className={`
        grid grid-cols-12 grid-rows-auto gap-4 w-full mx-auto
        ${view === 'cards' ? 'lg:max-w-[1280px]' : 'lg:max-w-[100%]'}
      `}
    >
      <div className="col-span-12 text-xl font-normal card-box flex justify-between">
        <h1>{view === 'cards' ? 'Cards de solicitudes' : 'Lista de solicitudes'}</h1>
        <div className="flex gap-4 items-center text-3xl dark:text-gray-400">
          <Tooltip content="Cards de solicitudes">
            <button
              onClick={() => toggleView('cards')}
              className={`hover:text-blue-400 ${view === 'cards' ? 'text-[#03c9d7]' : ''}`}
            >
              <FaAddressCard size={32} />
            </button>
          </Tooltip>
          <Tooltip content="Lista de solicitudes">
            <button
              onClick={() => toggleView('table')}
              className={`hover:text-blue-400 ${view === 'table' ? 'text-[#03c9d7]' : ''}`}
            >
              <PiUserListFill size={32} />
            </button>
          </Tooltip>
        </div>
      </div>

      {view === 'cards' ? (
        <ApplicationsCards applications={applications} userRole={userRole} canEdit={canEdit} canDelete={canDelete} />
      ) : (
        <div className="col-span-12 w-full">
          <ApplicationsTable applications={applications} userRole={userRole} canEdit={canEdit} canDelete={canDelete} />
        </div>
      )}
    </div>
  );
}
