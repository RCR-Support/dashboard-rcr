"use client";
import { useEffect, useState, useTransition } from "react";
import { FormInput } from "@/components/ui/form/FormInput";
import { useRouter } from "next/navigation";
import { registerSchema } from "@/lib/zod";
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
import { registerAction } from "@/actions/register-action";
import { addToast } from "@heroui/toast";
import { MultiSelect } from "../../multi-select";
import { Mail, Lock, Phone, User, Fingerprint } from 'lucide-react';
import { SearchSelect } from "../../search-select";
import { fetchCompanies } from "@/actions";
import { fetchAdmins } from "@/actions/user/get-admincContractor";
// Definimos la interfaz para las opciones
interface CompanyOption {
  value: string;
  label: string;
  description?: string;
}
interface AdminOption {
  value: string;
  label: string;
}

const FormRegister = () => {

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

  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    mode: "all", // Agrega esta línea
    defaultValues: {
      email: "",
      password: "",
      name: "",
      middleName: "",
      lastName: "",
      secondLastName: "",
      userName: "",
      run: "",
      roles: [],
      adminId: undefined,
      companyId: undefined,
      category: "No definido",
      image: "",
      phoneNumber: "",
    },
  });

  // Observamos los errores y el estado del formulario
  const hasErrors = Object.keys(form.formState.errors).length > 0;
  const isDirty = form.formState.isDirty;

const onSubmit = async (values: z.infer<typeof registerSchema>) => {
// Si es el primer intento, marcamos y validamos
if (!hasAttempted) {
  setHasAttempted(true);
  const isValid = await form.trigger();
  if (!isValid) return;
}

// Si hay errores después del primer intento, no continuamos
if (hasErrors) {
  return;
}

  setError(null);

  setError(null);
  startTransition(async () => {
    try {
      const response = await registerAction(values);
      if (response.error) {
        setError(response.error);
      } else {
        form.reset();
        setHasAttempted(false);
        addToast({
          title: "Usuario creado correctamente",
          description: "Redirigiendo al dashboard...",
          timeout: 2000,
          icon: "✅",
          color: "success",
          variant: "flat",
          radius: "md",
          shouldShowTimeoutProgress: true,
        });
        setTimeout(() => {
          router.push("/dashboard/users");
        }, 2000);
      }
    } catch (error) {
      setError("Ocurrió un error inesperado. Por favor, intente nuevamente.");
    }
  });
};

  const FormInputs = [
    { name: "name", label: "Primer Nombre", placeholder: "ej: Juan", required: true },
    { name: "middleName", label: "Segundo Nombre", placeholder: "ej: Gabriel" },
    { name: "lastName", label: "Apellido Paterno", placeholder: "ej: González", required: true },
    { name: "secondLastName", label: "Apellido Materno", placeholder: "ej: Ramírez" },
    { name: "userName", label: "Nombre de Usuario", placeholder: "ej: Juan Gabriel", required: true, small: "Como te llamaremos en la plataforma" },
    { name: "email", label:"Correo Electrónico", type:"email", placeholder:"ej: nombre@dominio.com", required:true, icon:Mail },
    { name: "run", label:"RUN", placeholder:"ej: 12.345.678-9", required:true, icon:Fingerprint, small:"Sin puntos ni guión" },
    { name: "password", label:"Contraseña", type:"password", placeholder:"Contraseña", required:true, icon:Lock },
    { name: "phoneNumber", label:"Teléfono", placeholder:"ej:52 2 23 24 25 ó 9 9876 1234", required:true, icon:Phone, small:"Formato: +56 xxxxxxxxx " },
  ]

  const [admins, setAdmins] = useState<AdminOption[]>([]);
  const watchedRoles = form.watch("roles");

  useEffect(() => {
      const loadAdmins = async () => {
          if (watchedRoles?.includes('user')) {
              const response = await fetchAdmins();
              if (response.ok && response.admins) {
                  // Aseguramos que siempre sea un array
                  setAdmins(response.admins);
              }
          }
      };
      loadAdmins();
  }, [watchedRoles]);

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
                        {...field} onValueChange={field.onChange}
                        options={[
                          { value: "admin", label: "Administrador de sistema" },
                          { value: "sheq", label: "El SHEQ" },
                          { value: "adminContractor", label: "Administrador de Contrato" },
                          { value: "user", label: "Usuario de la plataforma" },
                          { value: "credential", label: "El que imprimirá" },
                        ]}
                        placeholder="Seleccione uno o más roles"
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
                  name="adminId"
                  control={form.control}
                  render={({ field }) => (
                      <FormItem className="col-span-12 md:col-span-6 md:col-start-7 fade-in">
                          <FormLabel>Seleccionar Administrador</FormLabel>
                          <FormControl className="fade-in border-amber-500 text-amber-500">
                              <SearchSelect
                                  {...field}
                                  onValueChange={field.onChange}
                                  options={admins}
                                  placeholder="Buscar administrador..."
                              />
                          </FormControl>
                          <FormMessage />
                      </FormItem>
                  )}
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
                        {...field} onValueChange={field.onChange}
                        options={companies}
                        placeholder="Seleccione una empresa"
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
        <div className="col-span-5 flex justify-end mt-8">
          <Button
            type="submit"
            variant="default"
            className={`${hasErrors ? 'opacity-50 bg-slate-500 fade-in' : ''}`}
          >
            {isPending ? 'Enviando...' : 'Enviar Registro'}
          </Button>
        </div>
        </form>
      </Form>
    </>
  );
};

export default FormRegister;
