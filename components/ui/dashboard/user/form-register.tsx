"use client";
import { useEffect, useState, useTransition } from "react";
import { FormInput } from "@/components/ui/form/FormInput";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { addToast } from "@heroui/toast";
import { MultiSelect } from "../../multi-select";
import { Mail, Lock, Phone, User, Fingerprint, ArrowLeft } from 'lucide-react';
import { SearchSelect } from "../../search-select";
import { fetchCompanies } from "@/actions";
import { fetchAdmins } from "@/actions/user/get-admincContractor";
import { registerAction } from "@/actions/register-action";
import { cn } from "@/lib/utils";
import { editAction } from "@/actions/edit-action";
import { UserEdit } from "@/interfaces/user.interfaceEdit";
import { AdminOption } from "@/interfaces/admin.interface";
import { RegisterActionInput, EditActionInput } from '@/interfaces/action.interface';
import { FormValues, registerSchema, editSchema } from '@/lib/zod';
// Definimos la interfaz para las opciones
interface CompanyOption {
  value: string;
  label: string;
  description?: string;
}

interface FormRegisterProps {
  initialData?: UserEdit;
  isEditing?: boolean;
}

const FormRegister = ({ initialData, isEditing = false }: FormRegisterProps) => {

  const [companies, setCompanies] = useState<CompanyOption[]>([]);
  useEffect(() => {
    const loadCompanies = async () => {
      const response = await fetchCompanies();
      if (response.ok && response.companies) {
        // Aseguramos que companies es un array
        setCompanies(response.companies);
      }
    };

    loadCompanies();
  }, []);

  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [hasAttempted, setHasAttempted] = useState(false);
  const router = useRouter();

  // Actualizar cómo obtenemos el adminId inicial
  const initialAdminId = initialData?.adminContractorId || undefined;

  const form = useForm<FormValues>({
    resolver: zodResolver(isEditing ? editSchema : registerSchema),
    mode: "all", // Agrega esta línea
    defaultValues: {
      email: initialData?.email || "",
      password:"",
      name: initialData?.name || "",
      middleName:initialData?.middleName || "",
      lastName: initialData?.lastName || "",
      secondLastName: initialData?.secondLastName || "",
      userName: initialData?.userName || "",
      run: initialData?.run || "",
      roles: initialData?.roles?.map(r => r.role.name) || [],
      adminContractorId: initialData?.adminContractorId || undefined, // ✅ Correcto
      companyId: initialData?.companyId || undefined,
      category: "No definido",
      image: "",
      phoneNumber: initialData?.phoneNumber || "",
    },
  });

  // Observamos los errores y el estado del formulario
  const hasErrors = Object.keys(form.formState.errors).length > 0;
  const isDirty = form.formState.isDirty;



  const FormInputs = [
    { name: "name", label: "Primer Nombre", placeholder: "ej: Juan", required: true },
    { name: "middleName", label: "Segundo Nombre", placeholder: "ej: Gabriel" },
    { name: "lastName", label: "Apellido Paterno", placeholder: "ej: González", required: true },
    { name: "secondLastName", label: "Apellido Materno", placeholder: "ej: Ramírez" },
    { name: "userName", label: "Nombre de Usuario", placeholder: "ej: Juan Gabriel", required: true, small: "Como te llamaremos en la plataforma" },
    { name: "email", label:"Correo Electrónico", type:"email", placeholder:"ej: nombre@dominio.com", required:true, icon:Mail },
    { name: "run", label:"RUN", placeholder:"ej: 12.345.678-9", required:true, icon:Fingerprint, small:"" },
    { name: "password",
      label:"Contraseña",
      type:"password",
      placeholder: isEditing ? "Dejar en blanco para mantener actual" : "Contraseña",
      required:!isEditing,
      icon:Lock,
      small: isEditing ? "- Dejar vacío para mantener la contraseña actual" : "Mínimo 6 caracteres"
    },
    { name: "phoneNumber", label:"Teléfono", placeholder:"ej:52 2 23 24 25 ó 9 9876 1234", required:true, icon:Phone, small:"Formato: +56 xxxxxxxxx " },
  ]
  const roleOptions = [
    { value: "admin", label: "Administrador de sistema" },
    { value: "sheq", label: "El SHEQ" },
    { value: "adminContractor", label: "Administrador de Contrato" },
    { value: "user", label: "Usuario de la plataforma" },
    { value: "credential", label: "El que imprimirá" },
  ];

  const onSubmit = async (values: FormValues) => {

    if (!hasAttempted) {
        setHasAttempted(true);
        const isValid = await form.trigger();
        if (!isValid) return;
    }

    if (hasErrors) return;

    setError(null);
    startTransition(async () => {
        try {
            let actionResponse;
            const dataToSend = {
              ...values,
              adminContractorId: values.adminContractorId // Aseguramos que se incluye
          };

            if (isEditing && initialData?.id) {
                // Para edición, aseguramos que solo enviamos la contraseña si está presente
                const editData: EditActionInput = {
                    ...dataToSend,
                    ...(values.password ? { password: values.password } : {})
                };
                actionResponse = await editAction(initialData.id, editData);
            } else {
              actionResponse = await registerAction(dataToSend as RegisterActionInput);
            }

            if (actionResponse.error) {
                setError(actionResponse.error);
                return;
            }

            // form.reset();
            // setHasAttempted(false);
            addToast({
                title: isEditing ? "Usuario actualizado" : "Usuario creado",
                description: "Redirigiendo al dashboard...",
                timeout: 2000,
                icon: "✅",
                color: "success",
                variant: "flat",
                radius: "md",
                shouldShowTimeoutProgress: true,
            });
          router.push("/dashboard/users");
          router.refresh();

        } catch (error) {
            setError("Ocurrió un error inesperado. Por favor, intente nuevamente.");
        }
    });
};

  const [admins, setAdmins] = useState<AdminOption[]>([]);
  const watchedRoles = form.watch("roles");

  useEffect(() => {
    const loadAdmins = async () => {


        if (watchedRoles?.includes('user') ||
            initialData?.roles?.some(r => r.role.name === 'user')) {
            const response = await fetchAdmins();

            if (response.ok && response.admins) {
                // Los admins ya vienen formateados desde el servidor
                setAdmins(response.admins);
            }
        }
    };
    loadAdmins();
}, [watchedRoles, initialData, initialAdminId]);

  // Creamos una función para contar los FormField visibles
  const countVisibleFormFields = () => {
    let count = FormInputs.length; // Campos base

    // Si el rol 'user' está seleccionado, sumamos el SearchSelect
    if (watchedRoles?.includes('user')) {
      count++;
    }
    return count;
  };

  // En el componente, antes del return
  const visibleFieldsCount = countVisibleFormFields();
  const needsFiller = visibleFieldsCount % 2 !== 0;

  useEffect(() => {
    const loadAdmins = async () => {

        if (watchedRoles?.includes('user') ||
            initialData?.roles?.some(r => r.role.name === 'user')) {
            const response = await fetchAdmins();

            if (response.ok && response.admins) {
                // Los admins ya vienen formateados desde el servidor
                setAdmins(response.admins);
            }
        }
    };
    loadAdmins();
}, [watchedRoles, initialData, initialAdminId]);
  // Mostrar campo de admin si el usuario es 'user' o si se selecciona el rol
  const showAdminField = watchedRoles?.includes('user') ||
                        initialData?.roles?.some(r => r.role.name === 'user');

  return (
    <>
      <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-12 col-span-12 gap-x-6">
          {FormInputs.map((field, index) => (
              <FormInput
                  key={field.name}
                  {...field}
                  form={form}
              />
          ))}

          <FormField
            name="roles"
            control={form.control}
            render={({ field }) => (
              <FormItem className="col-span-12 md:col-span-6">
                <FormLabel>Distintos roles del sistema</FormLabel>
                <FormControl>
                  <Controller
                    name="roles"
                    control={form.control}
                    render={({ field }) => (
                      <MultiSelect
                        {...field}
                        options={roleOptions}
                        onValueChange={(values) => {
                          field.onChange(values);
                          // Si se remueve el rol 'user', limpiar el adminId
                          if (!values.includes('user')) {
                            form.setValue('adminContractorId', undefined);
                          }
                        }}
                        placeholder="Seleccione uno o más roles"
                        defaultValue={initialData?.roles?.map(r => r.role.name) || []}
                        maxCount={3} // Limitar la cantidad de roles mostrados
                        className={cn(
                          "w-full",
                          hasErrors && "border-destructive"
                        )}
                      />
                    )
                  }
                  />
                </FormControl>
                <FormMessage className="text-red-600 dark:text-red-400 text-[12px] fade-in" />
                {watchedRoles?.includes('user') && (
                  <p className="text-amber-500 text-xs fade-in">
                    Un usuario debe tener un administrador asociado
                  </p>
                )}
              </FormItem>
            )}
          />

{watchedRoles?.includes('user') && (
    <FormField
        name="adminContractorId"
        control={form.control}
        render={({ field }) => {

            return (
                <FormItem className="col-span-12 md:col-span-6 md:col-start-7 fade-in">
                    <FormLabel>Seleccionar Administrador</FormLabel>
                    <FormControl className="fade-in border-amber-500 text-amber-500">
                        <SearchSelect
                            value={field.value || ''}
                            onValueChange={(newValue) => {
                                field.onChange(newValue);
                            }}
                            defaultValue={initialData?.adminContractorId || ""}
                            options={admins}
                            placeholder="Buscar administrador..."
                            className={cn(
                                "w-full",
                                hasErrors && "border-destructive"
                            )}
                        />
                    </FormControl>
                    <FormMessage />
                </FormItem>
            );
        }}
    />
)}

          <FormField
            name="companyId"
            control={form.control}
            render={({ field }) => (
              <FormItem className="col-span-12 md:col-span-6 md:col-start-1 md:row-start-6">
                <FormLabel>Empresa del usuario </FormLabel>
                <FormControl>
                  <Controller
                    name="companyId"
                    control={form.control}
                    render={({ field }) => (
                      <SearchSelect
                        {...field}
                        onValueChange={field.onChange}
                        options={companies}
                        placeholder="Seleccione una empresa"
                        defaultValue={initialData?.companyId || ""}
                        className={cn(
                          "w-full",
                          hasErrors && "border-destructive"
                        )}
                      />
                    )}
                  />
                </FormControl>
                <FormMessage className="text-red-600 dark:text-red-400 text-[12px] fade-in" />
              </FormItem>
            )}
          />

          {needsFiller && (
                <div className="col-span-12 md:col-span-6 md:col-start-7 hidden md:block" />
          )}


          <div className="col-span-7 mt-8 ">
            {error && <p className="text-red-500">{error}</p>}
            { hasErrors  &&(<p className="text-red-600 dark:text-red-400 text-sm fade-in flex gap-2">Revisa los <strong>campos marcados</strong> <span className="hidden md:block">antes de enviar el formulario.</span></p>)}
          </div>
        <div className="col-span-5 flex justify-end mt-8 ">
        <Button
        type="button"
        variant="outline"
        onClick={() => router.push("/dashboard/users")}
        className="flex items-center gap-2 mr-6"
    >
        <ArrowLeft size={16} />
        Volver
    </Button>
          <Button
            type="submit"
            variant="default"
            disabled={
                // Deshabilitar si:
                (isEditing && !form.formState.isDirty) || // No hay cambios en modo edición
                hasErrors || // Hay errores de validación
                isPending // Está procesando la acción
            }
            className={cn(
                hasErrors && 'opacity-50 bg-slate-500 fade-in',
                (isEditing && !form.formState.isDirty) && 'opacity-50 cursor-not-allowed'
            )}
          >
            {isPending ? 'Enviando...' : isEditing ? 'Guardar Cambios' : 'Enviar Registro'}
          </Button>
        </div>
        </form>
      </Form>
    </>
  );
};

export default FormRegister;
