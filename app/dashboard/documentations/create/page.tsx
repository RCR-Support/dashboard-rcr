'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createDocumentation } from '@/actions/documentations/create-documentation';
import { withPermission } from '@/components/ui/auth/withPermission';
import { Button, Input, Select, SelectItem } from '@heroui/react';
import { FileText, ArrowLeft, Save, Image, File, FileQuestion } from 'lucide-react';
import Link from 'next/link';

type AcceptedFileType = 'PDF' | 'IMAGE' | 'DOCUMENT' | 'ANY';

// Valores del enum AcceptedFileType de Prisma
const fileTypes = [
  { value: 'PDF', label: 'Solo PDF', icon: FileText, description: 'Archivos en formato PDF' },
  { value: 'IMAGE', label: 'Imágenes', icon: Image, description: 'JPG, PNG, etc.' },
  { value: 'DOCUMENT', label: 'Documentos', icon: File, description: 'PDF, DOC, DOCX' },
  { value: 'ANY', label: 'Cualquier tipo', icon: FileQuestion, description: 'Sin restricción de formato' },
];

function CreateDocumentationPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [acceptedFileType, setAcceptedFileType] = useState<AcceptedFileType>('PDF');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (!name.trim()) {
      setError('El nombre es obligatorio');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await createDocumentation(name, acceptedFileType);
      if (result.success) {
        router.push('/dashboard/documentations');
        router.refresh();
      } else {
        setError(result.error || 'Error al crear documentación');
      }
    } catch (err) {
      setError('Error al crear documentación');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Link 
          href="/dashboard/documentations"
          className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a documentaciones
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Nueva Documentación
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Crea un nuevo tipo de documento requerido para las actividades
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100 dark:border-gray-700">
          <div className="p-2 bg-primary/10 rounded-lg">
            <FileText className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900 dark:text-white">Información del documento</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Completa los datos del tipo de documento</p>
          </div>
        </div>

        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Nombre del documento <span className="text-red-500">*</span>
            </label>
            <Input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Certificado de antecedentes"
              variant="bordered"
              size="lg"
              classNames={{
                input: "text-base",
                inputWrapper: "border-gray-200 dark:border-gray-600"
              }}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tipo de archivo aceptado
            </label>
            <Select
              selectedKeys={[acceptedFileType]}
              onSelectionChange={(keys) => {
                const selected = Array.from(keys)[0];
                if (selected) setAcceptedFileType(selected as AcceptedFileType);
              }}
              variant="bordered"
              size="lg"
              classNames={{
                trigger: "border-gray-200 dark:border-gray-600"
              }}
            >
              {fileTypes.map((type) => (
                <SelectItem key={type.value} textValue={type.label}>
                  <div className="flex items-center gap-2">
                    <type.icon className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="font-medium">{type.label}</p>
                      <p className="text-xs text-gray-500">{type.description}</p>
                    </div>
                  </div>
                </SelectItem>
              ))}
            </Select>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Define qué tipo de archivo podrán subir los usuarios
            </p>
          </div>

          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100 dark:border-gray-700">
          <Link href="/dashboard/documentations">
            <Button variant="flat" color="default">
              Cancelar
            </Button>
          </Link>
          <Button
            type="submit"
            color="primary"
            isLoading={loading}
            startContent={!loading && <Save className="h-4 w-4" />}
          >
            {loading ? 'Creando...' : 'Crear Documentación'}
          </Button>
        </div>
      </form>
    </div>
  );
}

const ProtectedCreateDocumentationPage = withPermission(
  CreateDocumentationPage,
  '/dashboard/documentations/create'
);

export default ProtectedCreateDocumentationPage;
