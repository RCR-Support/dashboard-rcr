'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { FieldErrors, useForm, useWatch } from 'react-hook-form';
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
import {
  preRegisterInputSchema,
  validatePreRegisterConditions,
} from '@/lib/validation-pre-registration';
import { PreRegisterSuccess } from './PreRegisterSuccess';
import type { SubcontractInviteContext } from '@/actions/pre-registration/get-subcontract-invite';

const preRegisterFormSchema = preRegisterInputSchema
  .extend({ userEmailConfirm: z.string().email('Email inválido') })
  .superRefine((data, ctx) => {
    validatePreRegisterConditions(data, ctx);
    if (data.userEmail && data.userEmailConfirm && data.userEmail !== data.userEmailConfirm) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['userEmailConfirm'],
        message: 'Los correos no coinciden',
      });
    }
  });

type PreRegisterFormValues = z.infer<typeof preRegisterFormSchema>;

type FormPreRegisterProps = {
  inviteContext?: SubcontractInviteContext | null;
};

export const FormPreRegister = ({ inviteContext }: FormPreRegisterProps) => {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [, setSuccess] = useState<string | null>(null);
  const [empresaOptions, setEmpresaOptions] = useState<
    { label: string; value: string }[]
  >([]);
  const [adminOptions, setAdminOptions] = useState<
    { label: string; value: string; description?: string }[]
  >([]);
  const [contractOptions, setContractOptions] = useState<
    { label: string; value: string }[]
  >([]);
  const [loadingCompanies, setLoadingCompanies] = useState(true);
  const [loadingAdmins, setLoadingAdmins] = useState(true);
  const [loadingContracts, setLoadingContracts] = useState(true);
  const [isSubcontract, setIsSubcontract] = useState(Boolean(inviteContext));
  const [showCompanyFields, setShowCompanyFields] = useState(Boolean(inviteContext));
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
    const loadContracts = async () => {
      try {
        const res = await fetch('/api/pre-register/contracts');
        const data = await res.json();
        if (Array.isArray(data)) setContractOptions(data);
      } catch {
        // silencioso
      } finally {
        setLoadingContracts(false);
      }
    };
    loadCompanies();
    loadAdmins();
    loadContracts();
  }, []);

  const form = useForm<PreRegisterFormValues>({
    resolver: zodResolver(preRegisterFormSchema),
    mode: 'onChange', // Validación en tiempo real
    defaultValues: {
      isSubcontract: Boolean(inviteContext),
      subcontractId: inviteContext?.subcontractId,
      subcontractToken: inviteContext?.token,
      subcontractContractId: '',
      companyId: '',
      companyName: inviteContext?.subCompany.name ?? '',
      companyRut: inviteContext?.subCompany.rut ?? '',
      companyPhone: '',
      companyCity: inviteContext?.subCompany.city ?? '',
      companyUrl: '',
      userEmail: inviteContext?.representativeEmail ?? '',
      userEmailConfirm: inviteContext?.representativeEmail ?? '',
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

    const isInviteFlow = Boolean(inviteContext);

    // Si viene desde invitación, la empresa ya está fijada por el Subcontract.
    // Ignorar cualquier companyId evita que el usuario cambie el destino del vínculo.
    const normalizedCompanyId =
      !isInviteFlow && data.companyId && data.companyId !== '' ? data.companyId : undefined;
    
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
        isSubcontract: isSubcontract || isInviteFlow,
        subcontractId: inviteContext?.subcontractId,
        subcontractToken: inviteContext?.token,
        companyName: inviteContext?.subCompany.name ?? data.companyName,
        companyRut: inviteContext?.subCompany.rut ?? data.companyRut,
        companyCity: inviteContext?.subCompany.city ?? data.companyCity,
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

  const onInvalid = (errors: FieldErrors<PreRegisterFormValues>) => {
    const firstErrorField = document.querySelector('[aria-invalid="true"]');
    firstErrorField?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    const firstMessage = Object.values(errors).find(error => error?.message)?.message;
    setError(
      typeof firstMessage === 'string'
        ? firstMessage
        : 'Revisa los campos requeridos antes de enviar la solicitud.'
    );
  };

  // Sincronizar campos y errores al cambiar entre empresa existente/nueva
  const watchedCompanyId = useWatch({
    control: form.control,
    name: 'companyId',
  });
  const watchedCompanyName = useWatch({
    control: form.control,
    name: 'companyName',
  });
  const watchedCompanyRut = useWatch({
    control: form.control,
    name: 'companyRut',
  });
  const watchedCompanyCity = useWatch({
    control: form.control,
    name: 'companyCity',
  });
  const watchedUserEmail = useWatch({
    control: form.control,
    name: 'userEmail',
  });
  const watchedUserEmailConfirm = useWatch({
    control: form.control,
    name: 'userEmailConfirm',
  });

  useEffect(() => {
    if (!inviteContext) return;

    setShowCompanyFields(true);
    setIsSubcontract(true);

    if (!form.getValues('isSubcontract')) {
      form.setValue('isSubcontract', true, { shouldValidate: true });
    }
    if (form.getValues('subcontractId') !== inviteContext.subcontractId) {
      form.setValue('subcontractId', inviteContext.subcontractId, { shouldValidate: false });
    }
    if (form.getValues('subcontractToken') !== inviteContext.token) {
      form.setValue('subcontractToken', inviteContext.token, { shouldValidate: false });
    }
  }, [form, inviteContext]);

  useEffect(() => {
    if (!inviteContext) return;

    const inviteCompanyName = inviteContext.subCompany.name ?? '';
    const inviteCompanyRut = inviteContext.subCompany.rut;
    const inviteCompanyCity = inviteContext.subCompany.city ?? '';
    const inviteEmail = inviteContext.representativeEmail ?? '';

    if (watchedCompanyName !== inviteCompanyName) {
      form.setValue('companyName', inviteCompanyName, { shouldValidate: true });
    }
    if (watchedCompanyRut !== inviteCompanyRut) {
      form.setValue('companyRut', inviteCompanyRut, { shouldValidate: true });
    }
    if (watchedCompanyCity !== inviteCompanyCity) {
      form.setValue('companyCity', inviteCompanyCity, { shouldValidate: false });
    }
    if (watchedUserEmail !== inviteEmail) {
      form.setValue('userEmail', inviteEmail, { shouldValidate: true });
    }
    if (watchedUserEmailConfirm !== inviteEmail) {
      form.setValue('userEmailConfirm', inviteEmail, { shouldValidate: true });
    }
  }, [
    form,
    inviteContext,
    watchedCompanyName,
    watchedCompanyRut,
    watchedCompanyCity,
    watchedUserEmail,
    watchedUserEmailConfirm,
  ]);

  useEffect(() => {
    if (inviteContext) return;

    if (watchedCompanyId) {
      if (showCompanyFields) setShowCompanyFields(false);
      // Limpiar campos de empresa y errores (poner en undefined para que Zod no los valide)
      if (form.getValues('companyName') !== undefined) {
        form.setValue('companyName', undefined, { shouldValidate: true });
      }
      if (form.getValues('companyRut') !== undefined) {
        form.setValue('companyRut', undefined, { shouldValidate: true });
      }
      if (form.getValues('companyPhone') !== undefined) {
        form.setValue('companyPhone', undefined, { shouldValidate: false });
      }
      if (form.getValues('companyCity') !== undefined) {
        form.setValue('companyCity', undefined, { shouldValidate: false });
      }
      if (form.getValues('companyUrl') !== undefined) {
        form.setValue('companyUrl', undefined, { shouldValidate: false });
      }
      form.clearErrors([
        'companyName',
        'companyRut',
        'companyPhone',
        'companyCity',
        'companyUrl',
      ]);
    }
    if (showCompanyFields && watchedCompanyId !== '') {
      form.setValue('companyId', '', { shouldValidate: true });
      form.clearErrors(['companyId']);
    }
  }, [watchedCompanyId, showCompanyFields, form, inviteContext]);

  if (submitted) {
    return (
      <PreRegisterSuccess
        onGoToLogin={() => router.push('/login')}
        onGoHome={() => router.push('/')}
      />
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit, onInvalid)} className="space-y-8">
        {inviteContext && (
          <Card className="border-[#D05F27]/30 bg-[#D05F27]/5">
            <CardHeader>
              <CardTitle>Invitación como subcontratista</CardTitle>
              <CardDescription>
                La empresa mandante ya solicitó tu incorporación. Completa tus datos para que el administrador revise y active tu cuenta.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500 dark:text-gray-400">Empresa mandante</p>
                <p className="font-semibold text-gray-900 dark:text-gray-100">{inviteContext.contract.mandanteName ?? inviteContext.contract.mandanteRut}</p>
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400">Contrato</p>
                <p className="font-semibold text-gray-900 dark:text-gray-100">{inviteContext.contract.contractName}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">N° {inviteContext.contract.contractNumber}</p>
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400">Sub-empresa</p>
                <p className="font-semibold text-gray-900 dark:text-gray-100">{inviteContext.subCompany.name ?? inviteContext.subCompany.rut}</p>
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400">RUT sub-empresa</p>
                <p className="font-semibold text-gray-900 dark:text-gray-100">{inviteContext.subCompany.rut}</p>
              </div>
            </CardContent>
          </Card>
        )}

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
                        if (field.onBlur) {
                          field.onBlur();
                        }
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
            {!inviteContext && (
              <FormField
                name="companyId"
                control={form.control}
                render={({ field }) => (
                  <FormItem className="md:col-span-1">
                    <FormLabel>
                      Empresa <span className="text-red-600">*</span>
                    </FormLabel>
                    <FormControl>
                      <div className="w-full">
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
                        {!field.value && !loadingCompanies && (
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
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
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
                  {inviteContext
                    ? 'Estos datos vienen desde la solicitud de la empresa mandante y no se pueden cambiar en este formulario.'
                    : 'Información de la nueva empresa a registrar.'}
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
                        <Input placeholder="Nombre de la empresa" readOnly={Boolean(inviteContext)} {...field} />
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
                        <Input placeholder="76.123.456-7" readOnly={Boolean(inviteContext)} {...field} />
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
                        <Input placeholder="+56 9 1234 5678" readOnly={Boolean(inviteContext)} {...field} />
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
                        <Input placeholder="Santiago" readOnly={Boolean(inviteContext)} {...field} />
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
                        <Input placeholder="https://empresa.com" readOnly={Boolean(inviteContext)} {...field} />
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
        {!inviteContext && <div className="flex items-start gap-3 p-4 rounded-xl border-2 border-dashed border-default-200 bg-default-50 cursor-pointer" onClick={() => {
          setIsSubcontract(v => !v);
          form.setValue('isSubcontract', !isSubcontract);
          if (!isSubcontract) {
            // Limpiar campos de contrato al activar modo sub-contratista
            form.setValue('contractNumber', '');
            form.setValue('contractName', '');
            form.setValue('initialDate', '' as unknown as Date);
            form.setValue('finalDate', '' as unknown as Date);
            form.setValue('adminContractorId', '');
            form.setValue('subcontractContractId', '');
            form.clearErrors(['contractNumber', 'contractName', 'initialDate', 'finalDate', 'adminContractorId']);
          } else {
            form.setValue('subcontractContractId', '');
            form.clearErrors(['subcontractContractId']);
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
              Mi empresa trabajará bajo el contrato de una empresa mandante. Este formulario registra tus datos; la vinculación al contrato la revisará la mandante o el administrador.
            </p>
          </div>
        </div>}

        {isSubcontract && !inviteContext && (
          <Card>
            <CardHeader>
              <CardTitle>Empresa mandante y contrato</CardTitle>
              <CardDescription>
                Indica para qué contrato trabajará tu empresa. Con esto la mandante y el administrador podrán revisar la solicitud sin clasificarla manualmente.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-6">
              <FormField
                name="subcontractContractId"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Mandante / contrato <span className="text-red-600">*</span>
                    </FormLabel>
                    <FormControl>
                      <SearchSelect
                        value={field.value === null ? undefined : field.value}
                        onValueChange={field.onChange}
                        options={contractOptions}
                        placeholder={
                          loadingContracts
                            ? 'Cargando contratos...'
                            : 'Buscar mandante por empresa, RUT, número o nombre de contrato'
                        }
                        className="w-full"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
        )}

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
              El administrador revisará tu cuenta y la vinculación quedará asociada a la empresa mandante y contrato que seleccionaste.
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
