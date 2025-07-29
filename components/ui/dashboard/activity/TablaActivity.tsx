'use client';
import { useState } from 'react';
import { Input } from '@heroui/react';
import { CiSearch } from "react-icons/ci";
import Image from 'next/image';
import { TbSortAscending2, TbSortDescending2 } from 'react-icons/tb';
import ActivityActions from '@/app/dashboard/activities/ActivityActions';

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

export const TablaActivity = ({ activities }: Props) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [sortConfig, setSortConfig] = useState<{
        key: keyof Activity;
        direction: 'ascending' | 'descending';
    }>({
        key: 'name',
        direction: 'ascending'
    });

    // Función para ordenar las actividades
    const requestSort = (key: keyof Activity) => {
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
        if (activity.requiredDriverLicense && 
            activity.requiredDriverLicense.toLowerCase().includes(searchLower)) return true;
        
        // Buscar en la documentación requerida
        if (activity.requiredDocumentations && activity.requiredDocumentations.length > 0) {
            return activity.requiredDocumentations.some(doc => 
                doc.documentation.name.toLowerCase().includes(searchLower) ||
                (doc.notes && doc.notes.toLowerCase().includes(searchLower))
            );
        }
        
        return false;
    });

    // Ordenamos las actividades filtradas
    const sortedActivities = [...filteredActivities].sort((a, b) => {
        const valueA = a[sortConfig.key] || '';
        const valueB = b[sortConfig.key] || '';
        
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
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 py-2 w-full"
                    />
                    <CiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                </div>
            </div>

            <div className="overflow-x-auto">
                {/* Usamos una tabla HTML estándar en lugar de los componentes de @heroui/table */}
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                        <tr>
                            <th 
                                scope="col" 
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer w-20"
                                onClick={() => requestSort('imageUrl')}
                            >
                                <div className="flex items-center">
                                    Imagen
                                    {sortConfig.key === 'imageUrl' && (
                                        sortConfig.direction === 'ascending' ? 
                                            <TbSortAscending2 className="ml-1" /> : 
                                            <TbSortDescending2 className="ml-1" />
                                    )}
                                </div>
                            </th>
                            <th 
                                scope="col" 
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                                onClick={() => requestSort('name')}
                            >
                                <div className="flex items-center">
                                    Nombre
                                    {sortConfig.key === 'name' && (
                                        sortConfig.direction === 'ascending' ? 
                                            <TbSortAscending2 className="ml-1" /> : 
                                            <TbSortDescending2 className="ml-1" />
                                    )}
                                </div>
                            </th>
                            <th 
                                scope="col" 
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                                onClick={() => requestSort('requiredDriverLicense')}
                            >
                                <div className="flex items-center">
                                    Licencia requerida
                                    {sortConfig.key === 'requiredDriverLicense' && (
                                        sortConfig.direction === 'ascending' ? 
                                            <TbSortAscending2 className="ml-1" /> : 
                                            <TbSortDescending2 className="ml-1" />
                                    )}
                                </div>
                            </th>
                            <th 
                                scope="col" 
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                            >
                                Documentación requerida
                            </th>
                            <th 
                                scope="col" 
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                            >
                                Acciones
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-700 divide-y divide-gray-200 dark:divide-gray-800">
                        {sortedActivities.length > 0 ? (
                            sortedActivities.map((activity) => (
                                <tr key={activity.id} className="hover:bg-gray-50 dark:hover:bg-gray-600">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {activity.imageUrl ? (
                                            <Image
                                                src={activity.imageUrl}
                                                alt={activity.name}
                                                width={40}
                                                height={40}
                                                className="rounded bg-slate-300"
                                            />
                                        ) : (
                                            <div className="w-10 h-10 rounded bg-slate-200 flex items-center justify-center">
                                                <span className="text-xs text-slate-500">N/A</span>
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {activity.name}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {activity.requiredDriverLicense ? (
                                            <div className="flex flex-wrap gap-1">
                                                {activity.requiredDriverLicense.split(',').map((license, index) => (
                                                    <span 
                                                        key={index} 
                                                        className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100"
                                                    >
                                                        {license.trim().toUpperCase()}
                                                    </span>
                                                ))}
                                            </div>
                                        ) : (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100">
                                                NO REQUIERE LICENCIA
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        {activity.requiredDocumentations && activity.requiredDocumentations.length > 0 ? (
                                            <div className="flex flex-col space-y-2 max-h-20 overflow-y-auto">
                                                {activity.requiredDocumentations.map((doc) => (
                                                    <div key={doc.id} className="text-sm group relative">
                                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100">
                                                            {doc.documentation.name}
                                                        </span>
                                                        {doc.notes && (
                                                            <>
                                                                <span 
                                                                    className="ml-2 text-xs text-gray-500 dark:text-gray-400 italic cursor-help hover:underline"
                                                                    title={doc.notes}
                                                                >
                                                                    {doc.notes.length > 30 ? `${doc.notes.substring(0, 30)}...` : doc.notes}
                                                                </span>
                                                                {doc.notes.length > 30 && (
                                                                    <div className="hidden group-hover:block absolute z-10 bg-white dark:bg-gray-900 border dark:border-gray-700 rounded p-2 shadow-lg text-xs mt-1 w-60">
                                                                        {doc.notes}
                                                                    </div>
                                                                )}
                                                            </>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <span className="text-sm text-gray-500 dark:text-gray-400">No hay documentación requerida</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <ActivityActions activityId={activity.id} activityName={activity.name} />
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={5} className="text-center py-10 text-gray-500 dark:text-gray-400">
                                    No se encontraron actividades que coincidan con tu búsqueda
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
