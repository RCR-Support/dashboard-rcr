'use client';

import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useApplicationFormStore } from '@/store/application-form-store';
import { validateRun, formatRun } from '@/lib/validations';
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Fingerprint, User } from 'lucide-react';
import { StepNavigation } from '../components/StepNavigation';

// Schema de validación para los datos del trabajador
const workerSchema = z.object({
  workerName: z
    .string({ required_error: 'El nombre es requerido' })
    .regex(/^([a-zA-ZáéíóúÁÉÍÓÚñÑüÜ]+)$/, 'El nombre debe ser un solo nombre')
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(32, 'El nombre debe tener menos de 32 caracteres'),
  workerPaternal: z
    .string({ required_error: 'El apellido paterno es requerido' })
    .regex(/^([a-zA-ZáéíóúÁÉÍÓÚñÑüÜ]+)$/, 'El apellido debe ser un solo apellido')
    .min(2, 'El apellido debe tener al menos 2 caracteres')
    .max(32, 'El apellido debe tener menos de 32 caracteres'),
  workerMaternal: z
    .string()
    .max(32, 'El apellido materno debe tener menos de 32 caracteres')
    .regex(/^([a-zA-ZáéíóúÁÉÍÓÚñÑüÜ]*)$/, 'El apellido materno solo puede contener letras')
    .transform(value => value || '') // Convertir null/undefined a string vacío
    .refine(
      value => value === '' || value.length >= 2,
      'El apellido materno debe tener al menos 2 caracteres'
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

export function WorkerStep({ initialData, onNext, onBack }: WorkerStepProps) {
  // Acceder al store global
  const { workerData, setWorkerData, setCurrentStep, availableContracts } = useApplicationFormStore();

  // Inicializamos el formulario con react-hook-form
  const form = useForm<WorkerFormValues>({
    resolver: zodResolver(workerSchema),
    defaultValues: initialData || workerData || {
      workerName: '',
      workerPaternal: '',
      workerMaternal: '',
      workerRun: ''
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
    console.log('Ejecutando retroceso al paso de selección de contrato...');
    
    // Obtener valores actuales del formulario y guardarlos
    const formValues = form.getValues();
    
    // Guardar los datos actuales
    setWorkerData({
      workerName: formValues.workerName || '',
      workerPaternal: formValues.workerPaternal || '',
      workerMaternal: formValues.workerMaternal || '',
      workerRun: formValues.workerRun || ''
    });

    // Obtener el store actual
    const store = useApplicationFormStore.getState();
    
    // Resetear el contrato actual y volver al paso 0
    store.setContract(null);
    store.setCurrentStep(0);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <h2 className="text-lg font-semibold mb-4">Información del Trabajador</h2>
        <div className='flex flex-col justify-between min-h-80'>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Campo de RUN */}
          <FormField
            control={form.control}
            name="workerRun"
            render={({ field }) => (
              <FormItem>
                <FormLabel>RUN</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      placeholder="12345678-9"
                      {...field}
                      className="pl-10"
                      onBlur={field.onBlur} // Validar al perder el foco
                    />
                    <Fingerprint className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Campo de Nombre */}
          <FormField
            control={form.control}
            name="workerName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombres</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      placeholder="Nombres del trabajador"
                      {...field}
                      className="pl-10"
                      onBlur={field.onBlur}
                    />
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Campo de Apellido Paterno */}
          <FormField
            control={form.control}
            name="workerPaternal"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Apellido Paterno</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      placeholder="Apellido paterno"
                      {...field}
                      className="pl-10"
                      onBlur={field.onBlur}
                    />
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Campo de Apellido Materno */}
          <FormField
            control={form.control}
            name="workerMaternal"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Apellido Materno</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      placeholder="Apellido materno"
                      {...field}
                      className="pl-10"
                      onBlur={field.onBlur}
                    />
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
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

