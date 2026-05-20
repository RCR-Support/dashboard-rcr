'use client';
import { useRouter } from 'next/navigation';
import { deleteActivityServer, getActivityById } from './actions';
import { Tooltip } from '@heroui/tooltip';
import { Eye, Pencil, Trash2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { DeleteConfirmModal } from '@/components/ui/dashboard/activity/DeleteConfirmModal';
import { ActivityDetailModal } from '@/components/ui/dashboard/activity/ActivityDetailModal';
import { usePermissions } from '@/hooks/usePermissions';

export default function ActivityActions({
  activityId,
  activityName,
}: {
  activityId: string;
  activityName?: string;
}) {
  const router = useRouter();
  const { can } = usePermissions();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [name, setName] = useState(activityName || '');

  // ✅ Usar sistema de permisos granulares
  const canEditActivities = can('activities:edit');
  const canDeleteActivities = can('activities:delete');
  const canViewActivities = can('activities:view');

  useEffect(() => {
    // Si no tenemos el nombre de la actividad y no está cargando, intenta obtenerlo
    if (!activityName && !name) {
      const fetchActivityName = async () => {
        try {
          const activity = await getActivityById(activityId);
          if (activity) {
            setName(activity.name);
          }
        } catch {
          // Error al obtener el nombre de la actividad
        }
      };

      fetchActivityName();
    }
  }, [activityId, activityName, name]);

  const handleView = () => {
    setIsDetailModalOpen(true);
  };

  const handleEdit = () => {
    router.push(`/dashboard/activities/edit/${activityId}`);
  };

  const handleDeleteClick = () => {
    setIsConfirmModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!isDeleting) {
      setIsDeleting(true);
      try {
        await deleteActivityServer(activityId);
        setIsConfirmModalOpen(false);
        router.refresh();
      } catch {
        // Error al eliminar la actividad
      } finally {
        setIsDeleting(false);
      }
    }
  };

  return (
    <>
      {canViewActivities && (
        <div className="flex gap-3 mt-2 justify-center">
          <Tooltip content="Ver detalles">
            <button
              className="text-blue-500 hover:text-blue-700 transition-colors p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={handleView}
              aria-label="Ver detalles"
            >
              <Eye size={18} />
            </button>
          </Tooltip>

          {canEditActivities && (
            <Tooltip content="Editar actividad">
              <button
                className="text-yellow-500 hover:text-yellow-700 transition-colors p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={handleEdit}
                aria-label="Editar actividad"
              >
                <Pencil size={18} />
              </button>
            </Tooltip>
          )}

          {canDeleteActivities && (
            <Tooltip content="Eliminar actividad">
              <button
                className="text-red-500 hover:text-red-700 transition-colors p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={handleDeleteClick}
                disabled={isDeleting}
                aria-label="Eliminar actividad"
              >
                <Trash2 size={18} className={isDeleting ? 'opacity-50' : ''} />
              </button>
            </Tooltip>
          )}
        </div>
      )}

      {/* Modal de confirmación para eliminar */}
      <DeleteConfirmModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
        activityName={name}
      />

      {/* Modal de detalles de la actividad */}
      <ActivityDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        activityId={activityId}
      />
    </>
  );
}
