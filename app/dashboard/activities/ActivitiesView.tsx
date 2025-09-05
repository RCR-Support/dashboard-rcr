'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { FaAddressCard } from 'react-icons/fa6';
import { PiUserListFill } from 'react-icons/pi';
import { Tooltip } from '@heroui/tooltip';
import { CardActivity } from '@/components/ui/dashboard/activity/CardActivity';
import { TablaActivity } from '@/components/ui/dashboard/activity/TablaActivity';

// Definimos la interfaz Activity basada en el uso actual
interface Activity {
  id: string;
  name: string;
  imageUrl: string | null;
  requiredDriverLicense: string | null;
  requiredDocumentations?: {
    id: string;
    documentation: {
      id: string;
      name: string;
    };
    notes?: string | null;
  }[];
}

interface Props {
  activities: Activity[];
}

export default function ActivitiesView({ activities }: Props) {
  const searchParams = useSearchParams();
  const view = searchParams?.get('view') || 'cards'; // cards por defecto
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
        <h1>
          {view === 'cards'
            ? 'Tarjetas de actividades'
            : 'Lista de actividades'}
        </h1>
        <div className="flex gap-4 items-center text-3xl dark:text-gray-400">
          <Tooltip content="Tarjetas de actividades">
            <button
              onClick={() => toggleView('cards')}
              className={`hover:text-blue-400 ${view === 'cards' ? 'text-[#03c9d7]' : ''}`}
            >
              <FaAddressCard size={32} />
            </button>
          </Tooltip>
          <Tooltip content="Lista de actividades">
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
        <CardActivity activities={activities} />
      ) : (
        <TablaActivity activities={activities} />
      )}
    </div>
  );
}
