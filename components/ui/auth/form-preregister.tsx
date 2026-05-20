'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useEffect, useState, useTransition } from 'react';
import { SearchSelect } from '@/components/ui/search-select';
import { useRouter } from 'next/navigation';
import { preRegisterAction } from '@/actions/pre-registration/pre-registration-action';
import { baseUserSchema } from '@/lib/zod';
import { companySchema } from '@/lib/validation-company';

// El mismo esquema de Zod que en la acción para validación en el cliente
const preRegisterFormSchema = z
  .object({
    isSubcontract: z.boolean().optional(),
    companyId: z.string().optional(),
    companyName: companySchema.shape.name.optional(),
    companyRut: companySchema.shape.rut.optional(),
    companyPhone: companySchema.shape.phone.optional(),
    companyCity: companySchema.shape.city.optional(),
    companyUrl: companySchema.shape.url.optional().or(z.literal('')),

    // Campos de usuario reutilizando baseUserSchema
    userName: baseUserSchema.shape.name,
    userLastName: baseUserSchema.shape.lastName,
    userMiddleName: baseUserSchema.shape.middleName,
    userSecondLastName: baseUserSchema.shape.secondLastName,
    userEmail: baseUserSchema.shape.email,
    userEmailConfirm: z.string().email('Email inválido'),
    userRun: baseUserSchema.shape.run,
    userPhoneNumber: z.string().min(9, 'El teléfono es requerido'),
    displayName: z.string().optional(),

    contractNumber: z.string().optional(),
    contractName: z.string().optional(),
    initialDate: z.string().optional().transform(str => str ? new Date(str) : undefined),
    finalDate: z.string().optional().transform(str => str ? new Date(str) : undefined),
    adminContractorId: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    // Validar que los emails coincidan
    if (data.userEmail && data.userEmailConfirm && data.userEmail !== data.userEmailConfirm) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['userEmailConfirm'],
        message: 'Los correos no coinciden',
      });
    }
    // Si NO hay companyId, los campos de empresa son obligatorios
    if (!data.companyId) {
      if (!data.companyName || data.companyName.trim().length < 3) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['companyName'],
          message: 'El nombre de la empresa es requerido',
        });
      }
      if (!data.companyRut || data.companyRut.trim().length < 9) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['companyRut'],
          message: 'El RUT de la empresa es requerido',
        });
      }
    }
    // Si NO es sub-contratista, los datos de contrato son obligatorios
    if (!data.isSubcontract) {
      if (!data.contractNumber || data.contractNumber.trim().length < 1) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['contractNumber'],
          message: 'El número de contrato es requerido',
        });
      }
      if (!data.contractName || data.contractName.trim().length < 3) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['contractName'],
          message: 'El nombre del contrato es requerido',
        });
      }
      if (!data.initialDate) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['initialDate'],
          message: 'La fecha de inicio es requerida',
        });
      }
      if (!data.finalDate) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['finalDate'],
          message: 'La fecha de término es requerida',
        });
      }
      if (!data.adminContractorId || data.adminContractorId.trim().length < 1) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['adminContractorId'],
          message: 'Debe seleccionar un administrador de contrato',
        });
      }
      // Validar que la fecha de término sea posterior a la de inicio
      if (data.initialDate && data.finalDate && data.finalDate <= data.initialDate) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['finalDate'],
          message: 'La fecha de término debe ser posterior a la fecha de inicio',
        });
      }
    }
  });

type PreRegisterFormValues = z.infer<typeof preRegisterFormSchema>;

