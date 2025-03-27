"use client";
import { FormInput } from "@/components/ui/form/FormInput";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
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
// Definimos la interfaz para las opciones
interface CompanyOption {
  value: string;
  label: string;
  description?: string;
}
const FormRegister = () => {
// Tipamos el estado correctamente
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
      roles: ["user"],
      image: "",
      run: "",
      phoneNumber: "",
      // category: "",
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
    { name: "phoneNumber", label:"Teléfono", placeholder:"tu numero de contacto", required:true, icon:Phone, small:"Formato: +569xxxxxxxx" },
  ]


  const isFormInputsEven = FormInputs.length % 2 === 0;
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
              <FormItem className="col-span-12 lg:col-span-6">
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
                <FormMessage className="text-red-500" />
              </FormItem>
            )}
          />
          <FormField
            name="companyId"
            control={form.control}
            render={({ field }) => (
              <FormItem className="col-span-12 lg:col-span-6">
                <FormLabel>Empresa del usuario</FormLabel>
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
                <FormMessage className="text-red-500" />
              </FormItem>
            )}
          />

          <div className={`col-span-12 mt-8 hidden ${
            isFormInputsEven
              ? 'lg:col-span-12 lg:col-start-1 bg-green-400 ' // Si es par, ocupa 6 columnas y empieza en la 7
              : 'lg:col-span-6 col-start-1 lg:block' // Si es impar, ocupa las 12 columnas
          }`}></div>
          <div className="col-span-12 lg:col-span-6 mt-8">
            {error && <p className="text-red-500">{error}</p>}
            { hasErrors  &&(<p className="text-red-500 text-xs">Revisa los <strong>campos marcados</strong> antes de enviar el formulario.</p>)}
          </div>
        <div className="col-span-12 lg:col-span-6 flex justify-end mt-8">
          <Button
            type="submit"
            variant="default"
            disabled={hasErrors || isPending}
            className={`${hasErrors ? 'opacity-50 bg-slate-500' : ''}`}
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
