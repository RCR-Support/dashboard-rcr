"use client";
import { useState } from "react";
import { createDocumentation } from '@/actions/documentations/create-documentation';
import { DatePicker } from "@/components/date-picker";

export default function DocumentationForm() {
  const [name, setName] = useState("");
  // Por defecto todos son globales, solo si se marca es específico
  const [isSpecific, setIsSpecific] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    if (!name) {
      setError("El nombre es obligatorio");
      setLoading(false);
      return;
    }
    try {
      await createDocumentation(name, !isSpecific);
      setSuccess("Documentación creada correctamente");
      setName("");
      setIsSpecific(false);
    } catch (err: any) {
      setError("Error al crear documentación");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto bg-white dark:bg-gray-800 p-6 rounded-lg shadow mb-8">
      <h2 className="text-xl font-bold mb-4">Crear nueva documentación</h2>
      <div className="mb-4">
        <label className="block mb-1 font-medium">Nombre <span className="text-red-500">*</span></label>
        <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full p-2 border rounded" required />
      </div>
      <div className="mb-4 flex gap-4">
        <label className="flex items-center">
          <input type="checkbox" checked={isSpecific} onChange={e => setIsSpecific(e.target.checked)} className="mr-2" />
          Curso específico para el área a desarrollar
        </label>
      </div>
        
      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded" disabled={loading}>{loading ? "Creando..." : "Crear documentación"}</button>
      {error && <p className="text-red-500 mt-2">{error}</p>}
      {success && <p className="text-green-500 mt-2">{success}</p>}
    </form>
  );
}
