'use client';
import { useState } from 'react';
// Recibe onSuccess como prop para redirigir tras crear
export default function ActivityForm({
  onSuccess,
}: {
  onSuccess?: () => void;
}) {
  const [name, setName] = useState('');
  const [requiredDriverLicense, setRequiredDriverLicense] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    if (!name) {
      setError('El nombre es obligatorio');
      setLoading(false);
      return;
    }
    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('requiredDriverLicense', requiredDriverLicense);
      if (imageFile) formData.append('image', imageFile);
      // Llamada directa a server action
      // @ts-expect-error - Dynamic import
      const { createActivityServer } = await import('./actions');
      await createActivityServer(formData);
      setSuccess('Actividad creada correctamente');
      setName('');
      setRequiredDriverLicense('');
      setImageFile(null);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError('Error al crear actividad');
    } finally {
      setLoading(false);
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
          value={name}
          onChange={e => setName(e.target.value)}
          className="w-full p-2 border rounded"
          required
        />
      </div>
      <div className="mb-4">
        <label className="block mb-1 font-medium">Licencia requerida</label>
        <input
          type="text"
          value={requiredDriverLicense}
          onChange={e => setRequiredDriverLicense(e.target.value)}
          className="w-full p-2 border rounded"
          placeholder="Ej: Clase B"
        />
      </div>
      <div className="mb-4">
        <label className="block mb-1 font-medium">Imagen referencial</label>
        <input
          type="file"
          accept="image/*"
          onChange={e => setImageFile(e.target.files?.[0] || null)}
          className="w-full"
        />
      </div>
      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded"
        disabled={loading}
      >
        {loading ? 'Creando...' : 'Crear actividad'}
      </button>
      {error && <p className="text-red-500 mt-2">{error}</p>}
      {success && <p className="text-green-500 mt-2">{success}</p>}
    </form>
  );
}
