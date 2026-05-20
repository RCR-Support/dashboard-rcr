'use client';
import { useState, useMemo } from 'react';
import Image from 'next/image';
import { CiSearch } from 'react-icons/ci';
import { Button, Input } from '@heroui/react';
import { TbSortAscending2, TbSortDescending2 } from 'react-icons/tb';
import { FileText, Users, Shield, TrendingUp, Activity as ActivityIcon } from 'lucide-react';
import { Card, CardBody } from '@heroui/card';
import ActivityActions from '@/app/dashboard/activities/ActivityActions';

// Interfaz Activity enriquecida con métricas
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

export const CardActivity = ({ activities }: Props) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAscending, setIsAscending] = useState(true);

  // Calcular estadísticas reales
  const stats = useMemo(() => {
    const totalActivities = activities.length;
    const avgDocuments = totalActivities > 0
      ? (activities.reduce((sum, act) => sum + (act.requiredDocumentations?.length || 0), 0) / totalActivities).toFixed(1)
      : '0';
    
    return {
      totalActivities,
      avgDocuments,
      activitiesWithLicense: activities.filter(a => a.requiredDriverLicense).length,
      activitiesWithDocs: activities.filter(a => (a.requiredDocumentations?.length || 0) > 0).length,
    };
  }, [activities]);

  // Función para ordenar las actividades
  const sortActivities = () => {
    const sorted = [...filteredActivities].sort((a, b) => {
      const comparison = a.name.localeCompare(b.name);
      return isAscending ? comparison : -comparison;
    });
    return sorted;
  };

  // Filtramos las actividades según el término de búsqueda
  const filteredActivities = activities.filter(activity => {
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

  return (
    <>
      {/* Dashboard de Estadísticas */}
      <div className="col-span-12 mb-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-700">
            <CardBody className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500 rounded-lg">
                  <ActivityIcon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">Total Actividades</p>
                  <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{stats.totalActivities}</p>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-700">
            <CardBody className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500 rounded-lg">
                  <Users className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-green-600 dark:text-green-400 font-medium">Con Documentos</p>
                  <p className="text-2xl font-bold text-green-700 dark:text-green-300">{stats.activitiesWithDocs}</p>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-700">
            <CardBody className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500 rounded-lg">
                  <FileText className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-purple-600 dark:text-purple-400 font-medium">Docs Promedio</p>
                  <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">{stats.avgDocuments}</p>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-orange-200 dark:border-orange-700">
            <CardBody className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-500 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-orange-600 dark:text-orange-400 font-medium">Con Licencia</p>
                  <p className="text-2xl font-bold text-orange-700 dark:text-orange-300">{stats.activitiesWithLicense}</p>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
      {/* Barra de búsqueda y controles */}
      <div className="card-box col-span-12 flex flex-col sm:flex-row gap-4 justify-between items-center mb-4">
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

      {/* Grid de tarjetas de actividades mejoradas */}
      <div className="col-span-12">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {sortedActivities.map(activity => {
            return (
              <div
                key={activity.id}
                className="bg-white dark:bg-[#282c34] rounded-lg shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.02] overflow-hidden flex flex-col relative h-[320px]"
              >
                <div className="w-full h-48 relative overflow-hidden">
                  {activity.imageUrl ? (
                    <>
                      <Image
                        src={activity.imageUrl}
                        alt={activity.name}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover transition-transform duration-300 hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    </>
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center">
                      <span className="text-xl text-slate-500">Sin imagen</span>
                    </div>
                  )}

                  {/* Nombre superpuesto */}
                  <div className="absolute bottom-0 left-0 right-0 p-3 z-10">
                    <h3 className="font-semibold mb-2 text-center text-lg truncate max-w-full text-white drop-shadow-md" title={activity.name}>
                      {activity.name}
                    </h3>
                  </div>
                </div>
                
                {/* Sección de acciones */}
                <div className="w-full px-4 py-4 flex flex-col flex-grow border-t border-gray-100 dark:border-gray-700">
                  {/* Info de documentos y licencia */}
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-purple-500" />
                      <div>
                        <p className="text-xs text-gray-500">Documentos</p>
                        <p className="text-sm font-semibold">{activity.requiredDocumentations?.length || 0}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-blue-500" />
                      <div>
                        <p className="text-xs text-gray-500">Licencia</p>
                        <p className="text-sm font-semibold">{activity.requiredDriverLicense || 'No'}</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Botones de acción */}
                  <div className="w-full mt-auto">
                    <ActivityActions
                      activityId={activity.id}
                      activityName={activity.name}
                    />
                  </div>
                </div>
              </div>
            );
          })}

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
      </div>
    </>
  );
};
