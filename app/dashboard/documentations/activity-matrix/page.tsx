'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { Button, Input, Tooltip, Chip } from '@heroui/react';
import { cn } from '@/lib/utils';
import { listDocumentations } from '@/actions/documentations/list-documentations';
import { EditDocumentationModal } from './EditDocumentationModal';
import { Documentation } from '@/interfaces/documentation.interface';
import { RelatedActivitiesModal } from '@/components/ui/dashboard/documentation/RelatedActivitiesModal';
import { listActivitiesForMatrix } from '@/actions/activities/list-activities-matrix';
import {
  ArrowLeft,
  Globe,
  FileStack,
  Pencil,
  MessageSquare,
  Search,
  RotateCcw,
  FileText,
  Activity,
  CheckCircle2,
  XCircle,
  Loader2,
  AlertCircle,
  Grid3X3,
} from 'lucide-react';

interface ActivityType {
  id: string;
  name: string;
  requiredDocumentations: {
    id: string;
    documentationId: string;
    isSpecific: boolean;
    quantity: number | null;
    notes: string | null;
  }[];
}

export default function ActivityMatrixPage() {
  const [documentations, setDocumentations] = useState<Documentation[]>([]);
  const [activities, setActivities] = useState<ActivityType[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<Documentation | undefined>(undefined);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isRelatedActivitiesModalOpen, setIsRelatedActivitiesModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isTransposed, setIsTransposed] = useState(false);
  const [searchDoc, setSearchDoc] = useState('');
  const [searchActivity, setSearchActivity] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'global' | 'specific'>('all');

  // Helper para determinar si un documento es global o específico
  const isDocumentGlobal = useCallback((docId: string): boolean => {
    return activities.some((activity) =>
      activity.requiredDocumentations.some(
        (rel) => rel.documentationId === docId && rel.isSpecific === false
      )
    );
  }, [activities]);

  // Estadísticas
  const stats = useMemo(() => {
    const globalDocs = documentations.filter((d) => isDocumentGlobal(d.id)).length;
    const specificDocs = documentations.length - globalDocs;
    const totalRelations = activities.reduce(
      (acc, act) => acc + act.requiredDocumentations.length,
      0
    );
    return {
      totalDocs: documentations.length,
      globalDocs,
      specificDocs,
      totalActivities: activities.length,
      totalRelations,
    };
  }, [documentations, activities, isDocumentGlobal]);

  // Filtrar documentaciones
  const filteredDocs = useMemo(() => {
    return documentations.filter((doc) => {
      const matchesSearch = doc.name.toLowerCase().includes(searchDoc.toLowerCase());
      const isGlobal = isDocumentGlobal(doc.id);
      const matchesFilter =
        filterType === 'all' ||
        (filterType === 'global' && isGlobal) ||
        (filterType === 'specific' && !isGlobal);
      return matchesSearch && matchesFilter;
    });
  }, [documentations, searchDoc, filterType, isDocumentGlobal]);

  // Filtrar actividades
  const filteredActivities = useMemo(() => {
    return activities.filter((act) =>
      act.name.toLowerCase().includes(searchActivity.toLowerCase())
    );
  }, [activities, searchActivity]);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [docs, acts] = await Promise.all([
        listDocumentations(),
        listActivitiesForMatrix(),
      ]);

      if (!docs || !Array.isArray(docs)) {
        throw new Error('No se recibieron documentos válidos');
      }
      if (!acts || !Array.isArray(acts)) {
        throw new Error('No se recibieron actividades válidas');
      }

      setDocumentations(docs);
      setActivities(acts);
    } catch (error) {
      // Error handled by error state below
      setError(error instanceof Error ? error.message : 'Error al cargar los datos');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Grid3X3 className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Matriz de Actividades y Documentos
            </h1>
          </div>
          <p className="text-gray-500 dark:text-gray-400 ml-12">
            Visualiza y gestiona los documentos requeridos para cada actividad
          </p>
        </div>
        <Link href="/dashboard/documentations">
          <Button variant="bordered" startContent={<ArrowLeft className="h-4 w-4" />}>
            Volver
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalDocs}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Documentos</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
              <Globe className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.globalDocs}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Globales</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
              <FileStack className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.specificDocs}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Específicos</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <Activity className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalActivities}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Actividades</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
              <CheckCircle2 className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalRelations}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Relaciones</p>
            </div>
          </div>
        </div>
      </div>

      {/* Document Cards Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Documentos Disponibles</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Haz clic en un documento para ver sus actividades relacionadas</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Input
              placeholder="Buscar documento..."
              value={searchDoc}
              onChange={(e) => setSearchDoc(e.target.value)}
              startContent={<Search className="h-4 w-4 text-gray-400" />}
              size="sm"
              className="w-48"
              variant="bordered"
            />
            <div className="flex gap-1">
              <Button size="sm" variant={filterType === 'all' ? 'solid' : 'flat'} color={filterType === 'all' ? 'primary' : 'default'} onPress={() => setFilterType('all')}>Todos</Button>
              <Button size="sm" variant={filterType === 'global' ? 'solid' : 'flat'} color={filterType === 'global' ? 'success' : 'default'} onPress={() => setFilterType('global')} startContent={<Globe className="h-3 w-3" />}>Global</Button>
              <Button size="sm" variant={filterType === 'specific' ? 'solid' : 'flat'} color={filterType === 'specific' ? 'warning' : 'default'} onPress={() => setFilterType('specific')} startContent={<FileStack className="h-3 w-3" />}>Específico</Button>
            </div>
          </div>
        </div>

        {filteredDocs.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No se encontraron documentos</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {filteredDocs.map((doc) => {
              const isGlobal = isDocumentGlobal(doc.id);
              return (
                <div
                  key={doc.id}
                  onClick={() => {
                    setSelectedDoc(doc);
                    setIsRelatedActivitiesModalOpen(true);
                  }}
                  className={cn(
                    'cursor-pointer rounded-xl p-4 border-2 transition-all duration-200',
                    'hover:shadow-md hover:scale-[1.02]',
                    isGlobal
                      ? 'border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-900/10 hover:border-emerald-400'
                      : 'border-orange-200 dark:border-orange-800 bg-orange-50/50 dark:bg-orange-900/10 hover:border-orange-400'
                  )}
                >
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <p className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2">{doc.name}</p>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedDoc(doc);
                        setIsEditModalOpen(true);
                      }}
                      className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex-shrink-0"
                    >
                      <Pencil className="h-3.5 w-3.5 text-gray-500" />
                    </button>
                  </div>
                  <Chip size="sm" variant="flat" color={isGlobal ? 'success' : 'warning'} startContent={isGlobal ? <Globe className="h-3 w-3" /> : <FileStack className="h-3 w-3" />}>
                    {isGlobal ? 'Global' : 'Específico'}
                  </Chip>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Matrix Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
        {/* Table Header */}
        <div className="p-4 border-b border-gray-100 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Matriz de Requisitos</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {isTransposed ? 'Filas: Actividades | Columnas: Documentos' : 'Filas: Documentos | Columnas: Actividades'}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Input
                placeholder="Buscar actividad..."
                value={searchActivity}
                onChange={(e) => setSearchActivity(e.target.value)}
                startContent={<Search className="h-4 w-4 text-gray-400" />}
                size="sm"
                className="w-48"
                variant="bordered"
              />
              <Button size="sm" variant="flat" color="primary" onPress={() => setIsTransposed(!isTransposed)} startContent={<RotateCcw className="h-4 w-4" />}>
                Rotar
              </Button>
            </div>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap items-center gap-4 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Leyenda:</span>
            <div className="flex items-center gap-1.5">
              <Globe className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <span className="text-xs text-gray-600 dark:text-gray-300">Global</span>
            </div>
            <div className="flex items-center gap-1.5">
              <FileStack className="h-4 w-4 text-orange-600 dark:text-orange-400" />
              <span className="text-xs text-gray-600 dark:text-gray-300">Específico</span>
            </div>
            <div className="flex items-center gap-1.5">
              <MessageSquare className="h-4 w-4 text-gray-500" />
              <span className="text-xs text-gray-600 dark:text-gray-300">Con notas</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Chip size="sm" color="primary" variant="flat">N</Chip>
              <span className="text-xs text-gray-600 dark:text-gray-300">Cantidad</span>
            </div>
          </div>
        </div>

        {/* Table Content */}
        {isLoading ? (
          <div className="p-12 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
            <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">Cargando matriz...</p>
          </div>
        ) : error ? (
          <div className="p-12 text-center">
            <AlertCircle className="h-12 w-12 mx-auto text-red-500 mb-3" />
            <p className="text-red-600 dark:text-red-400">{error}</p>
            <Button size="sm" color="primary" variant="flat" className="mt-4" onPress={loadData}>
              Reintentar
            </Button>
          </div>
        ) : filteredDocs.length === 0 || filteredActivities.length === 0 ? (
          <div className="p-12 text-center text-gray-500 dark:text-gray-400">
            <XCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No hay datos disponibles para mostrar</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead>
                <tr>
                  <th className="sticky left-0 z-20 bg-gray-50 dark:bg-gray-700/50 px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider min-w-[200px] border-b border-r border-gray-200 dark:border-gray-700">
                    {isTransposed ? 'Actividades' : 'Documentos'}
                  </th>
                  {!isTransposed
                    ? filteredActivities.map((activity) => (
                        <th key={activity.id} className="relative px-1 py-2 text-xs font-medium text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/50 border-b border-r border-gray-200 dark:border-gray-700 h-36 w-10 min-w-[40px]">
                          <div className="absolute inset-0 flex items-end justify-center pb-2">
                            <span className="origin-bottom-left -rotate-90 whitespace-nowrap text-xs h-32 flex items-center" title={activity.name}>
                              {activity.name}
                            </span>
                          </div>
                        </th>
                      ))
                    : filteredDocs.map((doc) => (
                        <th key={doc.id} className="relative px-1 py-2 text-xs font-medium text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/50 border-b border-r border-gray-200 dark:border-gray-700 h-36 w-10 min-w-[40px]">
                          <div className="absolute inset-0 flex items-end justify-center pb-2">
                            <span className="origin-bottom-left -rotate-90 whitespace-nowrap text-xs h-32 flex items-center" title={doc.name}>
                              {doc.name}
                            </span>
                          </div>
                        </th>
                      ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
                {!isTransposed
                  ? filteredDocs.map((doc, idx) => (
                      <tr key={doc.id} className={cn(idx % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50/50 dark:bg-gray-800/50')}>
                        <td className="sticky left-0 z-10 bg-inherit px-4 py-3 text-sm font-medium text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-700 min-w-[200px] max-w-[250px]">
                          <div className="flex items-center gap-2 overflow-hidden">
                            {isDocumentGlobal(doc.id) ? (
                              <Globe className="h-4 w-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                            ) : (
                              <FileStack className="h-4 w-4 text-orange-600 dark:text-orange-400 flex-shrink-0" />
                            )}
                            <span className="truncate" title={doc.name}>{doc.name}</span>
                          </div>
                        </td>
                        {filteredActivities.map((activity) => {
                          const rel = activity.requiredDocumentations.find((rd) => rd.documentationId === doc.id);
                          return (
                            <td key={`${doc.id}-${activity.id}`} className="px-2 py-2 text-center border-r border-gray-100 dark:border-gray-700">
                              {rel ? (
                                <Tooltip
                                  content={
                                    rel.notes ? (
                                      <div className="max-w-xs p-1">
                                        <p className="font-medium mb-1">Notas:</p>
                                        <p className="text-xs">{rel.notes}</p>
                                      </div>
                                    ) : (
                                      `${rel.isSpecific ? 'Específico' : 'Global'}${rel.quantity ? ` - ${rel.quantity} copias` : ''}`
                                    )
                                  }
                                >
                                  <div className="inline-flex flex-col items-center gap-1 cursor-help">
                                    {rel.isSpecific ? (
                                      <FileStack className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                                    ) : (
                                      <Globe className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                    )}
                                    {rel.quantity && (
                                      <Chip size="sm" color="primary" variant="flat" className="h-5 min-w-0 px-1.5">
                                        {rel.quantity}
                                      </Chip>
                                    )}
                                    {rel.notes && <MessageSquare className="h-3 w-3 text-gray-400" />}
                                  </div>
                                </Tooltip>
                              ) : (
                                <span className="text-gray-300 dark:text-gray-600">—</span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))
                  : filteredActivities.map((activity, idx) => (
                      <tr key={activity.id} className={cn(idx % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50/50 dark:bg-gray-800/50')}>
                        <td className="sticky left-0 z-10 bg-inherit px-4 py-3 text-sm font-medium text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-700 min-w-[200px] max-w-[250px]">
                          <span className="truncate block" title={activity.name}>{activity.name}</span>
                        </td>
                        {filteredDocs.map((doc) => {
                          const rel = activity.requiredDocumentations.find((rd) => rd.documentationId === doc.id);
                          return (
                            <td key={`${activity.id}-${doc.id}`} className="px-2 py-2 text-center border-r border-gray-100 dark:border-gray-700">
                              {rel ? (
                                <Tooltip
                                  content={
                                    rel.notes ? (
                                      <div className="max-w-xs p-1">
                                        <p className="font-medium mb-1">Notas:</p>
                                        <p className="text-xs">{rel.notes}</p>
                                      </div>
                                    ) : (
                                      `${rel.isSpecific ? 'Específico' : 'Global'}${rel.quantity ? ` - ${rel.quantity} copias` : ''}`
                                    )
                                  }
                                >
                                  <div className="inline-flex flex-col items-center gap-1 cursor-help">
                                    {rel.isSpecific ? (
                                      <FileStack className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                                    ) : (
                                      <Globe className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                    )}
                                    {rel.quantity && (
                                      <Chip size="sm" color="primary" variant="flat" className="h-5 min-w-0 px-1.5">
                                        {rel.quantity}
                                      </Chip>
                                    )}
                                    {rel.notes && <MessageSquare className="h-3 w-3 text-gray-400" />}
                                  </div>
                                </Tooltip>
                              ) : (
                                <span className="text-gray-300 dark:text-gray-600">—</span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      <EditDocumentationModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedDoc(undefined);
        }}
        onSubmit={() => {
          setIsEditModalOpen(false);
          loadData();
        }}
        documentation={selectedDoc}
      />

      {selectedDoc && (
        <RelatedActivitiesModal
          isOpen={isRelatedActivitiesModalOpen}
          onClose={() => {
            setIsRelatedActivitiesModalOpen(false);
            setSelectedDoc(undefined);
          }}
          documentationId={selectedDoc.id}
          documentationName={selectedDoc.name}
        />
      )}
    </div>
  );
}
