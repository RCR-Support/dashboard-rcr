'use client';

import { Button } from '@heroui/button';
import { ApplicationStepper } from './stepper';
import { useEffect, useState } from 'react';
import { listActivities } from '@/actions/activities/list-activities';
import { useApplicationFormStore } from '@/store/application-form-store';
import { useRoleStore } from '@/store/ui/roleStore';
import { createApplication } from '@/actions/applications/create-application';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';

export default function CreateApplicationPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Cargar actividades una sola vez al montar
  useEffect(() => {
    let isMounted = true;

    const loadActivities = async () => {
      try {
        const activities = await listActivities();
        if (activities && isMounted) {
          useApplicationFormStore.getState().setAvailableActivities(activities);
        }
      } catch {
        // Error al cargar actividades
      }
    };

    loadActivities();

    return () => {
      isMounted = false;
    };
  }, []); // Solo ejecutar una vez al montar

  // Función para limpiar el formulario manteniendo datos de empresa
  const handleClear = () => {
    const selectedRole = useRoleStore.getState().selectedRole;

    // Si es admin, limpiar todo para volver a la selección de empresa.
    if (selectedRole === 'admin') {
      useApplicationFormStore.getState().clearForm();
      // Asegurar que el step vuelva a contrato
      useApplicationFormStore.getState().setCurrentStep(0);
      return;
    }

    // Para usuarios normales, mantener la empresa seleccionada
    useApplicationFormStore.getState().resetFormKeepingCompanyData();
    // Asegurar que el step vuelva a contrato
    useApplicationFormStore.getState().setCurrentStep(0);
  };

  // Función para manejar el envío de la solicitud
  const handleComplete = async (data: any) => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);

    try {
      const store = useApplicationFormStore.getState();
      const credentialPhoto = store.credentialPhoto;
      
      // 1. Subir foto de credencial a Cloudinary si existe
      let credentialPhotoUrl: string | undefined;
      
      if (credentialPhoto) {
        const blob = await fetch(credentialPhoto).then(r => r.blob());
        const file = new File([blob], 'credencial.jpg', { type: 'image/jpeg' });
        
        const formData = new FormData();
        formData.append('file', file);
        formData.append('folder', 'applications/credentials');

        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        const uploadResult = await uploadResponse.json();
        
        if (!uploadResult.success) {
          throw new Error('Error al subir la foto de credencial');
        }
        
        credentialPhotoUrl = uploadResult.url;
      }

      // 2. Preparar documentos con sus URLs
      const documents = data.documents
        .filter((doc: any) => doc.url) // Solo documentos que tienen URL (fueron subidos)
        .map((doc: any) => ({
          documentationId: doc.documentationId,
          activityId: doc.activityId,
          url: doc.url,
          type: doc.acceptedFileType === 'IMAGE' ? 'IMG' : 'PDF',
          expiresAt: doc.expiresAt, // Incluir fecha de expiración
        }));

      // 3. Crear la solicitud
      const result = await createApplication({
        contractId: data.contract.id,
        companyId: data.contract.companyId,
        workerName: data.workerData.workerName,
        workerPaternal: data.workerData.workerPaternal,
        workerMaternal: data.workerData.workerMaternal,
        workerRun: data.workerData.workerRun,
        activityIds: data.activities.map((a: any) => a.id),
        documents,
        credentialPhotoUrl,
      });

      if (!result.success) {
        throw new Error(result.error || 'Error al crear la solicitud');
      }

      // 4. Limpiar formulario y localStorage
      useApplicationFormStore.getState().clearForm();

      // 5. Mostrar éxito y redirigir
      await Swal.fire({
        icon: 'success',
        title: 'Solicitud creada',
        text: 'La solicitud de acreditación se ha creado exitosamente',
        confirmButtonText: 'Ver solicitudes',
      });

      router.push('/dashboard/applications');
    } catch (error) {
      console.error('Error al crear solicitud:', error);
      
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error instanceof Error ? error.message : 'Ocurrió un error al crear la solicitud',
        confirmButtonText: 'Aceptar',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto lg:w-[1280px] px-4 flex flex-col gap-4">
      <div className="col-span-12 card-box flex justify-between">
        <h1 className="text-xl font-normal">Nueva Solicitud de Acreditación</h1>
        <Button size="sm" variant="ghost" color="danger" onPress={handleClear}>
          Limpiar datos de la solicitud
        </Button>
      </div>

      <ApplicationStepper
        onComplete={handleComplete}
        onCancel={() => {
          router.push('/dashboard/applications');
        }}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
