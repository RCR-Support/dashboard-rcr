'use client';
import { useState, useMemo } from 'react';
import { Input } from '@heroui/react';
import { CiSearch } from 'react-icons/ci';
import { TbSortAscending2, TbSortDescending2 } from 'react-icons/tb';
import { FileText } from 'lucide-react';
import { Tooltip } from '@heroui/tooltip';
import { Chip } from '@heroui/chip';
import Image from 'next/image';
import ActivityActions from '@/app/dashboard/activities/ActivityActions';

// Interfaz Activity
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

export const TablaActivity = ({ activities }: Props) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: 'ascending' | 'descending';
  }>({
    key: 'name',
    direction: 'ascending',
  });

  // Función para solicitar ordenamiento
  const requestSort = (key: string) => {
    let direction: 'ascending' | 'descending' = 'ascending';

    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }

    setSortConfig({ key, direction });
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
  const sortedActivities = [...filteredActivities].sort((a, b) => {
    let valueA: string | number = '';
    let valueB: string | number = '';

    // Manejar diferentes tipos de ordenamiento
    switch (sortConfig.key) {
      case 'name':
        valueA = a.name;
        valueB = b.name;
        break;
      case 'documents':
        valueA = a.requiredDocumentations?.length || 0;
        valueB = b.requiredDocumentations?.length || 0;
        break;
      case 'license':
        valueA = a.requiredDriverLicense || '';
        valueB = b.requiredDriverLicense || '';
        break;
      default:
        valueA = '';
        valueB = '';
    }

    if (valueA < valueB) {
      return sortConfig.direction === 'ascending' ? -1 : 1;
    }
    if (valueA > valueB) {
      return sortConfig.direction === 'ascending' ? 1 : -1;
    }
    return 0;
  });

  return (
    <div className="col-span-12">
      <div className="mb-4">
        <div className="relative w-full md:w-96">
          <Input
            type="text"
            placeholder="Buscar actividades..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="pl-10 py-2 w-full"
          />
          <CiSearch
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={20}
          />
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th
                scope="col"
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-20"
              >
                Imagen
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => requestSort('name')}
              >
                <div className="flex items-center gap-1">
                  Nombre
                  {sortConfig.key === 'name' &&
                    (sortConfig.direction === 'ascending' ? (
                      <TbSortAscending2 className="w-4 h-4" />
                    ) : (
                      <TbSortDescending2 className="w-4 h-4" />
                    ))}
                </div>
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => requestSort('documents')}
              >
                <div className="flex items-center gap-1">
                  <FileText className="w-4 h-4" />
                  Documentos
                  {sortConfig.key === 'documents' &&
                    (sortConfig.direction === 'ascending' ? (
                      <TbSortAscending2 className="w-4 h-4" />
                    ) : (
                      <TbSortDescending2 className="w-4 h-4" />
                    ))}
                </div>
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => requestSort('license')}
              >
                <div className="flex items-center gap-1">
                  Licencia
                  {sortConfig.key === 'license' &&
                    (sortConfig.direction === 'ascending' ? (
                      <TbSortAscending2 className="w-4 h-4" />
                    ) : (
                      <TbSortDescending2 className="w-4 h-4" />
                    ))}
                </div>
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
              >
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-[#282c34] divide-y divide-gray-200 dark:divide-gray-700">
            {sortedActivities.length > 0 ? (
              sortedActivities.map(activity => {
                return (
                  <tr
                    key={activity.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                  >
                    <td className="px-4 py-3 whitespace-nowrap">
                      {activity.imageUrl ? (
                        <Image
                          src={activity.imageUrl}
                          alt={activity.name}
                          width={80}
                          height={40}
                          className="rounded bg-slate-300"
                        />
                      ) : (
                        <div className="w-20 h-10 rounded bg-slate-200 flex items-center justify-center">
                          <span className="text-xs text-slate-500">N/A</span>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900 dark:text-gray-100">
                        {activity.name}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-green-500" />
                        <span className="text-lg font-semibold text-green-600 dark:text-green-400">
                          {activity.requiredDocumentations?.length || 0}
                        </span>
                        {activity.requiredDocumentations && activity.requiredDocumentations.length > 0 && (
                          <Tooltip 
                            content={
                              <div className="p-2 max-w-xs">
                                <div className="font-semibold mb-1">Documentos requeridos:</div>
                                {activity.requiredDocumentations.map((doc, idx) => (
                                  <div key={idx} className="text-sm">• {doc.documentation.name}</div>
                                ))}
                              </div>
                            }
                          >
                            <span className="text-xs text-gray-400 cursor-help hover:text-gray-600">ⓘ</span>
                          </Tooltip>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {activity.requiredDriverLicense ? (
                        <div className="flex flex-wrap gap-1">
                          {activity.requiredDriverLicense
                            .split(',')
                            .map((license, index) => (
                              <Chip
                                key={index}
                                size="sm"
                                color="primary"
                                variant="flat"
                              >
                                {license.trim().toUpperCase()}
                              </Chip>
                            ))}
                        </div>
                      ) : (
                        <Chip size="sm" color="success" variant="flat">
                          NO REQUIERE
                        </Chip>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <ActivityActions
                        activityId={activity.id}
                        activityName={activity.name}
                      />
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td
                  colSpan={5}
                  className="text-center py-16 px-4"
                >
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                      <CiSearch className="text-gray-400 dark:text-gray-300" size={30} />
                    </div>
                    <h3 className="font-medium text-lg text-gray-700 dark:text-gray-200">
                      No se encontraron actividades
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 max-w-md">
                      No se encontraron actividades que coincidan con tu búsqueda. 
                      Prueba con otro término.
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
