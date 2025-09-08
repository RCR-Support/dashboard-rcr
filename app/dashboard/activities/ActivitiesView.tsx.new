'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { CardActivity } from '@/components/ui/dashboard/activity/CardActivity';
import { TablaActivity } from '@/components/ui/dashboard/activity/TablaActivity';
import { VIEW_TYPES, ViewProps, ViewType } from './interfaces';
import { CardViewButton, TableViewButton } from './ViewButtons';

export default function ActivitiesView({ activities }: ViewProps) {
  const searchParams = useSearchParams();
  const view = (searchParams?.get('view') || VIEW_TYPES.CARDS) as ViewType;
  const router = useRouter();

  const toggleView = (newView: ViewType) => {
    const params = new URLSearchParams(searchParams?.toString() || '');
    params.set('view', newView);
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const isCardsView = view === VIEW_TYPES.CARDS;

  return (
    <div
      className={`
        grid grid-cols-12 grid-rows-auto gap-4 w-full mx-auto
        ${isCardsView ? 'lg:max-w-[1280px]' : 'lg:max-w-[100%]'}
      `}
    >
      <div className="col-span-12 text-xl font-normal card-box flex justify-between">
        <h1>
          {isCardsView ? 'Tarjetas de actividades' : 'Lista de actividades'}
        </h1>
        <div className="flex gap-4 items-center text-3xl dark:text-gray-400">
          <CardViewButton currentView={view} onToggle={toggleView} />
          <TableViewButton currentView={view} onToggle={toggleView} />
        </div>
      </div>

      {isCardsView ? (
        <CardActivity activities={activities} />
      ) : (
        <TablaActivity activities={activities} />
      )}
    </div>
  );
}
