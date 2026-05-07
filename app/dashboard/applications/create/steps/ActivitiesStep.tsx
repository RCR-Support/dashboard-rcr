import { useState, useMemo } from 'react';
import { Contract } from '@/interfaces/contract.interface';
import { StepNavigation } from '../components/StepNavigation';
import { Activity } from '@/app/dashboard/activities/interfaces';
import { ActivityDetailModal } from '@/components/ui/dashboard/activity/ActivityDetailModal';
import { ActivityCheckbox } from '@/components/ui/dashboard/activity/ActivityCheckbox';
import { Button } from '@heroui/button';
import { Input } from '@heroui/react';
import { CiSearch } from 'react-icons/ci';
import { TbSortAscending2, TbSortDescending2 } from 'react-icons/tb';
import { useApplicationFormStore } from '@/store/application-form-store';

interface ActivitiesStepProps {
  contract: Contract | null;
  onNext: (activities: Activity[]) => void;
  onBack: () => void;
}

const ActivitiesStep = ({ contract, onNext, onBack }: ActivitiesStepProps) => {
  const availableActivities = useApplicationFormStore(state => state.availableActivities);
  const selectedActivitiesFromStore = useApplicationFormStore(state => state.selectedActivities);
  const isLoadingActivities = useApplicationFormStore(state => state.isLoadingActivities);
  
  const [selectedActivityId, setSelectedActivityId] = useState<string | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAscending, setIsAscending] = useState(true);

  // Memorizar referencias al store para evitar re-renders innecesarios
  const activities = useMemo(
    () => availableActivities || [],
    [availableActivities]
  );
  const selectedActivities = useMemo(
    () => selectedActivitiesFromStore,
    [selectedActivitiesFromStore]
  );

  // Manejadores memorizados
  const handleToggleActivity = useMemo(
    () => (activity: Activity, isSelected: boolean) => {
      const store = useApplicationFormStore.getState();
      if (isSelected) {
        store.setSelectedActivities([...selectedActivities, activity]);
      } else {
        store.setSelectedActivities(
          selectedActivities.filter(a => a.id !== activity.id)
        );
      }
    },
    [selectedActivities]
  );

  const handleRemoveActivity = useMemo(
    () => (activityId: string) => {
      const store = useApplicationFormStore.getState();
      store.setSelectedActivities(
        selectedActivities.filter(a => a.id !== activityId)
      );
    },
    [selectedActivities]
  );

  // Función para ordenar las actividades
  const sortActivities = () => {
    const sorted = [...filteredActivities].sort((a, b) => {
      const comparison = a.name.localeCompare(b.name);
      return isAscending ? comparison : -comparison;
    });
    return sorted;
  };

  // Filtramos las actividades según el término de búsqueda
  const filteredActivities = (
    Array.isArray(activities) ? activities : []
  ).filter(activity => {
    const searchLower = searchTerm.toLowerCase();

    // Buscar en el nombre de la actividad
    if (activity.name.toLowerCase().includes(searchLower)) return true;

    // Buscar en la licencia requerida
    if (
      activity.requiredDriverLicense &&
      activity.requiredDriverLicense.toLowerCase().includes(searchLower)
    )
      return true;

    // Buscar en la documentación requerida
    if (
      activity.requiredDocumentations &&
      activity.requiredDocumentations.length > 0
    ) {
      return activity.requiredDocumentations.some(
        doc =>
          doc.documentation.name.toLowerCase().includes(searchLower) ||
          (doc.notes && doc.notes.toLowerCase().includes(searchLower))
      );
    }

    return false;
  });

  // Ordenamos las actividades filtradas
  const sortedActivities = sortActivities();

  const handleNext = () => {
    onNext(selectedActivities);
  };

  const openActivityModal = (activityId: string) => {
    setSelectedActivityId(activityId);
    setIsModalOpen(true);
  };

  if (!contract) {
    return (
      <div className="text-center space-y-4 py-8">
        <p className="text-muted-foreground">
          Por favor seleccione un contrato primero
        </p>
        <Button onPress={onBack} variant="flat">
          Volver
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 flex flex-col justify-between min-h-[390px]">
      <div>
        <h2 className="text-lg font-semibold mb-4">Seleccionar Actividades</h2>
        <p className="text-sm text-muted-foreground">
          Seleccione las actividades que el trabajador realizará en este
          contrato
        </p>
      </div>
      <div className="col-span-12 flex flex-col sm:flex-row gap-4 justify-between items-center mb-4">
        <div className="relative w-full sm:w-96">
          <Input
            type="text"
            placeholder="Buscar actividades... "
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full"
          />
          <CiSearch
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={20}
          />
        </div>
        <Button
          onPress={() => setIsAscending(!isAscending)}
          className="items-center gap-2 hidden md:flex"
        >
          {isAscending ? (
            <>
              <TbSortAscending2 size={20} />
              <span>A-Z</span>
            </>
          ) : (
            <>
              <TbSortDescending2 size={20} />
              <span>Z-A</span>
            </>
          )}
        </Button>
      </div>
      {/* Actividades seleccionadas */}
      {selectedActivities.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Actividades seleccionadas:
          </p>
          <div className="flex flex-wrap gap-2">
            {selectedActivities.map(activity => (
              <div
                key={activity.id}
                className="flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
              >
                <span>{activity.name}</span>
                <button
                  onClick={() => handleRemoveActivity(activity.id)}
                  className="ml-2 text-primary hover:text-primary/80 focus:outline-none"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lista de actividades */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 bg-slate-100 dark:bg-gray-900 max-h-[520px] overflow-y-auto">
        {!activities?.length ? (
          <div className="col-span-full flex justify-center items-center py-8">
            <div className="text-center space-y-3">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary mx-auto"></div>
              <p className="text-muted-foreground">Cargando actividades...</p>
            </div>
          </div>
        ) : (
          sortedActivities?.map(activity => (
            <div
              key={activity.id}
              className="p-4 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm hover:shadow-md transition-shadow bg-[#f0f0f0] dark:bg-[#1a202c]"
            >
              <div className="flex justify-between items-start">
                <p className="font-normal text-sm">{activity.name}</p>
                <ActivityCheckbox
                  isSelected={selectedActivities.some(
                    a => a.id === activity.id
                  )}
                  onValueChange={isSelected =>
                    handleToggleActivity(activity, isSelected)
                  }
                  label={`Seleccionar ${activity.name}`}
                />
              </div>
              {activity.requiredDocumentations &&
                activity.requiredDocumentations.length > 0 && (
                  <div className="mt-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onPress={() => {
                        openActivityModal(activity.id);
                      }}
                    >
                      Ver requisitos
                    </Button>
                  </div>
                )}
            </div>
          ))
        )}
        {/* Mensaje cuando no hay actividades que coincidan */}
        {!activities?.length ? null : (
          <div className="col-span-full">
            {sortedActivities.length === 0 && (
              <div className="col-span-full text-center py-16 px-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                    <CiSearch
                      className="text-gray-400 dark:text-gray-300"
                      size={30}
                    />
                  </div>
                  <h3 className="font-medium text-lg text-gray-700 dark:text-gray-200">
                    No se encontraron actividades
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 max-w-md">
                    No se encontraron actividades que coincidan con tu búsqueda.
                    Prueba con otro término o ajusta los filtros.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <StepNavigation
        onBack={onBack}
        currentStep={2}
        totalSteps={4}
        onNext={handleNext}
        isNextDisabled={selectedActivities.length === 0}
      />

      <ActivityDetailModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        activityId={selectedActivityId}
      />
    </div>
  );
};

export { ActivitiesStep };
