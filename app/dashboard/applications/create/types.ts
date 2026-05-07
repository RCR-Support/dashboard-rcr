export interface DocumentData {
  id: string;
  name: string;
  activityName?: string;
  notes?: string;
  isSpecific: boolean;
  relatedActivities?: string[];
  file?: File;
  url?: string; // URL del archivo subido en Cloudinary
  status: 'pending' | 'uploading' | 'completed' | 'error' | 'approved' | 'rejected';
  quantity?: number; // Cantidad de copias requeridas
  documentationId?: string; // ID del tipo de documento (para específicos)
  activityId?: string; // ID de la actividad (para específicos)
  acceptedFileType?: 'PDF' | 'IMAGE' | 'DOCUMENT' | 'ANY'; // Tipo de archivo aceptado
  expiresAt?: Date | null; // Fecha de expiración del documento
  rejectionReason?: string | null; // Motivo del rechazo en modo edición
}
