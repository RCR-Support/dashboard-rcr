'use client';

import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useApplicationFormStore } from '@/store/application-form-store';
import { validateRun, formatRun } from '@/lib/validations';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Fingerprint, User, Camera, Info, CheckCircle2, AlertTriangle } from 'lucide-react';
import { StepNavigation } from '../components/StepNavigation';
import { ImageEditorModal } from '@/components/ui/ImageEditorModal';
import { useState } from 'react';
import Image from 'next/image';
import { Tooltip } from '@heroui/tooltip';
import { Card, CardBody } from '@heroui/card';

// Schema de validación para los datos del trabajador
const workerSchema = z.object({
  workerName: z
    .string({ required_error: 'El nombre es requerido' })
    .transform(value => value.trim()) // Limpiar espacios
    .pipe(
      z
        .string()
        .regex(/^([a-zA-ZáéíóúÁÉÍÓÚñÑüÜ]+)$/, 'El nombre debe ser un solo nombre')
        .min(2, 'El nombre debe tener al menos 2 caracteres')
        .max(32, 'El nombre debe tener menos de 32 caracteres')
    ),
  workerPaternal: z
    .string({ required_error: 'El apellido paterno es requerido' })
    .transform(value => value.trim()) // Limpiar espacios
    .pipe(
      z
        .string()
        .regex(
          /^([a-zA-ZáéíóúÁÉÍÓÚñÑüÜ]+)$/,
          'El apellido debe ser un solo apellido'
        )
        .min(2, 'El apellido debe tener al menos 2 caracteres')
        .max(32, 'El apellido debe tener menos de 32 caracteres')
    ),
  workerMaternal: z
    .string()
    .transform(value => value.trim()) // Limpiar espacios
    .pipe(
      z
        .string()
        .max(32, 'El apellido materno debe tener menos de 32 caracteres')
        .regex(
          /^([a-zA-ZáéíóúÁÉÍÓÚñÑüÜ]*)$/,
          'El apellido materno solo puede contener letras'
        )
        .transform(value => value || '') // Convertir null/undefined a string vacío
        .refine(
          value => value === '' || value.length >= 2,
          'El apellido materno debe tener al menos 2 caracteres'
        )
    ),
  workerRun: z
    .string({ required_error: 'El RUN es requerido' })
    .min(1, 'El RUN es requerido')
    .transform(value => value.replace(/[.-]/g, ''))
    .refine(
      value => {
        const length = value.length;
        return length >= 8 && length <= 9;
      },
      {
        message: 'El RUN debe tener entre 8 y 9 dígitos',
      }
    )
    .refine(value => /^\d+[kK0-9]$/.test(value), {
      message: 'Formato de RUN inválido',
    })
    .refine(validateRun, {
      message: 'RUN inválido',
    })
    .transform(formatRun),
});

export type WorkerFormValues = z.infer<typeof workerSchema>;

interface WorkerStepProps {
  initialData: WorkerFormValues | null;
  onNext: (data: WorkerFormValues) => void;
  onBack: () => void;
}

