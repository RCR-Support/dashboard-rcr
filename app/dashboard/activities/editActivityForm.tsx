'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { editActivityServer } from './actions';
import { listDocumentations } from '@/actions/documentations/list-documentations';
import { getActivityDocumentations } from '@/actions/activities/get-activity-documentations';
import { updateActivityDocumentations } from '@/actions/activities/update-activity-documentations';

interface Documentation {
  id: string;
  name: string;
  isGlobal: boolean;
}

interface ActivityDocumentation {
  documentationId: string;
  documentation: Documentation;
  isSpecific: boolean;
  notes?: string | null;
}

interface Activity {
  id: string;
  name: string;
  requiredDriverLicense?: string | null;
  requiredDocumentations?: ActivityDocumentation[];
}

interface EditActivityFormData {
  name: string;
  requiresLicense: boolean;
  selectedLicenses: string[];
  imageFile: File | null;
  requiresDocs: boolean;
  documentations: ActivityDocumentation[];
}

interface EditActivityFormProps {
  activity: Activity;
  onSuccess?: () => void;
}

export default function EditActivityForm({
  activity,
  onSuccess,
}: EditActivityFormProps) {
  const router = useRouter();
  const [availableDocumentations, setAvailableDocumentations] = useState<
    Documentation[]
  >([]);
  const [loadingDocs, setLoadingDocs] = useState(true);

  // Cargar documentaciones disponibles
  useEffect(() => {
    const loadDocumentations = async () => {
      try {
        const docs = await listDocumentations();
        setAvailableDocumentations(docs);
      } catch {
        // Error cargando documentaciones
      } finally {
        setLoadingDocs(false);
      }
    };

    loadDocumentations();
  }, []);

  // Cargar documentaciones de la actividad
  useEffect(() => {
    const loadActivityDocs = async () => {
      if (!activity.id) return;
      try {
        const activityDocs = await getActivityDocumentations(activity.id);
        setFormData(prev => ({
          ...prev,
          documentations: activityDocs,
        }));
      } catch {
        // Error cargando documentaciones de la actividad
      }
    };

    loadActivityDocs();
  }, [activity.id]);

  const [formData, setFormData] = useState<EditActivityFormData>({
    name: activity.name || '',
    requiresLicense: !!activity.requiredDriverLicense,
    selectedLicenses: activity.requiredDriverLicense
      ? activity.requiredDriverLicense.split(',')
      : [],
    imageFile: null,
    requiresDocs: (activity.requiredDocumentations || []).length > 0,
    documentations: activity.requiredDocumentations || [],
  });

  const [formState, setFormState] = useState({
    loading: false,
    error: '',
    success: '',
  });

  const updateFormData =
    (field: keyof EditActivityFormData) => (value: string | File | null) => {
      setFormData(prev => ({
        ...prev,
        [field]: value,
      }));
    };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormState(prev => ({ ...prev, loading: true, error: '', success: '' }));

    try {
      const submitData = new FormData();
      submitData.append('id', activity.id);
      submitData.append('name', formData.name);
      // Solo enviamos las licencias si el checkbox está marcado
      submitData.append(
        'requiredDriverLicense',
        formData.requiresLicense ? formData.selectedLicenses.join(',') : ''
      );
      if (formData.imageFile) submitData.append('image', formData.imageFile);

      await editActivityServer(submitData);

      // Actualizar las documentaciones si es necesario
      if (formData.requiresDocs) {
        await updateActivityDocumentations(
          activity.id,
          formData.documentations.map(doc => ({
            documentationId: doc.documentationId,
            isSpecific: doc.isSpecific,
            notes: doc.notes || undefined,
          }))
        );
      } else {
        // Si no requiere docs, eliminar todas las documentaciones
        await updateActivityDocumentations(activity.id, []);
      }

      setFormState(prev => ({
        ...prev,
        success: 'Actividad actualizada correctamente',
      }));

      if (onSuccess) onSuccess();
    } catch (err: unknown) {
      setFormState(prev => ({
        ...prev,
        error: err instanceof Error ? err.message : 'Error al editar actividad',
      }));
    } finally {
      setFormState(prev => ({ ...prev, loading: false }));
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-2xl mx-auto bg-white dark:bg-gray-800 p-6 rounded-lg shadow mb-8"
    >
      <h2 className="text-xl font-bold mb-4">Editar actividad</h2>
      <div className="mb-4">
        <label className="block mb-1 font-medium">
          Nombre <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={e => updateFormData('name')(e.target.value)}
          className="w-full p-2 border rounded"
          required
        />
      </div>
      <div className="mb-4">
        <div className="flex items-center mb-2">
          <input
            type="checkbox"
            id="requiresLicense"
            checked={formData.requiresLicense}
            onChange={e => {
              const checked = e.target.checked;
              setFormData(prev => ({
                ...prev,
                requiresLicense: checked,
                selectedLicenses: checked ? prev.selectedLicenses : [],
              }));
            }}
            className="mr-2"
          />
          <label htmlFor="requiresLicense" className="font-medium">
            ¿Esta actividad requiere licencia de conducir?
          </label>
        </div>

        {formData.requiresLicense && (
          <div className="ml-6 mt-2 space-y-2 border-l-2 border-gray-200 pl-4">
            <p className="text-sm text-gray-600 mb-2">
              Seleccione las licencias requeridas:
            </p>
            {['a1', 'a2', 'a3', 'a4', 'a5', 'b', 'c', 'd'].map(license => (
              <div key={license} className="flex items-center">
                <input
                  type="checkbox"
                  id={`license-${license}`}
                  checked={formData.selectedLicenses.includes(license)}
                  onChange={e => {
                    const checked = e.target.checked;
                    setFormData(prev => ({
                      ...prev,
                      selectedLicenses: checked
                        ? [...prev.selectedLicenses, license]
                        : prev.selectedLicenses.filter(l => l !== license),
                    }));
                  }}
                  className="mr-2"
                />
                <label htmlFor={`license-${license}`} className="text-sm">
                  Clase {license.toUpperCase()}
                </label>
              </div>
            ))}
          </div>
        )}

        {/* Sección de Documentación */}
        <div className="mb-4 mt-6 border-t pt-6">
          <div className="flex items-center mb-2">
            <input
              type="checkbox"
              id="requiresDocs"
              checked={formData.requiresDocs}
              onChange={e => {
                const checked = e.target.checked;
                setFormData(prev => ({
                  ...prev,
                  requiresDocs: checked,
                  documentations: checked ? prev.documentations : [],
                }));
              }}
              className="mr-2"
            />
            <label htmlFor="requiresDocs" className="font-medium">
              ¿Esta actividad requiere documentación específica?
            </label>
          </div>

          {formData.requiresDocs && !loadingDocs && (
            <div className="ml-6 mt-2 space-y-4 border-l-2 border-gray-200 pl-4">
              {availableDocumentations.map(doc => {
                const existingDoc = formData.documentations.find(
                  d => d.documentationId === doc.id
                );
                return (
                  <div key={doc.id} className="space-y-2">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id={`doc-${doc.id}`}
                        checked={!!existingDoc}
                        onChange={e => {
                          const checked = e.target.checked;
                          setFormData(prev => ({
                            ...prev,
                            documentations: checked
                              ? [
                                  ...prev.documentations,
                                  {
                                    documentationId: doc.id,
                                    documentation: doc,
                                    isSpecific: false,
                                  },
                                ]
                              : prev.documentations.filter(
                                  d => d.documentationId !== doc.id
                                ),
                          }));
                        }}
                        className="mr-2"
                      />
                      <label
                        htmlFor={`doc-${doc.id}`}
                        className="text-sm font-medium"
                      >
                        {doc.name}
                      </label>
                    </div>

                    {existingDoc && (
                      <div className="ml-6 space-y-3">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              id={`specific-${doc.id}`}
                              checked={existingDoc.isSpecific}
                              onChange={e => {
                                setFormData(prev => ({
                                  ...prev,
                                  documentations: prev.documentations.map(d =>
                                    d.documentationId === doc.id
                                      ? { ...d, isSpecific: e.target.checked }
                                      : d
                                  ),
                                }));
                              }}
                              className="mr-2"
                            />
                            <label
                              htmlFor={`specific-${doc.id}`}
                              className="text-sm"
                            >
                              Específico para esta actividad
                            </label>
                          </div>
                        </div>
                        <div>
                          <label className="text-sm text-gray-600 block mb-1">
                            Notas u observaciones:
                          </label>
                          <textarea
                            value={existingDoc.notes || ''}
                            onChange={e => {
                              setFormData(prev => ({
                                ...prev,
                                documentations: prev.documentations.map(d =>
                                  d.documentationId === doc.id
                                    ? { ...d, notes: e.target.value }
                                    : d
                                ),
                              }));
                            }}
                            className="w-full text-sm p-2 border rounded"
                            rows={2}
                            placeholder="Requisitos adicionales, vigencia, etc."
                          />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {loadingDocs && formData.requiresDocs && (
            <div className="ml-6 mt-4 text-gray-500">
              Cargando documentaciones disponibles...
            </div>
          )}
        </div>
      </div>
      <div className="mb-4">
        <label className="block mb-1 font-medium">
          Imagen referencial (opcional)
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={e =>
            updateFormData('imageFile')(e.target.files?.[0] || null)
          }
          className="w-full"
        />
      </div>
      <div className="flex justify-between mt-6">
        <button
          type="button"
          onClick={() => router.push('/dashboard/activities')}
          className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors"
        >
          Salir
        </button>
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
          disabled={formState.loading}
        >
          {formState.loading ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </div>
      {formState.error && (
        <p className="text-red-500 mt-2">{formState.error}</p>
      )}
      {formState.success && (
        <p className="text-green-500 mt-2">{formState.success}</p>
      )}
    </form>
  );
}
