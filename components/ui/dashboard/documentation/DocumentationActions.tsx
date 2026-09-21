'use client';

import { Button } from '@heroui/react';
import { Pencil, Trash2 } from 'lucide-react';

interface DocumentationActionsProps {
  canDelete: boolean;
  canEdit: boolean;
  fullWidth?: boolean;
  onDelete: () => void;
  onEdit: () => void;
}

export function DocumentationActions({
  canDelete,
  canEdit,
  fullWidth = false,
  onDelete,
  onEdit,
}: DocumentationActionsProps) {
  return (
    <div className="flex gap-2">
      {canEdit && (
        <Button
          size="sm"
          variant="flat"
          color="default"
          startContent={<Pencil className="h-3.5 w-3.5" />}
          onClick={onEdit}
          className={fullWidth ? 'flex-1' : undefined}
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
          onClick={onDelete}
          className={fullWidth ? 'flex-1' : undefined}
        >
          Eliminar
        </Button>
      )}
    </div>
  );
}