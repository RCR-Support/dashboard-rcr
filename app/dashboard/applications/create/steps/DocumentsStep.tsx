import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Contract } from '@/interfaces/contract.interface';
import { DocumentList } from '../components/DocumentList';
import { useApplicationFormStore } from '@/store/application-form-store';
import { DocumentData } from '../types';
import Swal from 'sweetalert2';
import { Progress } from '@heroui/progress';
import { FileText, CheckCircle2, Clock } from 'lucide-react';
import { Chip } from '@heroui/chip';

interface DocumentsStepProps {
  contract: Contract | null;
  initialData: DocumentData[] | null;
  onNext: (documents: DocumentData[]) => void;
  onBack: () => void;
  onCancel?: () => void;
  isSubmitting?: boolean;
}

export function DocumentsStep({
  contract,
  initialData,
  onNext,
  onBack,
  isSubmitting = false,
}: DocumentsStepProps) {
  const selectedActivities = useApplicationFormStore(
    state => state.selectedActivities
  );
  const credentialPhoto = useApplicationFormStore(
    state => state.credentialPhoto
  );
  const [documents, setDocuments] = useState<DocumentData[]>(initialData || []);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadRequiredDocuments = async () => {
      setIsLoading(true);
      try {
        // Mapa para rastrear documentos globales por documentationId
        const globalDocuments = new Map<string, DocumentData>();
        const specificDocuments: DocumentData[] = [];

        // Por cada actividad, procesar sus documentos requeridos
        selectedActivities.forEach(activity => {
          activity.requiredDocumentations?.forEach(doc => {
            const documentationId = doc.documentation.id;

            if (!doc.isSpecific) {
              // Si NO es específico (documento global/común)
              // Solo lo agregamos UNA vez aunque esté en múltiples actividades
              if (!globalDocuments.has(documentationId)) {
                globalDocuments.set(documentationId, {
                  id: documentationId, // ← Usamos documentationId para que sea único
                  documentationId: documentationId, // ← CRÍTICO: Necesario para guardar en DB
                  name: doc.documentation.name,
                  notes: doc.notes || undefined,
                  isSpecific: false,
                  status: 'pending',
                  relatedActivities: [activity.name],
                  activityName: undefined,
                  quantity: doc.quantity || undefined,
                  acceptedFileType: doc.documentation.acceptedFileType || 'PDF',
                });
              } else {
                // Si ya existe, solo agregamos la actividad a la lista
                const existingDoc = globalDocuments.get(documentationId);
                if (existingDoc && existingDoc.relatedActivities) {
                  // Evitar duplicar el nombre de la actividad
                  if (!existingDoc.relatedActivities.includes(activity.name)) {
                    existingDoc.relatedActivities.push(activity.name);
                  }
                  // Actualizar la cantidad si es mayor
                  if (
                    doc.quantity &&
                    (!existingDoc.quantity ||
                      doc.quantity > existingDoc.quantity)
                  ) {
                    existingDoc.quantity = doc.quantity;
                  }
                }
              }
            } else {
              // Si ES específico, lo agregamos por cada actividad
              // Usamos doc.id (ActivityDocumentation.id) como identificador único
              specificDocuments.push({
                id: `${documentationId}-${activity.id}`, // ← ID único: documentationId + activityId
                name: doc.documentation.name,
                activityName: activity.name,
                notes: doc.notes || undefined,
                isSpecific: true,
                status: 'pending',
                relatedActivities: [activity.name],
                quantity: doc.quantity || undefined,
                documentationId: documentationId, // ← Guardamos el documentationId original
                activityId: activity.id, // ← Guardamos el activityId
                acceptedFileType: doc.documentation.acceptedFileType || 'PDF',
              });
            }
          });
        });

        // Nota: La foto de credencial ahora se maneja en el WorkerStep

        // Combinar documentos: solo globales y específicos
        const allDocuments = [
          ...Array.from(globalDocuments.values()),
          ...specificDocuments,
        ];

        // Verificar si existen documentos cargados en modo edición
        const storeState = useApplicationFormStore.getState();
        const existingDocumentsMap = storeState.existingDocuments;
        
        if (existingDocumentsMap && existingDocumentsMap instanceof Map) {
          // Marcar documentos existentes según su estado de aprobación
          allDocuments.forEach(doc => {
            const existingDoc = existingDocumentsMap.get(doc.id);
            if (existingDoc) {
              doc.url = existingDoc.url;
              doc.expiresAt = existingDoc.expiresAt;
              
              // Según el estado de aprobación
              if (existingDoc.approvalStatus === 'approved') {
                doc.status = 'approved'; // Bloqueado, no editable
              } else if (existingDoc.approvalStatus === 'rejected') {
                doc.status = 'rejected'; // Rechazado, editable con motivo
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (doc as any).rejectionReason = existingDoc.rejectionReason;
              } else {
                doc.status = 'completed'; // Pendiente, mantener como completado
              }
            }
          });
        }

        setDocuments(allDocuments);
      } catch {
        // Error al cargar documentos
      } finally {
        setIsLoading(false);
      }
    };

    loadRequiredDocuments();
  }, [selectedActivities]);

  const handleFileSelect = async (documentId: string, file: File | null) => {
    // Si file es null, eliminar el archivo
    if (!file) {
      setDocuments(prevDocs =>
        prevDocs.map(doc =>
          doc.id === documentId 
            ? { ...doc, file: undefined, url: undefined, status: 'pending' as const }
            : doc
        )
      );
      return;
    }
    
    // Marcar como "uploading"
    setDocuments(prevDocs =>
      prevDocs.map(doc =>
        doc.id === documentId ? { ...doc, status: 'uploading' as const } : doc
      )
    );

    try {
      // Subir archivo a Cloudinary
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'applications/documents');

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Error al subir el archivo');
      }

      // Actualizar documento con URL y marcar como completado
      setDocuments(prevDocs =>
        prevDocs.map(doc =>
          doc.id === documentId
            ? { 
                ...doc, 
                file, 
                url: result.url,
                status: 'completed' as const 
              }
            : doc
        )
      );
    } catch (error) {
      console.error('Error al subir archivo:', error);
      
      // Marcar como error
      setDocuments(prevDocs =>
        prevDocs.map(doc =>
          doc.id === documentId ? { ...doc, status: 'error' as const } : doc
        )
      );

      // Mostrar error al usuario
      await Swal.fire({
        icon: 'error',
        title: 'Error al subir archivo',
        text: error instanceof Error ? error.message : 'Ocurrió un error al subir el archivo',
      });
    }
  };

  const handleDateChange = (documentId: string, date: Date | null) => {
    setDocuments(prevDocs =>
      prevDocs.map(doc =>
        doc.id === documentId 
          ? { ...doc, expiresAt: date }
          : doc
      )
    );
  };

  const handleNext = () => {
    // Validar que la foto de credencial esté presente
    const credentialPhoto = useApplicationFormStore.getState().credentialPhoto;
    
    if (!credentialPhoto) {
      Swal.fire({
        icon: 'warning',
        title: 'Foto de credencial requerida',
        text: 'Por favor sube la foto de credencial del trabajador en el paso "Información del trabajador"',
        confirmButtonText: 'Entendido',
      });
      return;
    }

    // Validar que todos los documentos estén subidos
    const pendingDocs = documents.filter(doc => doc.status === 'pending');
    if (pendingDocs.length > 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Documentos pendientes',
        text: `Faltan ${pendingDocs.length} documento(s) por subir`,
        confirmButtonText: 'Entendido',
      });
      return;
    }

    // Validar que no haya documentos rechazados sin reemplazar
    const rejectedDocs = documents.filter(doc => doc.status === 'rejected');
    if (rejectedDocs.length > 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Documentos rechazados',
        text: `Debes reemplazar ${rejectedDocs.length} documento(s) rechazado(s) antes de continuar`,
        confirmButtonText: 'Entendido',
      });
      return;
    }

    // Validar que todos los documentos (excepto foto de credencial) tengan fecha
    const docsWithoutDate = documents.filter(
      doc => doc.id !== 'credential-photo' && doc.url && !doc.expiresAt
    );
    if (docsWithoutDate.length > 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Fechas de expiración requeridas',
        text: 'Por favor indica la fecha de expiración de todos los documentos',
        confirmButtonText: 'Entendido',
      });
      return;
    }

    onNext(documents);
  };

  if (!contract) {
    return (
      <div className="text-center space-y-4 py-8">
        <p className="text-muted-foreground">
          Por favor seleccione un contrato primero
        </p>
        <Button onClick={onBack} variant="secondary">
          Volver
        </Button>
      </div>
    );
  }

  // Cálculos de progreso
  const docsWithUrl = documents.filter(doc => doc.url);
  const progressPercentage = documents.length > 0 ? (docsWithUrl.length / documents.length) * 100 : 0;
  const docsPending = documents.filter(doc => !doc.url);
  const docsCompleted = documents.filter(doc => doc.url);

  return (
    <div className="space-y-6">
      {/* Header con progreso mejorado */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileText className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">Documentos Requeridos</h2>
          </div>
          <div className="flex items-center gap-2">
            <Chip size="sm" color={progressPercentage === 100 ? "success" : "warning"} variant="flat">
              {docsWithUrl.length}/{documents.length} completados
            </Chip>
          </div>
        </div>
        
        <p className="text-sm text-muted-foreground">
          Sube los documentos necesarios para:{' '}
          <span className="font-medium text-primary">
            {selectedActivities.map(a => a.name).join(', ')}
          </span>
        </p>
        
        {/* Progress bar */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">Progreso de documentación</span>
            <span className="font-medium">{Math.round(progressPercentage)}%</span>
          </div>
          <Progress 
            value={progressPercentage} 
            className="h-2" 
            color={progressPercentage === 100 ? "success" : progressPercentage > 50 ? "warning" : "primary"}
          />
        </div>
        
        {/* Resumen rápido */}
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <span>{docsCompleted.length} subidos</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4 text-orange-500" />
            <span>{docsPending.length} pendientes</span>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="min-h-[200px] flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary"></div>
        </div>
      ) : documents.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">
            No hay documentos requeridos para las actividades seleccionadas
          </p>
        </div>
      ) : (
        <DocumentList 
          documents={documents} 
          onFileSelect={handleFileSelect} 
          onDateChange={handleDateChange}
          onDocumentsUpdate={setDocuments}
        />
      )}

      {!credentialPhoto && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            ⚠️ <strong>Falta foto de credencial:</strong> Por favor sube la foto de credencial del trabajador en el paso &quot;Información del trabajador&quot; antes de enviar la solicitud.
          </p>
        </div>
      )}

      <div className="flex justify-between pt-6">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onBack}
          disabled={isSubmitting}
        >
          Volver
        </Button>
        <Button
          onClick={handleNext}
          disabled={
            !credentialPhoto || 
            documents.some(doc => doc.status === 'pending') || 
            documents.some(doc => doc.id !== 'credential-photo' && !doc.url) ||
            documents.some(doc => doc.id !== 'credential-photo' && doc.url && !doc.expiresAt) ||
            isSubmitting
          }
        >
          {isSubmitting ? 'Enviando...' : 'Enviar solicitud'}
        </Button>
      </div>
    </div>
  );
}
