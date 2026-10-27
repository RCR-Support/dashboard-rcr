'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { editActivityServer } from './actions';
import { listDocumentations } from '@/actions/documentations/list-documentations';
import { getActivityDocumentations } from '@/actions/activities/get-activity-documentations';
import { updateActivityDocumentations } from '@/actions/activities/update-activity-documentations';
import { getActivityZoneDocumentations } from '@/actions/activities/get-activity-zone-documentations';
import { updateActivityZoneDocumentations } from '@/actions/activities/update-activity-zone-documentations';
import { listZones } from '@/actions/activities/list-zones';
import { ImageEditorModal } from '@/components/ui/ImageEditorModal';
import { Crop } from 'lucide-react';

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

interface ZoneDocumentationRequirement {
  zoneId: string;
  documentationId: string;
  notes?: string | null;
}

interface ZoneOption {
  id: string;
  name: string;
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
  zoneDocumentations: ZoneDocumentationRequirement[];
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
  const [availableZones, setAvailableZones] = useState<ZoneOption[]>([]);

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
    listZones().then(setAvailableZones).catch(() => setAvailableZones([]));
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
    getActivityZoneDocumentations(activity.id)
      .then(requirements => setFormData(prev => ({
        ...prev,
        zoneDocumentations: requirements.map(requirement => ({
          zoneId: requirement.zoneId,
          documentationId: requirement.documentationId,
          notes: requirement.notes,
        })),
      })))
      .catch(() => undefined);
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
    zoneDocumentations: [],
  });

  const [formState, setFormState] = useState({
    loading: false,
    error: '',
    success: '',
  });

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const nextAvailableZoneRule = availableZones.flatMap(zone =>
    availableDocumentations.map(documentation => ({ zoneId: zone.id, documentationId: documentation.id }))
  ).find(candidate => !formData.zoneDocumentations.some(requirement =>
    requirement.zoneId === candidate.zoneId && requirement.documentationId === candidate.documentationId
  ));

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
        setIsEditorOpen(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageSave = (editedFile: File) => {
    updateFormData('imageFile')(editedFile);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(editedFile);
    setIsEditorOpen(false);
  };

  const handleImageCancel = () => {
    setIsEditorOpen(false);
  };

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

      await updateActivityZoneDocumentations(
        activity.id,
        formData.zoneDocumentations.map(requirement => ({
          ...requirement,
          notes: requirement.notes ?? undefined,
        }))
      );

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

        <div className="mb-4 mt-6 border-t pt-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="font-medium">Documentos adicionales por zona</h3>
              <p className="text-sm text-gray-600">
                Se solicitarán si el trabajador tiene asignada cualquiera de las zonas seleccionadas.
              </p>
            </div>
            <button
              type="button"
              disabled={!nextAvailableZoneRule}
              onClick={() => nextAvailableZoneRule && setFormData(prev => ({
                ...prev,
                zoneDocumentations: [...prev.zoneDocumentations, { ...nextAvailableZoneRule, notes: '' }],
              }))}
              className="rounded border px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
            >
              Agregar requisito condicional
            </button>
          </div>

          {formData.zoneDocumentations.length === 0 ? (
            <p className="mt-3 text-sm text-gray-500">No hay documentos condicionales configurados.</p>
          ) : (
            <div className="mt-4 space-y-3">
              {formData.zoneDocumentations.map((requirement, index) => (
                <div key={`${requirement.zoneId}-${requirement.documentationId}-${index}`} className="grid gap-3 rounded border p-3 md:grid-cols-[1fr_1fr_1.5fr_auto]">
                  <label className="text-sm">
                    Zona
                    <select
                      value={requirement.zoneId}
                      onChange={event => setFormData(prev => ({
                        ...prev,
                        zoneDocumentations: prev.zoneDocumentations.map((item, itemIndex) => itemIndex === index
                          ? { ...item, zoneId: event.target.value }
                          : item),
                      }))}
                      className="mt-1 w-full rounded border bg-background p-2"
                    >
                      {availableZones.map(zone => <option key={zone.id} value={zone.id}>{zone.name}</option>)}
                    </select>
                  </label>
                  <label className="text-sm">
                    Documento requerido
                    <select
                      value={requirement.documentationId}
                      onChange={event => setFormData(prev => ({
                        ...prev,
                        zoneDocumentations: prev.zoneDocumentations.map((item, itemIndex) => itemIndex === index
                          ? { ...item, documentationId: event.target.value }
                          : item),
                      }))}
                      className="mt-1 w-full rounded border bg-background p-2"
                    >
                      {availableDocumentations.map(documentation => <option key={documentation.id} value={documentation.id}>{documentation.name}</option>)}
                    </select>
                  </label>
                  <label className="text-sm">
                    Nota para el solicitante
                    <input
                      value={requirement.notes ?? ''}
                      onChange={event => setFormData(prev => ({
                        ...prev,
                        zoneDocumentations: prev.zoneDocumentations.map((item, itemIndex) => itemIndex === index
                          ? { ...item, notes: event.target.value }
                          : item),
                      }))}
                      placeholder="Indica por qué aplica o qué debe incluir"
                      className="mt-1 w-full rounded border bg-background p-2"
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({
                      ...prev,
                      zoneDocumentations: prev.zoneDocumentations.filter((_, itemIndex) => itemIndex !== index),
                    }))}
                    className="self-end rounded border px-3 py-2 text-sm text-red-700"
                    aria-label="Quitar requisito condicional"
                  >
                    Quitar
                  </button>
                </div>
              ))}
            </div>
          )}

          {(availableDocumentations.length === 0 || availableZones.length === 0) && (
            <p className="mt-2 text-sm text-amber-700">
              Para configurar reglas, primero debe existir al menos una zona y un documento en sus respectivos catálogos.
            </p>
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
          onChange={handleFileSelect}
          className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
        />

        {imagePreview && (
          <div className="mt-4">
            <div className="flex items-center gap-2 mb-2">
              <p className="text-sm text-gray-500">Nueva vista previa recortada:</p>
              {selectedFile && (
                <button
                  type="button"
                  onClick={() => setIsEditorOpen(true)}
                  className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                >
                  <Crop size={14} /> Reajustar imagen
                </button>
              )}
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imagePreview}
              alt="Vista previa"
              className="max-w-xs rounded-lg border border-gray-200"
            />
          </div>
        )}
      </div>

      {/* Modal Editor de Imagen */}
      {isEditorOpen && selectedImage && selectedFile && (
        <ImageEditorModal
          isOpen={isEditorOpen}
          imageSrc={selectedImage}
          originalFile={selectedFile}
          title="Editar Imagen de Actividad"
          subtitle="Recorta y ajusta la imagen para que se muestre correctamente en las tarjetas"
          aspectRatio={16 / 9}
          targetWidth={800}
          targetHeight={450}
          guideTitle="📷 Ajuste de Actividad"
          guideItems={['Maquinaria / objeto centrado', 'Recorte horizontal (16:9)', 'Buena visibilidad']}
          onSave={handleImageSave}
          onCancel={handleImageCancel}
        />
      )}
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
