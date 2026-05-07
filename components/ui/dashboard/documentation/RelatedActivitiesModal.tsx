import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { listRelatedActivities } from '@/actions/documentations/list-related-activities';

interface RelatedActivitiesModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentationId: string;
  documentationName: string;
}

interface RelatedActivity {
  id: string;
  name: string;
  requiredDocumentations: {
    isSpecific: boolean;
    notes: string | null;
    quantity: number | null;
  }[];
}

export function RelatedActivitiesModal({
  isOpen,
  onClose,
  documentationId,
  documentationName,
}: RelatedActivitiesModalProps) {
  const [activities, setActivities] = useState<RelatedActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      const loadActivities = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const relatedActivities =
            await listRelatedActivities(documentationId);
          setActivities(relatedActivities);
        } catch (error) {
          setError('Error al cargar las actividades relacionadas');
        } finally {
          setIsLoading(false);
        }
      };

      loadActivities();
    }
  }, [isOpen, documentationId]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold">
              Actividades que requieren:
            </h2>
            <p className="text-blue-600 dark:text-blue-400 font-medium mt-1">
              {documentationName}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent"></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-md">
              {error}
            </div>
          ) : activities.length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              No hay actividades que requieran este documento.
            </div>
          ) : (
            <div className="space-y-3">
              {activities.map(activity => {
                const docDetails = activity.requiredDocumentations[0];
                return (
                  <div
                    key={activity.id}
                    className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 dark:text-gray-100">
                          {activity.name}
                        </h3>
                        {docDetails.notes && (
                          <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                            {docDetails.notes}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {docDetails.isSpecific && (
                          <span className="bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 text-xs px-2 py-1 rounded-full">
                            Específico
                          </span>
                        )}
                        {docDetails.quantity && (
                          <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs px-2 py-1 rounded-full">
                            {docDetails.quantity}{' '}
                            {docDetails.quantity > 1 ? 'copias' : 'copia'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
