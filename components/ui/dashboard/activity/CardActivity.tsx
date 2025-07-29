'use client';
import { useState } from 'react';
import Image from 'next/image';
import { CiSearch } from "react-icons/ci";
import { Button, Input } from '@heroui/react';
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

export const CardActivity = ({ activities }: Props) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [isAscending, setIsAscending] = useState(true);

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
    const sortedActivities = sortActivities();

    return (
        <>
            {/* Barra de búsqueda y controles */}
            <div className="card-box col-span-12 flex flex-col sm:flex-row gap-4 justify-between items-center mb-4">
                <div className="relative w-full sm:w-96">
                    <Input
                        type="text"
                        placeholder="Buscar actividades... "
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full"
                    />
                    <CiSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                </div>
                <Button
                    onClick={() => setIsAscending(!isAscending)}
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

            {/* Grid de tarjetas de actividades */}
            <div className="col-span-12">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {sortedActivities.map((activity) => (
                        <div key={activity.id} className="bg-white dark:bg-[#282c34] rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden flex flex-col relative h-[260px]">
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
                                        {/* Gradient overlay para mejorar legibilidad del texto */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                                    </>
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center">
                                        <span className="text-xl text-slate-500">Sin imagen</span>
                                    </div>
                                )}
                                
                                {/* Nombre y etiquetas superpuestos sobre la imagen */}
                                <div className="absolute bottom-0 left-0 right-0 p-3 z-10">
                                    <h3 className="font-semibold mb-2 text-center text-lg truncate max-w-full text-white drop-shadow-md">{activity.name}</h3>
                                    <div className="flex gap-2 justify-center mb-1 flex-wrap">
                                        {activity.requiredDriverLicense && (
                                            <span className="inline-flex items-center px-2 py-1 rounded-full bg-blue-100/90 dark:bg-blue-900/70 text-xs font-medium text-blue-800 dark:text-blue-200 backdrop-blur-sm">
                                                <span className="h-2 w-2 rounded-full bg-blue-500 mr-1.5"></span>
                                                Licencias
                                            </span>
                                        )}
                                        {activity.requiredDocumentations && activity.requiredDocumentations.length > 0 && (
                                            <span className="inline-flex items-center px-2 py-1 rounded-full bg-amber-100/90 dark:bg-amber-900 text-xs font-medium text-amber-800 dark:text-amber-400 backdrop-blur-sm">
                                                <span className="h-2 w-2 rounded-full bg-amber-500 mr-1.5"></span>
                                                Documentos
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="w-full px-4 py-4 flex flex-col flex-grow border-t border-gray-100 dark:border-gray-700">
                                <div className="w-full mt-auto">
                                    <ActivityActions activityId={activity.id} activityName={activity.name} />
                                </div>
                            </div>
                        </div>
                    ))}

                    {sortedActivities.length === 0 && (
                        <div className="col-span-full text-center py-16 px-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                            <div className="flex flex-col items-center gap-3">
                                <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                                    <CiSearch className="text-gray-400 dark:text-gray-300" size={30} />
                                </div>
                                <h3 className="font-medium text-lg text-gray-700 dark:text-gray-200">No se encontraron actividades</h3>
                                <p className="text-gray-500 dark:text-gray-400 max-w-md">No se encontraron actividades que coincidan con tu búsqueda. Prueba con otro término o ajusta los filtros.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
