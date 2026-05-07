import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { updateDocumentation } from '@/actions/documentations/update-documentation';

interface EditDocumentationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  documentation?: {
    id: string;
    name: string;
  };
}

export function EditDocumentationModal({
  isOpen,
  onClose,
  onSubmit,
  documentation,
}: EditDocumentationModalProps) {
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Actualizar estados cuando cambia la documentación
  useEffect(() => {
    if (documentation) {
      setName(documentation.name);
    }
  }, [documentation]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const result = await updateDocumentation(documentation?.id ?? '', {
        name,
      });

      if (!result.success) {
        setError(result.error || 'Error al actualizar la documentación');
        return;
      }

      onSubmit();
    } catch (error) {
      setError('Error al actualizar la documentación');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Editar Documentación</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre del documento</Label>
            <Input
              id="name"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Nombre del documento"
            />
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm p-3 rounded-md mt-4">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-2 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Guardando...' : 'Guardar'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
