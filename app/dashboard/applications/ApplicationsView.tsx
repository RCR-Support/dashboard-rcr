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
  lastSubmittedAt: Date;
  company?: {
    name: string | null;
  } | null;
  contract: {
    id: string;
    contractNumber: string;
    contractName: string;
  } | null;
  userAc?: {
    id: string;
    displayName: string;
    email: string;
  } | null;
  userSheq?: {
    id: string;
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
  canViewAllSheq?: boolean;
  allSheqView?: boolean;
}

export default function ApplicationsView({ applications, userRole, canEdit = false, canDelete = false, canViewAllSheq = false, allSheqView = false }: Props) {
  const searchParams = useSearchParams();
  const selectedView = searchParams?.get('view') || 'table'; // table por defecto
  const view = allSheqView ? 'table' : selectedView;
  const router = useRouter();

  const toggleView = (newView: 'cards' | 'table') => {
    const params = new URLSearchParams(searchParams?.toString() || '');
    params.set('view', newView);
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const toggleSheqScope = (showAll: boolean) => {
    const params = new URLSearchParams(searchParams?.toString() || '');
    if (showAll) {
      params.set('scope', 'all');
      params.set('view', 'table');
    } else {
      params.delete('scope');
    }
    router.push(`/dashboard/applications?${params.toString()}`, { scroll: false });
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
        <div className="flex flex-wrap gap-3 items-center">
          {canViewAllSheq && (
            <div className="inline-flex rounded-lg border border-default-200 p-1 text-sm" role="group" aria-label="Alcance de solicitudes SHEQ">
              <button
                type="button"
                aria-pressed={!allSheqView}
                onClick={() => toggleSheqScope(false)}
                className={`rounded-md px-3 py-1.5 ${!allSheqView ? 'bg-primary text-white' : 'text-default-600 hover:bg-default-100'}`}
              >
                Mis solicitudes
              </button>
              <button
                type="button"
                aria-pressed={allSheqView}
                onClick={() => toggleSheqScope(true)}
                className={`rounded-md px-3 py-1.5 ${allSheqView ? 'bg-primary text-white' : 'text-default-600 hover:bg-default-100'}`}
              >
                Ver todas
              </button>
            </div>
          )}
          {!allSheqView && (
            <div className="flex gap-3 items-center text-3xl dark:text-gray-400">
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
          )}
        </div>
      </div>

      {view === 'cards' ? (
        <ApplicationsCards applications={applications} userRole={userRole} canEdit={canEdit} canDelete={canDelete} />
      ) : (
        <div className="col-span-12 w-full">
          <ApplicationsTable applications={applications} userRole={userRole} canEdit={canEdit} canDelete={canDelete} allSheqView={allSheqView} />
        </div>
      )}
    </div>
  );
}
