'use client';

import { Button } from '@heroui/button';
import { Card, CardBody, CardHeader } from '@heroui/card';
import { ApplicationStepper } from '../../create/stepper';
import { useEffect, useState } from 'react';
import { listActivities } from '@/actions/activities/list-activities';
import { useApplicationFormStore } from '@/store/application-form-store';
import { updateApplication } from '@/actions/applications/update-application';
import { createNewVersion } from '@/actions/applications/create-new-version';
import { getApplicationForEdit } from '@/actions/applications/get-application-for-edit';
import { getCompanyContracts } from '@/actions/contract/get-company-contracts';
import { useRouter, useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Swal from 'sweetalert2';
import { Spinner } from '@heroui/react';
import { AlertCircle } from 'lucide-react';

export default function EditApplicationPage() {
  const router = useRouter();
  const params = useParams();
  const { data: session } = useSession();
  const applicationId = params?.id as string;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isNewVersion, setIsNewVersion] = useState(false);
  const [rejectionDetails, setRejectionDetails] = useState<{
    details: string;
    reviewer: string;
    date: Date;
  } | null>(null);

  // Cargar datos de la aplicación existente
  useEffect(() => {
    if (!applicationId) {
      router.push('/dashboard/applications');
      return;
    }

    let isMounted = true;

    const loadData = async () => {
      try {
        // Cargar actividades disponibles
        const activities = await listActivities();
        if (activities && isMounted) {
          useApplicationFormStore.getState().setAvailableActivities(activities);
        }

        // Cargar datos de la aplicación
        const result = await getApplicationForEdit(applicationId);
        if (!result.success || !result.data) {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: result.message || 'No se pudo cargar la solicitud',
          });
          router.push('/dashboard/applications');
          return;
        }

        const app = result.data;

        // Pre-cargar datos en el store
        const store = useApplicationFormStore.getState();

        // Paso 1: Company data
        if (app.company) {
          store.setCompany({
            id: app.company.id,
            name: app.company.name || '',
            phone: undefined,
            email: undefined,
          });

          // Cargar TODOS los contratos disponibles de la empresa
          const contractsResult = await getCompanyContracts(app.company.id);
          if (contractsResult.ok && contractsResult.contracts) {
            store.setAvailableContracts(contractsResult.contracts);
          }
        }

        // Paso 2: Contract data (pre-seleccionar el actual)
        if (app.contract) {
          const contractData = {
            id: app.contract.id,
            contractNumber: app.contract.contractNumber,
            contractName: app.contract.contractName,
            initialDate: new Date(),
            finalDate: new Date(),
            companyId: app.company?.id || '',
            useracId: '',
            createdAt: new Date(),
            updatedAt: new Date(),
            deletedAt: null,
          };
          
          // Establecer el contrato actual como seleccionado
          store.setContract(contractData);
        }

        // Paso 3: Worker data
        const workerPhoto = app.documentationFiles.find(
          (doc) => doc.type === 'IMG' && !doc.documentationId
        );

        store.setWorkerData({
          workerName: app.workerName,
          workerPaternal: app.workerPaternal,
          workerMaternal: app.workerMaternal,
          workerRun: app.workerRun,
        });

        if (workerPhoto?.url) {
          store.setCredentialPhoto(workerPhoto.url);
        }

        // Paso 4: Activities - Cargar actividades completas y luego seleccionar las correctas
        // Las actividades ya están cargadas en el store desde listActivities
        const selectedActivityIds = app.activities.map((a) => a.id);
        const allActivities = store.availableActivities;
        
        // Filtrar las actividades completas que coincidan con los IDs seleccionados
        const selectedActivities = allActivities.filter((activity) =>
          selectedActivityIds.includes(activity.id)
        );
        
        store.setSelectedActivities(selectedActivities);

        // Paso 6: Documents - Necesitamos esperar a que DocumentsStep genere los documentos
        // Solo guardamos un mapa de los documentos existentes para marcarlos como completados después
        const existingDocumentsMap = new Map();
        app.documentationFiles
          .filter((doc) => doc.documentationId)
          .forEach((doc) => {
            // Clave: documentationId solo (para globales) o documentationId-activityId (para específicos)
            const key = doc.activityId 
              ? `${doc.documentationId}-${doc.activityId}`
              : doc.documentationId;
            
            existingDocumentsMap.set(key, {
              id: doc.id,
              name: doc.documentation?.name || 'Documento',
              url: doc.url,
              expiresAt: doc.expiresAt ? new Date(doc.expiresAt) : null,
              acceptedFileType: 'PDF',
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              approvalStatus: (doc as any).approvalStatus || 'pending',
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              rejectionReason: (doc as any).rejectionReason || null,
              activityId: doc.activityId,
              activityName: doc.activity?.name,
            });
          });

        // Guardar el mapa en el store temporalmente para que DocumentsStep lo use
        store.setExistingDocuments(existingDocumentsMap);

        // Generar el array de documentos para que ApplicationInfo pueda mostrarlos
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const documentsArray = Array.from(existingDocumentsMap.values()).map((doc: any) => {
          const status: 'approved' | 'rejected' | 'completed' = 
            doc.approvalStatus === 'approved' ? 'approved' : 
            doc.approvalStatus === 'rejected' ? 'rejected' : 'completed';
          
          return {
            id: doc.id,
            name: doc.name,
            url: doc.url,
            expiresAt: doc.expiresAt,
            status,
            activityId: doc.activityId,
            activityName: doc.activityName,
            acceptedFileType: doc.acceptedFileType,
            rejectionReason: doc.rejectionReason,
            isSpecific: !!doc.activityId, // true si tiene activityId (específico), false si es global
          };
        });
        
        store.setDocuments(documentsArray);

        // Guardar detalles del rechazo si existen
        if (app.audits && app.audits.length > 0) {
          const lastRejection = app.audits[0];
          if (lastRejection.details) {
            setRejectionDetails({
              details: lastRejection.details,
              reviewer: lastRejection.changedBy.displayName,
              date: lastRejection.changedAt,
            });
          }
        }

        // Detectar si es una solicitud aprobada (crear nueva versión en vez de editar)
        if (app.processStatus === 'aprobado' || 
            (app.stateAc === 'aprobado' && app.stateSheq === 'aprobado')) {
          setIsNewVersion(true);
        }

        setIsLoading(false);
      } catch (error) {
        console.error('Error al cargar datos:', error);
        if (isMounted) {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Error al cargar los datos',
          });
          router.push('/dashboard/applications');
        }
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [applicationId, router]);

  // Función para manejar el envío de la actualización
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleComplete = async (data: any) => {
    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      const documents = data.documents
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .filter((doc: any) => doc.url)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .map((doc: any) => ({
          documentationId: doc.documentationId,
          activityId: doc.activityId,
          url: doc.url,
          type: doc.acceptedFileType === 'IMAGE' ? 'IMG' : 'PDF',
          expiresAt: doc.expiresAt ? new Date(doc.expiresAt) : null,
        }));

      let result;

      if (isNewVersion) {
        // Solicitud aprobada: crear nueva versión
        result = await createNewVersion({
          originalApplicationId: applicationId,
          contractId: data.contract?.id || '',
          workerName: data.workerData.workerName,
          workerPaternal: data.workerData.workerPaternal,
          workerMaternal: data.workerData.workerMaternal,
          workerRun: data.workerData.workerRun,
          workerPhoto: useApplicationFormStore.getState().credentialPhoto || '',
          license: null,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          activities: data.activities.map((a: any) => a.id),
          zones: [],
          documents,
        });
      } else {
        // Solicitud rechazada: editar directamente
        result = await updateApplication({
          applicationId,
          userId: session?.user?.id || '',
          contractId: data.contract?.id || '',
          workerName: data.workerData.workerName,
          workerPaternal: data.workerData.workerPaternal,
          workerMaternal: data.workerData.workerMaternal,
          workerRun: data.workerData.workerRun,
          workerPhoto: useApplicationFormStore.getState().credentialPhoto || '',
          license: null,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          activities: data.activities.map((a: any) => a.id),
          zones: [],
          documents,
        });
      }

      if (result.success) {
        const redirectId = isNewVersion && 'applicationId' in result ? result.applicationId : applicationId;
        Swal.fire({
          icon: 'success',
          title: '¡Éxito!',
          text: result.message,
          confirmButtonText: 'Ver solicitud',
        }).then(() => {
          router.push(`/dashboard/applications/${redirectId}`);
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: result.message,
        });
      }
    } catch (error) {
      console.error('Error al actualizar:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Ocurrió un error al actualizar la solicitud',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner size="lg" label="Cargando datos..." />
      </div>
    );
  }

  return (
    <div className="container mx-auto lg:w-[1280px] px-4 flex flex-col gap-4">
      <div className="col-span-12 card-box flex justify-between items-center">
        <div>
          <h1 className="text-xl font-normal">
            {isNewVersion ? 'Crear Nueva Versión de Solicitud' : 'Editar Solicitud de Acreditación'}
          </h1>
          <p className="text-sm text-default-500 mt-1">
            {isNewVersion 
              ? 'Tu credencial actual sigue vigente mientras se revisa esta nueva versión'
              : 'Corrige la información según las observaciones del revisor'}
          </p>
        </div>
        <Button
          variant="flat"
          onPress={() => router.push(`/dashboard/applications/${applicationId}`)}
        >
          Cancelar
        </Button>
      </div>

      {/* Banner de nueva versión */}
      {isNewVersion && (
        <Card className="border-l-4 border-l-primary bg-primary-50 dark:bg-primary-900/20">
          <CardBody>
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <p className="font-semibold text-primary">Creando nueva versión</p>
                <p className="text-sm text-default-600 mt-1">
                  Se creará una nueva versión de esta solicitud. La credencial y el QR actuales seguirán vigentes 
                  hasta que esta nueva versión sea aprobada por el Admin Contractor y SHEQ.
                </p>
              </div>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Mostrar observaciones del rechazo */}
      {rejectionDetails && (
        <Card className="border-l-4 border-l-danger">
          <CardHeader className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-danger" />
            <div className="flex flex-col">
              <p className="text-md font-semibold">Observaciones del Revisor</p>
              <p className="text-small text-default-500">
                {rejectionDetails.reviewer} • {new Date(rejectionDetails.date).toLocaleDateString('es-CL')}
              </p>
            </div>
          </CardHeader>
          <CardBody>
            <div className="whitespace-pre-wrap text-sm bg-danger-50 p-3 rounded-lg">
              {rejectionDetails.details}
            </div>
          </CardBody>
        </Card>
      )}

      <ApplicationStepper
        onComplete={handleComplete}
        isSubmitting={isSubmitting}
        isEditMode={true}
      />
    </div>
  );
}