export const FormPreRegister = () => {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [, setSuccess] = useState<string | null>(null);
  const [empresaOptions, setEmpresaOptions] = useState<
    { label: string; value: string }[]
  >([]);
  const [adminOptions, setAdminOptions] = useState<
    { label: string; value: string; description?: string }[]
  >([]);
  const [loadingCompanies, setLoadingCompanies] = useState(true);
  const [loadingAdmins, setLoadingAdmins] = useState(true);
  const [isSubcontract, setIsSubcontract] = useState(false);
  const [showCompanyFields, setShowCompanyFields] = useState(false);
  // Estado para animación fade-out
  const [showCard, setShowCard] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const router = useRouter();

  // Manejar animación fade-in/fade-out
  useEffect(() => {
    if (showCompanyFields) {
      setShowCard(true);
    } else if (showCard) {
      // Espera la duración de la animación antes de ocultar
      const timeout = setTimeout(() => setShowCard(false), 500);
      return () => clearTimeout(timeout);
    }
  }, [showCompanyFields, showCard]);

  useEffect(() => {
    const loadCompanies = async () => {
      try {
        const res = await fetch('/api/companies');
        const data = await res.json();
        if (Array.isArray(data)) setEmpresaOptions(data);
      } catch {
        // silencioso — el campo quedará vacío con el placeholder
      } finally {
        setLoadingCompanies(false);
      }
    };
    const loadAdmins = async () => {
      try {
        const res = await fetch('/api/admin-contractors');
        const data = await res.json();
        if (Array.isArray(data)) setAdminOptions(data);
      } catch {
        // silencioso
      } finally {
        setLoadingAdmins(false);
      }
    };
    loadCompanies();
    loadAdmins();
  }, []);

  const form = useForm<PreRegisterFormValues>({
    resolver: zodResolver(preRegisterFormSchema),
    mode: 'onChange', // Validación en tiempo real
    defaultValues: {
      isSubcontract: false,
      companyId: '',
      companyName: '',
      companyRut: '',
      companyPhone: '',
      companyCity: '',
      companyUrl: '',
      userEmail: '',
      userEmailConfirm: '',
      userRun: '',
      userName: '',
      userLastName: '',
      userMiddleName: '',
      userSecondLastName: '',
      userPhoneNumber: '',
      displayName: '',
      contractNumber: '',
      contractName: '',
      adminContractorId: '',
      initialDate: '' as unknown as Date,
      finalDate: '' as unknown as Date,
    },
  });

  const onSubmit = (data: PreRegisterFormValues) => {
    setError(null);
    setSuccess(null);

    // Si companyId es string vacío, lo convertimos a undefined para el flujo correcto
    const normalizedCompanyId =
      data.companyId && data.companyId !== '' ? data.companyId : undefined;
    
    // Propagar el estado de isSubcontract
    data.isSubcontract = isSubcontract;

    // Si displayName está vacío, lo rellenamos antes de enviar
    const displayName =
      typeof data.displayName === 'string' ? data.displayName.trim() : '';
    const nombre =
      typeof data.userName === 'string' ? data.userName.trim() : '';
    const apellido =
      typeof data.userLastName === 'string' ? data.userLastName.trim() : '';
    const finalDisplayName = displayName
      ? displayName
      : `${nombre} ${apellido}`.trim();

    // --- LIMPIEZA DE DATOS SEGÚN FLUJO ---
    let dataToSend: PreRegisterFormValues;
    const isEmpresaExistente = !!normalizedCompanyId;
    if (isEmpresaExistente) {
      // Empresa existente: limpiar campos de empresa (usar string vacío para cumplir con el tipo)
      dataToSend = {
        ...data,
        companyId: normalizedCompanyId, // id real
        companyName: '',
        companyRut: '',
        companyPhone: '',
        companyCity: '',
        companyUrl: '',
        displayName: finalDisplayName,
      };
    } else {
      // Nueva empresa: limpiar companyId (enviar undefined, no string vacío)
      dataToSend = {
        ...data,
        companyId: undefined,
        displayName: finalDisplayName,
      };
    }

    startTransition(async () => {
      const result = await preRegisterAction(dataToSend);
      if (result.error) {
        // Si hay errores de validación de campos específicos, mapearlos al formulario
        if (result.validationErrors && result.validationErrors.length > 0) {
          result.validationErrors.forEach(({ path, message }) => {
            if (path && path in form.getValues()) {
              form.setError(path as keyof PreRegisterFormValues, {
                type: 'server',
                message,
              });
            }
          });
          // Hacer scroll al primer campo con error
          const firstErrorField = document.querySelector('[aria-invalid="true"]');
          firstErrorField?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else {
          setError(result.error);
        }
        setSuccess(null);
      } else {
        setError(null);
        setSubmitted(true);
        form.reset();
      }
    });
  };

  // Sincronizar campos y errores al cambiar entre empresa existente/nueva
  const watchedCompanyId = form.watch('companyId');
  useEffect(() => {
    if (watchedCompanyId) {
      setShowCompanyFields(false);
      // Limpiar campos de empresa y errores (poner en undefined para que Zod no los valide)
      form.setValue('companyName', undefined, { shouldValidate: true });
      form.setValue('companyRut', undefined, { shouldValidate: true });
      form.setValue('companyPhone', undefined, { shouldValidate: false });
      form.setValue('companyCity', undefined, { shouldValidate: false });
      form.setValue('companyUrl', undefined, { shouldValidate: false });
      form.clearErrors([
        'companyName',
        'companyRut',
        'companyPhone',
        'companyCity',
        'companyUrl',
      ]);
    }
    if (showCompanyFields) {
      form.setValue('companyId', '', { shouldValidate: true });
      form.clearErrors(['companyId']);
    }
  }, [watchedCompanyId, showCompanyFields, form]);

  if (submitted) {
    return (
      <div className="py-8 text-center space-y-6">
        {/* Ícono de éxito */}
        <div className="flex justify-center">
          <div className="h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
            <svg className="h-8 w-8 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            ¡Solicitud enviada correctamente!
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm max-w-md mx-auto">
            Te enviamos un correo de confirmación con un resumen de los datos ingresados. Guárdalo por si necesitas verificar algo.
          </p>
        </div>

        {/* Pasos de lo que viene */}
        <div className="bg-gray-50 dark:bg-[#161b22] rounded-lg p-5 text-left space-y-4 max-w-md mx-auto">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">¿Qué pasa ahora?</p>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#D05F27] text-white text-xs font-bold">1</span>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Revisa tu correo — te enviamos un resumen con todos los datos de tu solicitud.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#D05F27] text-white text-xs font-bold">2</span>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                El administrador revisará tu empresa, contrato y usuario, y activará tu cuenta.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#D05F27] text-white text-xs font-bold">3</span>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Cuando tu cuenta esté lista, recibirás <strong>otro correo</strong> con tus credenciales para acceder al sistema.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <Button
            type="button"
            onClick={() => router.push('/login')}
            className="bg-[#D05F27] hover:bg-[#b84e1e] text-white"
          >
            Ir al inicio de sesión
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/')}
          >
            Volver al inicio
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Card de Usuario */}
        <Card>
          <CardHeader>
            <CardTitle>Datos del Usuario</CardTitle>
            <CardDescription>
              Este usuario será el responsable de gestionar el contrato.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="userName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Nombre <span className="text-red-600">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Juan" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="userLastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Apellido Paterno <span className="text-red-600">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Pérez" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="userMiddleName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Segundo Nombre (Opcional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Carlos" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="userSecondLastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Apellido Materno (Opcional)</FormLabel>
                  <FormControl>
                    <Input placeholder="González" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Campo para Nombre de Usuario (displayName) */}
            <FormField
              control={form.control}
              name="displayName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    ¿Cómo te llamaremos en la plataforma? (Opcional)
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ej: Juan Pérez"
                      {...field}
                      onBlur={e => {
                        // Si está vacío, autocompletar con nombre y apellido
                        if (!e.target.value) {
                          const nombre = form.getValues('userName');
                          const apellido = form.getValues('userLastName');
                          form.setValue(
                            'displayName',
                            `${nombre} ${apellido}`.trim()
                          );
                        }
                        field.onBlur && field.onBlur(); // <-- corregido, sin pasar e
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="userRun"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    RUN <span className="text-red-600">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="12.345.678-9" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="userEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Email <span className="text-red-600">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="juan.perez@empresa.com"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="userEmailConfirm"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Confirmar Email <span className="text-red-600">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="juan.perez@empresa.com"
                      onPaste={(e) => e.preventDefault()}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="userPhoneNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Teléfono <span className="text-red-600">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="+56 9 8765 4321" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="companyId"
              control={form.control}
              render={({ field }) => (
                <FormItem className="md:col-span-1">
                  <FormLabel>
                    Empresa <span className="text-red-600">*</span>
                  </FormLabel>
                  <FormControl>
                    <>
                      <SearchSelect
                        value={field.value === null ? undefined : field.value}
                        onValueChange={value => {
                          field.onChange(value);
                          if (value) setShowCompanyFields(false);
                        }}
                        options={empresaOptions}
                        placeholder={
                          loadingCompanies
                            ? 'Cargando empresas...'
                            : 'Seleccione una empresa'
                        }
                        className="w-full"
                      />
                      {!form.watch('companyId') && !loadingCompanies && (
                        <button
                          type="button"
                          onClick={() => setShowCompanyFields(!showCompanyFields)}
                          className="mt-2 text-sm text-[#D05F27] hover:underline focus:outline-none"
                        >
                          {showCompanyFields
                            ? '← Seleccionar empresa existente'
                            : '¿Tu empresa no está en la lista? Regístrala aquí'}
                        </button>
                      )}
                    </>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Card de Empresa (solo si no existe) */}
        {showCard && (
          <div
            className={
              showCompanyFields
                ? 'fade-in transition-all duration-500'
                : 'fade-out transition-all duration-500'
            }
          >
            <Card>
              <CardHeader>
                <CardTitle>Datos de la Empresa</CardTitle>
                <CardDescription>
                  Información de la nueva empresa a registrar.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="companyName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Nombre <span className="text-red-600">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Nombre de la empresa" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="companyRut"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        RUT <span className="text-red-600">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="76.123.456-7" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="companyPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Teléfono <span className="text-red-600">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="+56 9 1234 5678" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="companyCity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ciudad <span className="text-red-600">*</span></FormLabel>
                      <FormControl>
                        <Input placeholder="Santiago" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="companyUrl"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Sitio Web (Opcional)</FormLabel>
                      <FormControl>
                        <Input placeholder="https://empresa.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </div>
        )}

        {/* Toggle sub-contratista */}
        <div className="flex items-start gap-3 p-4 rounded-xl border-2 border-dashed border-default-200 bg-default-50 cursor-pointer" onClick={() => {
          setIsSubcontract(v => !v);
          form.setValue('isSubcontract', !isSubcontract);
          if (!isSubcontract) {
            // Limpiar campos de contrato al activar modo sub-contratista
            form.setValue('contractNumber', '');
            form.setValue('contractName', '');
            form.setValue('initialDate', '' as unknown as Date);
            form.setValue('finalDate', '' as unknown as Date);
            form.setValue('adminContractorId', '');
            form.clearErrors(['contractNumber', 'contractName', 'initialDate', 'finalDate', 'adminContractorId']);
          }
        }}>
          <div className={`mt-0.5 h-5 w-5 shrink-0 rounded border-2 flex items-center justify-center transition-colors ${
            isSubcontract ? 'bg-[#D05F27] border-[#D05F27]' : 'border-gray-400 bg-white'
          }`}>
            {isSubcontract && (
              <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            )}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-800 dark:text-gray-200">Soy sub-contratista</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Mi empresa trabaja bajo el contrato de otra empresa. No tengo un contrato propio que registrar.
            </p>
          </div>
        </div>

        {/* Card de Contrato */}
        {!isSubcontract && <Card>
          <CardHeader>
            <CardTitle>Datos del Contrato</CardTitle>
            <CardDescription>
              Información del contrato asociado a la empresa.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="contractNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Número de Contrato <span className="text-red-600">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="C-2025-001" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="contractName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Nombre del Contrato <span className="text-red-600">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Servicios de Mantención" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="initialDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Fecha de Inicio <span className="text-red-600">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      {...field}
                      value={
                        field.value
                          ? new Date(field.value).toISOString().split('T')[0]
                          : ''
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="finalDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Fecha de Término <span className="text-red-600">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      {...field}
                      value={
                        field.value
                          ? new Date(field.value).toISOString().split('T')[0]
                          : ''
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="adminContractorId"
              control={form.control}
              render={({ field }) => (
                <FormItem className="md:col-span-1">
                  <FormLabel>
                    Administrador de Contrato{' '}
                    <span className="text-red-600">*</span>
                  </FormLabel>
                  <FormControl>
                    <SearchSelect
                      {...field}
                      onValueChange={field.onChange}
                      options={adminOptions}
                      placeholder={
                        loadingAdmins
                          ? 'Cargando administradores...'
                          : 'Seleccione un administrador de contrato'
                      }
                      value={field.value === null ? undefined : field.value}
                      className="w-full"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>}

        {isSubcontract && (
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl text-sm space-y-1">
            <p className="font-medium text-blue-800 dark:text-blue-300">ℹ️ Registro como sub-contratista</p>
            <p className="text-blue-700 dark:text-blue-400">
              El administrador del sistema vinculará tu empresa al contrato correspondiente una vez que apruebe tu cuenta.
              No necesitas ingresar datos de contrato.
            </p>
          </div>
        )}

        {error && (
          <div className="p-4 text-center text-sm text-red-700 bg-red-100 rounded-md">
            {error}
          </div>
        )}

        <Button
          type="submit"
          className="w-full bg-[#D05F27] hover:bg-[#b84e1e] text-white"
          disabled={isPending}
        >
          {isPending ? (
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Enviando Solicitud...
            </span>
          ) : (
            'Enviar Solicitud de Pre-Registro'
          )}
        </Button>
      </form>
    </Form>
  );
};
