"use client";

import { useState, useTransition } from "react";
import { FormInput } from "@/components/ui/form/FormInput";
import { useRouter } from "next/navigation";
import { companySchema } from "@/lib/validation-company";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { createCompany, updateCompany } from "@/actions/company/company-actions";
import { addToast } from "@heroui/toast";
import { Building2, Phone, Globe, MapPin } from 'lucide-react';
import { CompanySelectEdit } from "@/interfaces/CompanySelectEdit";


interface CompanyFormProps {
  initialData?: CompanySelectEdit;
  isEditing?: boolean;
}

const CompanyForm = ( { initialData, isEditing = false }: CompanyFormProps ) => {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [hasAttempted, setHasAttempted] = useState(false);
  const router = useRouter();

  const form = useForm<z.infer<typeof companySchema>>({
    resolver: zodResolver(companySchema),
    mode: "all",
    defaultValues: {
      name: initialData?.name || "",
      phone: initialData?.phone || "",
      rut: initialData?.rut || "",
      url: initialData?.url || "",
      city: initialData?.city || "",
    },
  });

  const hasErrors = Object.keys(form.formState.errors).length > 0;
  const isDirty = form.formState.isDirty;

  const FormInputs = [
    {
      name: "name",
      label: "Nombre de la Empresa",
      placeholder: "ej: Empresa S.A.",
      required: true,
      icon: Building2
    },
    {
      name: "rut",
      label: "RUT",
      placeholder: "ej: 12.345.678-9",
      required: true
    },
    {
      name: "phone",
      label: "Teléfono",
      placeholder: "12345678",
      required: true,
      icon: Phone,
      small: "Solo números, sin +56"

    },
    {
      name: "city",
      label: "Ciudad",
      placeholder: "ej: Santiago",
      icon: MapPin
    },
    {
      name: "url",
      label: "Sitio Web",
      placeholder: "https://ejemplo.com",
      icon: Globe
    },
  ];


  // Agregar un estado para rastrear si el formulario está completo
  const formValues = form.watch();
  const isFormComplete = Object.values(formValues).every(value =>
    value !== undefined && value !== ""
  );

  // Verificar si hay cambios comparando con los datos iniciales
  const hasChanges = isEditing && (Object.keys(formValues) as Array<keyof typeof formValues>).some(key =>
    formValues[key] !== form.formState.defaultValues?.[key]
  );

  // Determinar si el botón debe estar deshabilitado
  const isButtonDisabled = isEditing ?
    (!hasChanges || !isFormComplete || hasErrors) :
    (!isFormComplete || hasErrors);

  const onSubmit = async (values: z.infer<typeof companySchema>) => {
    if (!hasAttempted) {
      setHasAttempted(true);
      const isValid = await form.trigger();
      if (!isValid) return;
    }

    if (hasErrors) return;

    setError(null);
    startTransition(async () => {
      try {
        const response = isEditing
          ? await updateCompany({ ...values, id: initialData!.value })
          : await createCompany(values);

        if (response.error) {
          setError(response.error);
        } else {
          addToast({
            title: `Empresa ${isEditing ? 'actualizada' : 'creada'} correctamente`,
            description: `La empresa ha sido ${isEditing ? 'actualizada' : 'registrada'} en el sistema`,
            timeout: 2000,
            icon: "✅",
            color: "success",
            variant: "flat",
            radius: "md",
            shouldShowTimeoutProgress: true,
          });

          if (!isEditing) {
            form.reset();
            setHasAttempted(false);
          }

          router.push("/dashboard/companies");
          router.refresh();
        }
      } catch (error) {
        setError("Ocurrió un error inesperado. Por favor, intente nuevamente.");
      }
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-12 col-span-12 gap-x-6">

        {FormInputs.map((field) => (
          <FormInput
            key={field.name}
            {...field}
            form={form}
          />
        ))}

        <div className="col-span-7 mt-8">
          {error && <p className="text-red-500">{error}</p>}
          {hasErrors && (
            <p className="text-red-600 dark:text-red-400 text-sm fade-in flex gap-2">
              Revisa los <strong>campos marcados</strong> 
              <span className="hidden md:block">antes de enviar el formulario.</span>
            </p>
          )}
        </div>

        <div className="col-span-5 flex justify-end mt-8">
        <Button
            type="submit"
            variant="default"
            disabled={isButtonDisabled}
            className={`${
              isButtonDisabled 
                ? 'opacity-50 bg-slate-500 cursor-not-allowed' 
                : ''
            }`}
          >
            {isPending 
              ? (isEditing ? 'Actualizando...' : 'Creando...') 
              : (isEditing ? 'Actualizar Empresa' : 'Crear Empresa')}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default CompanyForm;
