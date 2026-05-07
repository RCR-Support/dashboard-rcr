'use client';

import { useEffect, useState } from 'react';
import { listDocumentations } from '@/actions/documentations/list-documentations';
import { createDocumentation } from '@/actions/documentations/create-documentation';
import { updateDocumentation } from '@/actions/documentations/update-documentation';
import { deleteDocumentation } from '@/actions/documentations/delete-documentation';
import { usePermissions } from '@/hooks/usePermissions';
import { 
  FileText, 
  Plus, 
  Search, 
  Grid3X3, 
  List,
  FileCheck,
  Globe,
  Tag,
  ChevronRight,
  Pencil,
  Trash2
} from 'lucide-react';
import { Button } from '@heroui/react';
import Link from 'next/link';

interface DocumentationWithRelations {
  id: string;
  name: string;
  acceptedFileType?: string;
  isGlobal: boolean;
  activities: { isSpecific: boolean }[];
}

type ModalMode = 'create' | 'edit';

export default function DocumentationsPage() {
  const [documentations, setDocumentations] = useState<DocumentationWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filter, setFilter] = useState<'all' | 'global' | 'specific'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<ModalMode>('create');
  const [selectedDoc, setSelectedDoc] = useState<DocumentationWithRelations | null>(null);
  const [docName, setDocName] = useState('');
  const [docScope, setDocScope] = useState<'global' | 'specific'>('specific');
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { can } = usePermissions();
  const canCreate = can('activities:create'); // Usamos el mismo permiso que actividades (solo admin)
  const canEdit = can('activities:edit');
  const canDelete = can('activities:delete');

  async function fetchData() {
    try {
      const data = await listDocumentations() as DocumentationWithRelations[];
      setDocumentations(data);
    } catch (error) {
      // Error handled by loading state
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  const openCreateModal = () => {
    setModalMode('create');
    setSelectedDoc(null);
    setDocName('');
    setDocScope('specific');
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (doc: DocumentationWithRelations) => {
    setModalMode('edit');
    setSelectedDoc(doc);
    setDocName(doc.name);
    setDocScope(doc.isGlobal ? 'global' : 'specific');
    setFormError('');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    if (isSubmitting) return;
    setIsModalOpen(false);
  };

  const handleSubmitModal = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!docName.trim()) {
      setFormError('El nombre es obligatorio');
      return;
    }

    setFormError('');
    setIsSubmitting(true);

    try {
      if (modalMode === 'create') {
        const result = await createDocumentation(docName.trim(), undefined, docScope === 'global');
        if (!result.success) {
          setFormError(result.error || 'Error al crear documentación');
          return;
        }
      } else if (selectedDoc) {
        const result = await updateDocumentation(selectedDoc.id, {
          name: docName.trim(),
          isGlobal: docScope === 'global',
        });

        if (!result.success) {
          setFormError(result.error || 'Error al actualizar documentación');
          return;
        }
      }

      setIsModalOpen(false);
      await fetchData();
    } catch {
      setFormError('Error al guardar la documentación');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (doc: DocumentationWithRelations) => {
    const confirmed = window.confirm(`¿Eliminar la documentación "${doc.name}"?`);
    if (!confirmed) return;

    try {
      await deleteDocumentation(doc.id);
      await fetchData();
    } catch (error) {
      setFormError('No se pudo eliminar la documentación. Verifica si tiene relaciones activas.');
      setIsModalOpen(true);
      setModalMode('edit');
      setSelectedDoc(doc);
      setDocName(doc.name);
      setDocScope(doc.isGlobal ? 'global' : 'specific');
    }
  };

  const filteredDocs = documentations.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = 
      filter === 'all' ? true :
      filter === 'global' ? doc.isGlobal :
      !doc.isGlobal;
    return matchesSearch && matchesFilter;
  });

  const globalCount = documentations.filter(d => d.isGlobal).length;
  const specificCount = documentations.filter(d => !d.isGlobal).length;

  const getFileTypeColor = (type: string) => {
    switch (type) {
      case 'PDF': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300';
      case 'IMG': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
      case 'DOC': return 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Documentaciones
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Gestiona los tipos de documentos requeridos para las actividades
          </p>
        </div>
        {canCreate && (
          <Button
            color="primary"
            startContent={<Plus className="h-4 w-4" />}
            onClick={openCreateModal}
          >
            Nueva Documentación
          </Button>
        )}
      </div>

      {/* Link a Matriz */}
      <Link
        href="/dashboard/documentations/activity-matrix"
        className="flex items-center p-4 bg-gradient-to-r from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10 rounded-xl border border-primary/20 hover:border-primary/40 transition-all group"
      >
        <div className="p-3 bg-primary/10 rounded-lg mr-4">
          <Grid3X3 className="h-6 w-6 text-primary" />
        </div>
        <div className="flex-1">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-primary transition-colors">
            Matriz de Actividades y Documentos
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Ver la tabla completa de documentos requeridos por cada actividad
          </p>
        </div>
        <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-primary group-hover:translate-x-1 transition-all" />
      </Link>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{documentations.length}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total documentos</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <Globe className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{globalCount}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Globales</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
              <Tag className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{specificCount}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Específicos</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar documentación..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
          />
        </div>
        <div className="flex gap-2">
          <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 text-sm rounded-md transition-all ${
                filter === 'all' 
                  ? 'bg-white dark:bg-gray-700 shadow-sm font-medium' 
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setFilter('global')}
              className={`px-3 py-1.5 text-sm rounded-md transition-all ${
                filter === 'global' 
                  ? 'bg-white dark:bg-gray-700 shadow-sm font-medium' 
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
              }`}
            >
              Globales
            </button>
            <button
              onClick={() => setFilter('specific')}
              className={`px-3 py-1.5 text-sm rounded-md transition-all ${
                filter === 'specific' 
                  ? 'bg-white dark:bg-gray-700 shadow-sm font-medium' 
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
              }`}
            >
              Específicos
            </button>
          </div>
          <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md transition-all ${
                viewMode === 'grid' 
                  ? 'bg-white dark:bg-gray-700 shadow-sm' 
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
              }`}
            >
              <Grid3X3 className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md transition-all ${
                viewMode === 'list' 
                  ? 'bg-white dark:bg-gray-700 shadow-sm' 
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
              }`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Documentation List/Grid */}
      {filteredDocs.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl">
          <FileText className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
            No se encontraron documentaciones
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            {searchTerm ? 'Intenta con otro término de búsqueda' : 'Crea una nueva documentación para comenzar'}
          </p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredDocs.map(doc => (
            (() => {
              const fileType = doc.acceptedFileType || 'PDF';
              return (
            <div
              key={doc.id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-5 hover:shadow-md hover:border-primary/30 transition-all group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <FileCheck className="h-5 w-5 text-primary" />
                </div>
                <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getFileTypeColor(fileType)}`}>
                  {fileType}
                </span>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                {doc.name}
              </h3>
              <div className="flex items-center gap-2 text-sm">
                {doc.isGlobal ? (
                  <span className="inline-flex items-center gap-1 text-green-600 dark:text-green-400">
                    <Globe className="h-3.5 w-3.5" />
                    Global
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400">
                    <Tag className="h-3.5 w-3.5" />
                    Específico
                  </span>
                )}
                <span className="text-gray-400">•</span>
                <span className="text-gray-500 dark:text-gray-400">
                  {doc.activities.length} {doc.activities.length === 1 ? 'actividad' : 'actividades'}
                </span>
              </div>
              {(canEdit || canDelete) && (
                <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700 flex gap-2">
                  {canEdit && (
                    <Button
                      size="sm"
                      variant="flat"
                      color="default"
                      startContent={<Pencil className="h-3.5 w-3.5" />}
                      onClick={() => openEditModal(doc)}
                      className="flex-1"
                    >
                      Editar
                    </Button>
                  )}
                  {canDelete && (
                    <Button
                      size="sm"
                      variant="flat"
                      color="danger"
                      startContent={<Trash2 className="h-3.5 w-3.5" />}
                      onClick={() => handleDelete(doc)}
                      className="flex-1"
                    >
                      Eliminar
                    </Button>
                  )}
                </div>
              )}
            </div>
              );
            })()
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400">Nombre</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400">Tipo</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400">Alcance</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400">Actividades</th>
                {(canEdit || canDelete) && (
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400">Acciones</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {filteredDocs.map(doc => (
                (() => {
                  const fileType = doc.acceptedFileType || 'PDF';
                  return (
                <tr key={doc.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 bg-primary/10 rounded-lg">
                        <FileCheck className="h-4 w-4 text-primary" />
                      </div>
                      <span className="font-medium text-gray-900 dark:text-white">{doc.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getFileTypeColor(fileType)}`}>
                      {fileType}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {doc.isGlobal ? (
                      <span className="inline-flex items-center gap-1 text-sm text-green-600 dark:text-green-400">
                        <Globe className="h-3.5 w-3.5" />
                        Global
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-sm text-amber-600 dark:text-amber-400">
                        <Tag className="h-3.5 w-3.5" />
                        Específico
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-500 dark:text-gray-400">
                    {doc.activities.length}
                  </td>
                  {(canEdit || canDelete) && (
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        {canEdit && (
                          <Button
                            size="sm"
                            variant="flat"
                            color="default"
                            startContent={<Pencil className="h-3.5 w-3.5" />}
                            onClick={() => openEditModal(doc)}
                          >
                            Editar
                          </Button>
                        )}
                        {canDelete && (
                          <Button
                            size="sm"
                            variant="flat"
                            color="danger"
                            startContent={<Trash2 className="h-3.5 w-3.5" />}
                            onClick={() => handleDelete(doc)}
                          >
                            Eliminar
                          </Button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
                  );
                })()
              ))}
            </tbody>
          </table>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 w-full max-w-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">
              {modalMode === 'create' ? 'Nueva Documentación' : 'Editar Documentación'}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
              Define el nombre y el alcance para controlar cuándo se pide por sí solo o en conjunto.
            </p>

            <form onSubmit={handleSubmitModal} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nombre
                </label>
                <input
                  type="text"
                  value={docName}
                  onChange={(e) => setDocName(e.target.value)}
                  placeholder="Ej: Licencia Municipal"
                  className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Alcance
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setDocScope('specific')}
                    className={`px-3 py-2 rounded-lg border text-sm transition-all ${
                      docScope === 'specific'
                        ? 'border-primary bg-primary/10 text-primary font-medium'
                        : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300'
                    }`}
                  >
                    Específico
                  </button>
                  <button
                    type="button"
                    onClick={() => setDocScope('global')}
                    className={`px-3 py-2 rounded-lg border text-sm transition-all ${
                      docScope === 'global'
                        ? 'border-primary bg-primary/10 text-primary font-medium'
                        : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300'
                    }`}
                  >
                    Global
                  </button>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  Global: se puede solicitar de forma independiente. Específico: se gestiona en conjunto con una actividad.
                </p>
              </div>

              {formError && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-sm text-red-600 dark:text-red-400">{formError}</p>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="flat" color="default" onClick={closeModal} isDisabled={isSubmitting}>
                  Cancelar
                </Button>
                <Button color="primary" type="submit" isLoading={isSubmitting}>
                  {modalMode === 'create' ? 'Crear' : 'Guardar'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
