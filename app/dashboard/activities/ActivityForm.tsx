'use client';
import { useState, useEffect } from 'react';
import { Camera, FileText, CreditCard, Save, AlertCircle, CheckCircle2 } from 'lucide-react';

interface ActivityFormData {
  name: string;
  requiredDriverLicense: string;
  imageFile: File | null;
}

interface ActivityFormProps {
  onSuccess?: () => void;
}

// Recibe onSuccess como prop para redirigir tras crear
export default function ActivityForm({ onSuccess }: ActivityFormProps) {
  const [formData, setFormData] = useState<ActivityFormData>(() => {
    // Cargar datos desde localStorage al inicializar
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('activityForm');
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...parsed,
          imageFile: null, // No guardamos archivos en localStorage
        };
      }
    }
    return {
      name: '',
      requiredDriverLicense: '',
      imageFile: null,
    };
  });
  
  const [formState, setFormState] = useState({
    loading: false,
    error: '',
    success: '',
  });
  
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [autoSaved, setAutoSaved] = useState(false);

  // Auto-save a localStorage
  useEffect(() => {
    const timer = setTimeout(() => {
      if (formData.name.trim() || formData.requiredDriverLicense.trim()) {
        localStorage.setItem('activityForm', JSON.stringify({
          name: formData.name,
          requiredDriverLicense: formData.requiredDriverLicense,
        }));
        setAutoSaved(true);
        setTimeout(() => setAutoSaved(false), 2000);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [formData.name, formData.requiredDriverLicense]);

  const updateFormData =
    (field: keyof ActivityFormData) => (value: string | File | null) => {
      setFormData(prev => ({
        ...prev,
        [field]: value,
      }));
      
      // Manejar preview de imagen
      if (field === 'imageFile' && value instanceof File) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreview(reader.result as string);
        };
        reader.readAsDataURL(value);
      } else if (field === 'imageFile' && !value) {
        setImagePreview(null);
      }
    };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormState(prev => ({ ...prev, loading: true, error: '', success: '' }));

    if (!formData.name) {
      setFormState(prev => ({
        ...prev,
        loading: false,
        error: 'El nombre es obligatorio',
      }));
      return;
    }

    try {
      const submitData = new FormData();
      submitData.append('name', formData.name);
      submitData.append(
        'requiredDriverLicense',
        formData.requiredDriverLicense
      );
      if (formData.imageFile) submitData.append('image', formData.imageFile);

      // Llamada directa a server action
      const { createActivityServer } = await import('./actions');
      await createActivityServer(submitData);

      setFormState(prev => ({
        ...prev,
        success: 'Actividad creada correctamente',
      }));
      
      // Limpiar formulario y localStorage
      setFormData({
        name: '',
        requiredDriverLicense: '',
        imageFile: null,
      });
      setImagePreview(null);
      localStorage.removeItem('activityForm');

      if (onSuccess) onSuccess();
    } catch (err: unknown) {
      setFormState(prev => ({
        ...prev,
        error: err instanceof Error ? err.message : 'Error al crear actividad',
      }));
    } finally {
      setFormState(prev => ({ ...prev, loading: false }));
    }
  }

  return (
    <div className="space-y-6">
      {/* Indicador de auto-save */}
      {autoSaved && (
        <div className="flex items-center gap-2 text-green-600 text-sm">
          <CheckCircle2 size={16} />
          Cambios guardados automáticamente
        </div>
      )}
      
      {/* Barra de progreso del formulario */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-gray-500">
          <span>Progreso del formulario</span>
          <span>{Math.round(((formData.name ? 1 : 0) + (formData.requiredDriverLicense ? 1 : 0) + (formData.imageFile ? 1 : 0)) / 3 * 100)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((formData.name ? 1 : 0) + (formData.requiredDriverLicense ? 1 : 0) + (formData.imageFile ? 1 : 0)) / 3 * 100}%` }}
          />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Campo Nombre */}
        <div className="space-y-2">
          <div className="flex items-center gap-2" title="Nombre descriptivo de la actividad que realizarán los trabajadores">
            <FileText size={18} className="text-blue-600" />
            <label className="text-sm font-medium">Nombre de la Actividad</label>
            <span className="text-red-500">*</span>
          </div>
          <input
            type="text"
            placeholder="Ej: Operación de maquinaria pesada"
            value={formData.name}
            onChange={(e) => updateFormData('name')(e.target.value)}
            required
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              formData.name ? "border-green-500" : "border-gray-300"
            }`}
          />
          <p className="text-sm text-gray-500">Este nombre aparecerá en las solicitudes de aplicación</p>
          {formState.error && !formData.name && (
            <p className="text-sm text-red-500">El nombre es obligatorio</p>
          )}
        </div>

        {/* Campo Licencia */}
        <div className="space-y-2">
          <div className="flex items-center gap-2" title="Tipo de licencia de conducir requerida para esta actividad (opcional)">
            <CreditCard size={18} className="text-blue-600" />
            <label className="text-sm font-medium">Licencia Requerida</label>
          </div>
          <input
            type="text"
            placeholder="Ej: Clase B, Clase C, No requerida"
            value={formData.requiredDriverLicense}
            onChange={(e) => updateFormData('requiredDriverLicense')(e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              formData.requiredDriverLicense ? "border-green-500" : "border-gray-300"
            }`}
          />
          <p className="text-sm text-gray-500">Especifique el tipo de licencia si es necesaria para la actividad</p>
        </div>

        {/* Campo Imagen */}
        <div className="space-y-2">
          <div className="flex items-center gap-2" title="Imagen referencial que ayude a identificar visualmente la actividad">
            <Camera size={18} className="text-blue-600" />
            <label className="text-sm font-medium">Imagen Referencial</label>
          </div>
          
          <div className="space-y-4">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => updateFormData('imageFile')(e.target.files?.[0] || null)}
              className="w-full file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 file:cursor-pointer cursor-pointer"
            />
            
            {imagePreview && (
              <div className="mt-4">
                <p className="text-sm text-gray-500 mb-2">Vista previa:</p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imagePreview}
                  alt="Vista previa"
                  className="max-w-xs rounded-lg border border-gray-200"
                />
              </div>
            )}
          </div>
        </div>

        {/* Mensajes de estado */}
        {formState.error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
            <AlertCircle size={18} />
            <span className="text-sm">{formState.error}</span>
          </div>
        )}
        
        {formState.success && (
          <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700">
            <CheckCircle2 size={18} />
            <span className="text-sm">{formState.success}</span>
          </div>
        )}

        {/* Botones */}
        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={!formData.name.trim() || formState.loading}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {formState.loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Creando actividad...
              </>
            ) : (
              <>
                <Save size={18} />
                Crear Actividad
              </>
            )}
          </button>
          
          <button
            type="button"
            onClick={() => {
              setFormData({ name: '', requiredDriverLicense: '', imageFile: null });
              setImagePreview(null);
              localStorage.removeItem('activityForm');
            }}
            disabled={formState.loading}
            className="px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
          >
            Limpiar
          </button>
        </div>
      </form>
    </div>
  );
}