export function WorkerStep({ initialData, onNext }: WorkerStepProps) {
  // Acceder al store global
  const { workerData, setWorkerData, availableContracts, credentialPhoto, setCredentialPhoto } =
    useApplicationFormStore();

  // Estados para el editor de imagen
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Inicializamos el formulario con react-hook-form
  const form = useForm<WorkerFormValues>({
    resolver: zodResolver(workerSchema),
    defaultValues: initialData ||
      workerData || {
        workerName: '',
        workerPaternal: '',
        workerMaternal: '',
        workerRun: '',
      },
    mode: 'onBlur', // Validar al perder el foco
    criteriaMode: 'all', // Mostrar todos los errores
  });

  // Función que se ejecuta al enviar el formulario
  const onSubmit = (values: WorkerFormValues) => {
    // Solo avanzar si todos los campos requeridos están presentes y válidos
    if (values.workerName && values.workerPaternal && values.workerRun) {
      setWorkerData(values);
      onNext(values);
    }
  };

  // Función que se ejecuta al retroceder
  const handleBack = () => {
    // Obtener valores actuales del formulario y guardarlos
    const formValues = form.getValues();

    // Guardar los datos actuales
    setWorkerData({
      workerName: formValues.workerName || '',
      workerPaternal: formValues.workerPaternal || '',
      workerMaternal: formValues.workerMaternal || '',
      workerRun: formValues.workerRun || '',
    });

    // Obtener el store actual
    const store = useApplicationFormStore.getState();

    // Resetear el contrato actual y volver al paso 0
    store.setContract(null);
    store.setCurrentStep(0);
  };

  // Manejador para cuando se selecciona una imagen
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setSelectedImage(reader.result as string);
        setIsEditorOpen(true);
      };
      reader.readAsDataURL(file);
    }
  };

  // Manejador para cuando se guarda la imagen editada
  const handleImageSave = (editedFile: File) => {
    // Convertir a base64 para vista previa
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setCredentialPhoto(base64String);
    };
    reader.readAsDataURL(editedFile);
    setIsEditorOpen(false);
    setSelectedFile(null);
    setSelectedImage(null);
  };

  // Manejador para cancelar el editor
  const handleImageCancel = () => {
    setIsEditorOpen(false);
    setSelectedFile(null);
    setSelectedImage(null);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="flex items-center gap-2 mb-6">
          <User className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Información del Trabajador</h2>
        </div>

        <div className="flex flex-col justify-between min-h-80">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Campo de RUN con tooltip */}
            <FormField
              control={form.control}
              name="workerRun"
              render={({ field }) => {
                const isTouched = !!form.formState.touchedFields.workerRun;
                const hasError = !!form.formState.errors.workerRun;
                const isValid = isTouched && field.value && !hasError;
                return (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Fingerprint className="h-4 w-4" />
                      RUN
                      <Tooltip 
                        content="Formato: 12345678-9 o 12.345.678-9. Se validará automáticamente."
                        placement="top"
                        showArrow
                      >
                        <Info className="h-4 w-4 text-gray-400 cursor-help" />
                      </Tooltip>
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          placeholder="Ej: 12.345.678-9"
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                            if (isTouched) form.trigger('workerRun');
                          }}
                          className={`pl-10 ${
                            isTouched && hasError
                              ? 'border-red-500'
                              : isValid
                                ? 'border-green-500'
                                : ''
                          }`}
                        />
                        <Fingerprint className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        {isValid && (
                          <CheckCircle2 className="absolute right-3 top-3 h-4 w-4 text-green-500" />
                        )}
                        {isTouched && hasError && (
                          <AlertTriangle className="absolute right-3 top-3 h-4 w-4 text-red-500" />
                        )}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />

            {/* Campo de Nombre con tooltip */}
            <FormField
              control={form.control}
              name="workerName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Nombre
                    <Tooltip 
                      content="Solo un nombre, sin apellidos. Ej: 'Juan', 'María'"
                      placement="top"
                      showArrow
                    >
                      <Info className="h-4 w-4 text-gray-400 cursor-help" />
                    </Tooltip>
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        placeholder="Ej: Juan"
                        {...field}
                        className={`pl-10 ${
                          form.formState.errors.workerName 
                            ? 'border-red-500' 
                            : field.value && !form.formState.errors.workerName 
                              ? 'border-green-500' 
                              : ''
                        }`}
                      />
                      <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      {field.value && !form.formState.errors.workerName && (
                        <CheckCircle2 className="absolute right-3 top-3 h-4 w-4 text-green-500" />
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Campo de Apellido Paterno con tooltip */}
            <FormField
              control={form.control}
              name="workerPaternal"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Apellido Paterno
                    <Tooltip 
                      content="Solo el apellido paterno. Ej: 'Pérez', 'González'"
                      placement="top"
                      showArrow
                    >
                      <Info className="h-4 w-4 text-gray-400 cursor-help" />
                    </Tooltip>
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        placeholder="Ej: Pérez"
                        {...field}
                        className={`pl-10 ${
                          form.formState.errors.workerPaternal 
                            ? 'border-red-500' 
                            : field.value && !form.formState.errors.workerPaternal 
                              ? 'border-green-500' 
                              : ''
                        }`}
                      />
                      <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      {field.value && !form.formState.errors.workerPaternal && (
                        <CheckCircle2 className="absolute right-3 top-3 h-4 w-4 text-green-500" />
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Campo de Apellido Materno con tooltip */}
            <FormField
              control={form.control}
              name="workerMaternal"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Apellido Materno (Opcional)
                    <Tooltip 
                      content="Solo el apellido materno. Puede quedar vacío si no lo tiene."
                      placement="top"
                      showArrow
                    >
                      <Info className="h-4 w-4 text-gray-400 cursor-help" />
                    </Tooltip>
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        placeholder="Ej: López (opcional)"
                        {...field}
                        className={`pl-10 ${
                          form.formState.errors.workerMaternal 
                            ? 'border-red-500' 
                            : field.value && !form.formState.errors.workerMaternal 
                              ? 'border-green-500' 
                              : ''
                        }`}
                      />
                      <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      {field.value && !form.formState.errors.workerMaternal && (
                        <CheckCircle2 className="absolute right-3 top-3 h-4 w-4 text-green-500" />
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Foto de Credencial con tooltip informativo */}
          <div className="space-y-2 mt-8">
            <FormLabel className="flex items-center gap-2">
              <Camera className="h-4 w-4" />
              Foto de Credencial
              <span className="text-red-500">*</span>
              <Tooltip 
                content="Sube una foto clara de la credencial del trabajador. Puedes editarla después de subirla."
                placement="top"
                showArrow
              >
                <Info className="h-4 w-4 text-gray-400 cursor-help" />
              </Tooltip>
            </FormLabel>
            <div className="flex items-center gap-4">
              <label className="cursor-pointer">
                <div className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors">
                  <Camera className="h-4 w-4" />
                  {credentialPhoto ? 'Cambiar foto' : 'Subir foto'}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                />
              </label>
              {credentialPhoto && (
                <div className="flex items-center gap-2">
                  <div className="relative w-16 h-20 rounded border-2 border-primary overflow-hidden">
                    <Image
                      src={credentialPhoto}
                      alt="Vista previa"
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  </div>
                  <span className="text-sm text-green-600">✓ Foto cargada</span>
                </div>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Sube una foto del trabajador para su credencial (formato vertical 3:4)
            </p>
          </div>

          {/* Modal del editor de imagen */}
          {isEditorOpen && selectedImage && selectedFile && (
            <ImageEditorModal
              imageSrc={selectedImage}
              originalFile={selectedFile}
              isOpen={isEditorOpen}
              onSave={handleImageSave}
              onCancel={handleImageCancel}
            />
          )}

          <StepNavigation
            onBack={availableContracts.length > 1 ? handleBack : undefined}
            currentStep={1}
            totalSteps={4}
            onNext={() => {
              // Validar y enviar manualmente
              form.handleSubmit(onSubmit)();
            }}
            isNextDisabled={!form.formState.isValid}
          />
        </div>
      </form>
    </Form>
  );
}
