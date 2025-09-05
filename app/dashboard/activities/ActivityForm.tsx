'use client';
import { useState } from 'react';

interface ActivityFormData {
  name: string;
  requiredDriverLicense: string;
  imageFile: File | null;
}

interface ActivityFormProps {
  onSuccess?: () => void;
}

// Recibe onSuccess como prop para redirigir tras crear
export default function ActivityForm({
  onSuccess,
}: ActivityFormProps) {
  const [formData, setFormData] = useState<ActivityFormData>({
    name: '',
    requiredDriverLicense: '',
    imageFile: null
  });
  const [formState, setFormState] = useState({
    loading: false,
    error: '',
    success: ''
  });

  const updateFormData = (field: keyof ActivityFormData) => (
    value: string | File | null
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormState(prev => ({ ...prev, loading: true, error: '', success: '' }));

    if (!formData.name) {
      setFormState(prev => ({
        ...prev,
        loading: false,
        error: 'El nombre es obligatorio'
      }));
      return;
    }

    try {
      const submitData = new FormData();
      submitData.append('name', formData.name);
      submitData.append('requiredDriverLicense', formData.requiredDriverLicense);
      if (formData.imageFile) submitData.append('image', formData.imageFile);
      
      // Llamada directa a server action
      const { createActivityServer } = await import('./actions');
      await createActivityServer(submitData);
      
      setFormState(prev => ({
        ...prev,
        success: 'Actividad creada correctamente'
      }));
      setFormData({
        name: '',
        requiredDriverLicense: '',
        imageFile: null
      });
      
      if (onSuccess) onSuccess();
    } catch (err: unknown) {
      console.error('Error creating activity:', err);
      setFormState(prev => ({
        ...prev,
        error: err instanceof Error ? err.message : 'Error al crear actividad'
      }));
    } finally {
      setFormState(prev => ({ ...prev, loading: false }));
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-md mx-auto bg-white dark:bg-gray-800 p-6 rounded-lg shadow mb-8"
    >
      <h2 className="text-xl font-bold mb-4">Crear nueva actividad</h2>
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
        <label className="block mb-1 font-medium">Licencia requerida</label>
        <input
          type="text"
          value={formData.requiredDriverLicense}
          onChange={e => updateFormData('requiredDriverLicense')(e.target.value)}
          className="w-full p-2 border rounded"
          placeholder="Ej: Clase B"
        />
      </div>
      <div className="mb-4">
        <label className="block mb-1 font-medium">Imagen referencial</label>
        <input
          type="file"
          accept="image/*"
          onChange={e => updateFormData('imageFile')(e.target.files?.[0] || null)}
          className="w-full"
        />
      </div>
      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded"
        disabled={formState.loading}
      >
        {formState.loading ? 'Creando...' : 'Crear actividad'}
      </button>
      {formState.error && <p className="text-red-500 mt-2">{formState.error}</p>}
      {formState.success && <p className="text-green-500 mt-2">{formState.success}</p>}
    </form>
  );
}
