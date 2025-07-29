'use client';
import { useState, useEffect } from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@heroui/modal";
import { Button } from "@heroui/react";
import { Pencil, FileText } from "lucide-react";
import { IoClose } from "react-icons/io5";
import Image from 'next/image';
import { getActivityById } from "@/app/dashboard/activities/actions";
import { useRouter } from 'next/navigation';

interface ActivityDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  activityId: string | null;
}

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

export function ActivityDetailModal({ isOpen, onClose, activityId }: ActivityDetailModalProps) {
  const router = useRouter();
  const [activity, setActivity] = useState<Activity | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && activityId) {
      const fetchActivity = async () => {
        setLoading(true);
        setError(null);
        try {
          const data = await getActivityById(activityId);
          setActivity(data);
        } catch (err) {
          console.error("Error al cargar los detalles de la actividad:", err);
          setError("No se pudieron cargar los detalles de la actividad. Por favor, inténtalo de nuevo.");
        } finally {
          setLoading(false);
        }
      };

      fetchActivity();
    } else {
      setActivity(null);
    }
  }, [isOpen, activityId]);

  const handleEdit = () => {
    if (activityId) {
      onClose();
      router.push(`/dashboard/activities/edit/${activityId}`);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl" backdrop='blur' scrollBehavior="inside">
      <ModalContent>
        <ModalHeader className='flex flex-col'>
          Información de la actividad
          {activity && (
            <span className="text-[#03c9d7] text-sm font-semibold">
              {activity.name}
            </span>
          )}
        </ModalHeader>
        
        <ModalBody>
          {loading ? (
            <div className="py-8 text-center">
              <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
              <p className="mt-3 text-gray-500">Cargando detalles...</p>
            </div>
          ) : error ? (
            <div className="py-8 text-center text-red-500">{error}</div>
          ) : activity ? (
            <div className="space-y-4">
              {/* Imagen de la actividad */}
              <div className="flex justify-center mb-6">
                {activity.imageUrl ? (
                  <div className="w-full max-w-sm h-64 relative rounded-lg overflow-hidden">
                    <Image
                      src={activity.imageUrl}
                      alt={activity.name}
                      fill
                      sizes="(max-width: 640px) 100vw, 400px"
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-full max-w-sm h-64 rounded-lg bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center">
                    <span className="text-xl text-slate-500">Sin imagen</span>
                  </div>
                )}
              </div>

              {/* Licencias requeridas */}
              <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
                <h3 className="font-medium text-base mb-3 flex items-center gap-2 text-gray-800 dark:text-gray-200">
                  <span>Licencia requerida</span>
                </h3>
                <div className="flex flex-wrap gap-2">
                  {activity.requiredDriverLicense ? (
                    activity.requiredDriverLicense.split(',').map((license, index) => (
                      <span 
                        key={index} 
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-800/50 dark:text-blue-100"
                      >
                        {license.trim().toUpperCase()}
                      </span>
                    ))
                  ) : (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-800/50 dark:text-green-100">
                      NO REQUIERE LICENCIA
                    </span>
                  )}
                </div>
              </div>

              {/* Documentación requerida */}
              {activity.requiredDocumentations && activity.requiredDocumentations.length > 0 && (
                <>
                  <div className="my-4"></div>
                  <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
                    <h3 className="font-medium text-base mb-3 flex items-center gap-2 text-gray-800 dark:text-gray-200">
                      Documentación requerida
                      <span className="text-xs bg-amber-100 dark:bg-amber-900/30 px-2.5 py-1 rounded-full text-amber-700 dark:text-amber-300 font-semibold">
                        {activity.requiredDocumentations.length}
                      </span>
                    </h3>
                    <div className="space-y-3">
                      {activity.requiredDocumentations.map(doc => (
                        <div
                          key={doc.id}
                          className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700"
                        >
                          <div className="flex items-start gap-3">
                            <FileText className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                            <div className="flex-1">
                              <p className="font-medium text-base">
                                {doc.documentation.name}
                              </p>
                              {doc.notes && (
                                <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 border-l-2 border-gray-200 dark:border-gray-700 pl-3">
                                  {doc.notes}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="py-8 text-center text-gray-500">No se encontró la actividad seleccionada.</div>
          )}
        </ModalBody>
        
        <ModalFooter className="flex justify-between items-center">
          <Button
            color="default"
            className="self-start text-left text-default-500 hover:bg-default-100 dark:hover:bg-default-800 dark:hover:text-neutral-800"
            variant="flat"
            onPress={onClose}
            startContent={<IoClose className="h-4 w-4" />}
          >
            Cerrar
          </Button>
          <div className="flex gap-4">
            <Button
              color="success"
              variant="flat"
              onPress={handleEdit}
              startContent={<Pencil className="h-4 w-4" />}
              disabled={!activity}
            >
              Editar
            </Button>
          </div>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
