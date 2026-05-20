import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CheckCircle2, AlertCircle, Upload, XCircle, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { ImageEditorModal } from '@/components/ui/ImageEditorModal';
import { useApplicationFormStore } from '@/store/application-form-store';
import { validateAndProcessFile, formatFileSize } from '@/lib/file-utils';
import Swal from 'sweetalert2';

import { DocumentData } from '../types';

interface DocumentListProps {
  documents: DocumentData[];
  onFileSelect: (documentId: string, file: File) => void;
  onDateChange: (documentId: string, date: Date | null) => void;
  onDocumentsUpdate?: (documents: DocumentData[]) => void; // Nuevo callback
}

export function DocumentList({ documents, onFileSelect, onDateChange, onDocumentsUpdate }: DocumentListProps) {
  const setCredentialPhoto = useApplicationFormStore(
    state => state.setCredentialPhoto
  );
  const setDocuments = useApplicationFormStore(state => state.setDocuments);
  const [imageEditorOpen, setImageEditorOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<{
    src: string;
    file: File;
    documentId: string;
  } | null>(null);
  const [uploadingDocs, setUploadingDocs] = useState<Set<string>>(new Set());
  
  const isUploading = (docId: string) => uploadingDocs.has(docId);
  
  const setUploading = (docId: string, uploading: boolean) => {
    setUploadingDocs(prev => {
      const newSet = new Set(prev);
      if (uploading) {
        newSet.add(docId);
      } else {
        newSet.delete(docId);
      }
      return newSet;
    });
  };

  const formatActivitiesList = (activities: string[]) => {
    if (!activities || activities.length === 0) return '';
    if (activities.length === 1) return activities[0];
    if (activities.length === 2) return `${activities[0]} y ${activities[1]}`;

    const lastActivity = activities[activities.length - 1];
    const previousActivities = activities.slice(0, -1).join(', ');
    return `${previousActivities} y ${lastActivity}`;
  };

  const getAcceptedFiles = (
    acceptedFileType?: 'PDF' | 'IMAGE' | 'DOCUMENT' | 'ANY'
  ) => {
    switch (acceptedFileType) {
      case 'IMAGE':
        return 'image/jpeg,image/jpg,image/png,image/webp';
      case 'PDF':
        return '.pdf';
      case 'DOCUMENT':
        return '.pdf,.doc,.docx';
      case 'ANY':
      default:
        return '.pdf,.doc,.docx,image/jpeg,image/jpg,image/png';
    }
  };

  const getFileTypeLabel = (
    acceptedFileType?: 'PDF' | 'IMAGE' | 'DOCUMENT' | 'ANY'
  ) => {
    switch (acceptedFileType) {
      case 'IMAGE':
        return '📷 Solo imágenes (JPG, PNG, WEBP)';
      case 'PDF':
        return '📄 Solo PDF';
      case 'DOCUMENT':
        return '📑 Documentos (PDF, DOC, DOCX)';
      case 'ANY':
      default:
        return '📎 Cualquier archivo';
    }
  };

  const getStatusIcon = (status: DocumentData['status']) => {
    switch (status) {
      case 'approved':
        return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'completed':
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'uploading':
        return <Upload className="w-5 h-5 text-blue-500 animate-pulse" />;
      default:
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
    }
  };

  const handleFileChange =
    (documentId: string) => async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      const doc = documents.find(d => d.id === documentId);
      if (!doc) return;

      // Marcar como subiendo
      setUploading(documentId, true);

      // Validar y procesar el archivo
      const validation = await validateAndProcessFile(file, doc.acceptedFileType || 'ANY');
      
      if (!validation.valid) {
        setUploading(documentId, false);
        await Swal.fire({
          icon: 'error',
          title: 'Archivo no válido',
          text: validation.error,
        });
        // Limpiar el input
        event.target.value = '';
        return;
      }

      const processedFile = validation.processedFile!;
      
      // Si es imagen, abrir editor
      if (doc.acceptedFileType === 'IMAGE') {
        setUploading(documentId, false);
        const reader = new FileReader();
        reader.onloadend = () => {
          setSelectedImage({
            src: reader.result as string,
            file: processedFile,
            documentId,
          });
          setImageEditorOpen(true);
        };
        reader.readAsDataURL(processedFile);
      } else {
        // Para PDFs y otros, seleccionar directamente
        onFileSelect(documentId, processedFile);
        setUploading(documentId, false);
        
        // Mostrar información del archivo
        const originalSize = formatFileSize(file.size);
        const processedSize = formatFileSize(processedFile.size);
        
        if (file.size !== processedFile.size) {
          await Swal.fire({
            icon: 'success',
            title: 'Archivo optimizado',
            text: `Original: ${originalSize} → Optimizado: ${processedSize}`,
            timer: 2000,
          });
        }
      }
    };

  const handleImageSave = (editedFile: File) => {
    if (selectedImage) {
      // Guardar el archivo en el estado del documento
      onFileSelect(selectedImage.documentId, editedFile);

      // Si es la foto de credencial, también guardar en el store para mostrar en el resumen
      if (selectedImage.documentId === 'credential-photo') {
        const reader = new FileReader();
        reader.onloadend = () => {
          setCredentialPhoto(reader.result as string);
        };
        reader.readAsDataURL(editedFile);
      }

      setImageEditorOpen(false);
      setSelectedImage(null);
    }
  };

  const handleImageCancel = () => {
    setImageEditorOpen(false);
    setSelectedImage(null);
  };
  
  const handleRemoveFile = (_documentId: string) => {
    Swal.fire({
      title: '¿Eliminar archivo?',
      text: 'Tendrás que volver a subir el archivo',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        // Pasar null para eliminar el archivo        onFileSelect(_documentId, null);
      }
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
      {documents.map(doc => (
        <Card
          key={doc.id}
          className={cn(
            'p-4 space-y-4',
            doc.id === 'credential-photo' &&
              'border-2 border-blue-500 bg-blue-50/50 dark:bg-blue-950/20'
          )}
        >
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="font-medium">{doc.name}</h3>
                {doc.id === 'credential-photo' && (
                  <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-white bg-blue-600 rounded-full">
                    Obligatorio
                  </span>
                )}
              </div>
              {doc.acceptedFileType === 'IMAGE' && (
                <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                  {getFileTypeLabel(doc.acceptedFileType)}
                </p>
              )}
              {doc.isSpecific ? (
                <p className="text-sm text-muted-foreground">
                  Actividad: {doc.activityName}
                </p>
              ) : (
                doc.relatedActivities &&
                doc.relatedActivities.length > 0 && (
                  <p className="text-sm text-muted-foreground">
                    Actividad: {formatActivitiesList(doc.relatedActivities)}
                  </p>
                )
              )}
              {doc.notes && (
                <p className="text-sm text-muted-foreground">{doc.notes}</p>
              )}
              {doc.isSpecific && doc.id !== 'credential-photo' && (
                <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-primary-foreground bg-primary rounded-full">
                  Específico
                </span>
              )}
            </div>
            {getStatusIcon(doc.status)}
          </div>

          {/* Mostrar motivo de rechazo si existe */}
          {doc.status === 'rejected' && doc.rejectionReason && (
            <div className="p-3 bg-red-50 border-l-4 border-red-500 text-sm text-red-700">
              <p className="font-semibold">Motivo del rechazo:</p>
              <p>{doc.rejectionReason}</p>
            </div>
          )}

          {/* Chip para documento aprobado */}
          {doc.status === 'approved' && (
            <div className="p-3 bg-green-50 border-l-4 border-green-500 text-sm space-y-2">
              <div className="flex items-center gap-2 text-green-700">
                <CheckCircle2 className="w-4 h-4" />
                <span className="font-semibold">Documento aprobado - No requiere cambios</span>
              </div>
              <div className="text-xs text-green-600">
                Si el trabajador trajo una versión actualizada (ej: curso renovado), puedes reemplazarlo. El documento requerirá nueva aprobación.
              </div>
            </div>
          )}

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <input
                type="file"
                id={`file-${doc.id}`}
                className="hidden"
                onChange={handleFileChange(doc.id)}
                accept={getAcceptedFiles(doc.acceptedFileType)}
                disabled={doc.status === 'approved'}
              />
              
              {/* Botón principal: Subir/Aprobado/Rechazado */}
              <Button
                type="button"
                variant={doc.file ? 'outline' : 'default'}
                className={cn(
                  'flex-1',
                  doc.status === 'completed' && 'bg-green-500 hover:bg-green-600',
                  doc.status === 'error' && 'bg-red-500 hover:bg-red-600',
                  doc.status === 'approved' && 'bg-green-600 cursor-not-allowed opacity-70',
                  doc.status === 'rejected' && 'bg-orange-500 hover:bg-orange-600'
                )}
                onClick={() => document.getElementById(`file-${doc.id}`)?.click()}
                disabled={isUploading(doc.id) || doc.status === 'approved'}
              >
                {doc.status === 'approved' ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Aprobado
                  </>
                ) : isUploading(doc.id) ? (
                  <>
                    <Upload className="w-4 h-4 mr-2 animate-pulse" />
                    Cargando...
                  </>
                ) : doc.status === 'rejected' ? (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Reemplazar documento rechazado
                  </>
                ) : doc.file ? (
                  doc.file.name
                ) : (
                  'Seleccionar archivo'
                )}
              </Button>
              
              {/* Botón para actualizar documento aprobado */}
              {doc.status === 'approved' && (
                <Button
                  type="button"
                  variant="outline"
                  className="border-orange-500 text-orange-600 hover:bg-orange-50"
                  onClick={async () => {
                    const result = await Swal.fire({
                      title: '¿Actualizar documento aprobado?',
                      html: `
                        <p class="text-sm mb-2">Estás a punto de reemplazar:</p>
                        <p class="font-semibold mb-3">${doc.name}</p>
                        <p class="text-sm text-gray-600">El documento actual será eliminado y deberás subir una nueva versión. Esta acción requerirá una nueva aprobación del revisor.</p>
                      `,
                      icon: 'warning',
                      showCancelButton: true,
                      confirmButtonColor: '#f97316',
                      cancelButtonColor: '#6b7280',
                      confirmButtonText: 'Sí, actualizar',
                      cancelButtonText: 'Cancelar',
                    });

                    if (result.isConfirmed) {
                      const updatedDocs = documents.map(d =>
                        d.id === doc.id
                          ? { ...d, status: 'pending' as const, url: undefined }
                          : d
                      );
                      if (onDocumentsUpdate) {
                        onDocumentsUpdate(updatedDocs);
                      }
                      setDocuments(updatedDocs);
                      
                      Swal.fire({
                        title: 'Documento listo para actualizar',
                        text: 'Ahora puedes subir la nueva versión del documento',
                        icon: 'success',
                        timer: 2000,
                        showConfirmButton: false,
                      });
                    }
                  }}
                  title="Actualizar con nueva versión del documento"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Actualizar
                </Button>
              )}
              
              {doc.file && !isUploading(doc.id) && doc.status !== 'approved' && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  onClick={() => handleRemoveFile(doc.id)}
                  title="Eliminar archivo"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
            
            {/* Campo de fecha de expiración - para todos los documentos excepto foto */}
            {doc.id !== 'credential-photo' && (
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium whitespace-nowrap">
                  Fecha de expiración:
                </label>
                <input
                  type="date"
                  value={doc.expiresAt ? new Date(doc.expiresAt).toISOString().split('T')[0] : ''}
                  onChange={(e) => {
                    const date = e.target.value ? new Date(e.target.value) : null;
                    if (date) {
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);
                      if (date < today) {
                        e.target.value = doc.expiresAt
                          ? new Date(doc.expiresAt).toISOString().split('T')[0]
                          : '';
                        return;
                      }
                    }
                    onDateChange(doc.id, date);
                  }}
                  min={new Date().toISOString().split('T')[0]}
                  className="flex-1 px-3 py-2 border rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  required={!!doc.file}
                  disabled={doc.status === 'approved'}
                />
              </div>
            )}
          </div>
        </Card>
      ))}

      {/* Image Editor Modal */}
      {selectedImage && (
        <ImageEditorModal
          isOpen={imageEditorOpen}
          imageSrc={selectedImage.src}
          originalFile={selectedImage.file}
          onSave={handleImageSave}
          onCancel={handleImageCancel}
        />
      )}
    </div>
  );
}
