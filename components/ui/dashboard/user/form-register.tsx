"use client";
import { useEffect, useState, useTransition, useRef } from "react";
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
import { Mail, Lock, Phone, User, Fingerprint, ArrowLeft, Image as ImageIcon } from 'lucide-react';
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
import Image from "next/image";
import { DebugForm } from "@/components/ui/debug-form";
import { getCldImageUrl } from 'next-cloudinary';

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
  const [imageChanged, setImageChanged] = useState(false); // Nuevo estado para rastrear cambios en la imagen
  const router = useRouter();

  // Actualizar cómo obtenemos el adminId inicial
  const initialAdminId = initialData?.adminContractorId || undefined;

  const form = useForm<FormValues>({
    resolver: zodResolver(isEditing ? editSchema : registerSchema),
    mode: "all", // Agrega esta línea
    defaultValues: {
      email: initialData?.email || "",
      password: "",
      name: initialData?.name || "",
      middleName: initialData?.middleName || "",
      lastName: initialData?.lastName || "",
      secondLastName: initialData?.secondLastName || "",
      userName: initialData?.userName || "",
      run: initialData?.run || "",
      roles: initialData?.roles?.map(r => r.role.name) || [],
      adminContractorId: initialData?.adminContractorId || undefined,
      companyId: initialData?.companyId || undefined,
      category: "No definido",
      phoneNumber: initialData?.phoneNumber || "",
      image: undefined, // Aseguramos que images sea undefined inicialmente
    },
  });

  // Observamos los errores y el estado del formulario
  const hasErrors = Object.keys(form.formState.errors).length > 0;
  const isDirty = form.formState.isDirty || imageChanged; // Modificamos la verificación de cambios



  const FormInputs = [
    { name: "name", label: "Primer Nombre", placeholder: "ej: Juan", required: true },
    { name: "middleName", label: "Segundo Nombre", placeholder: "ej: Gabriel" },
    { name: "lastName", label: "Apellido Paterno", placeholder: "ej: González", required: true },
    { name: "secondLastName", label: "Apellido Materno", placeholder: "ej: Ramírez" },
    { name: "userName", label: "Nombre de Usuario", placeholder: "ej: Juan Gabriel", required: true, small: "Como te llamaremos en la plataforma" },
    { name: "email", label: "Correo Electrónico", type: "email", placeholder: "ej: nombre@dominio.com", required: true, icon: Mail },
    { name: "run", label: "RUN", placeholder: "ej: 12.345.678-9", required: true, icon: Fingerprint, small: "" },
    {
      name: "password",
      label: "Contraseña",
      type: "password",
      placeholder: isEditing ? "Dejar en blanco para mantener la contraseña actual" : "Contraseña",
      required: !isEditing,
      icon: Lock,
      small: isEditing ? "- Dejar vacío para mantener la contraseña actual" : "Mínimo 6 caracteres"
    },
    { name: "phoneNumber", label: "Teléfono", placeholder: "ej:52 2 23 24 25 ó 9 9876 1234", required: true, icon: Phone, small: "Formato: +56 xxxxxxxxx " },
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

        // Crear un objeto FormData para manejar la subida de archivos
        const formData = new FormData();

        // Crear una copia de los valores sin el campo image para validación
        const valuesForValidation = { ...values };
        delete valuesForValidation.image;

        // Convertir explícitamente valores null a undefined para compatibilidad de tipos
        if (valuesForValidation.adminContractorId === null) {
          valuesForValidation.adminContractorId = undefined;
        }

        if (valuesForValidation.companyId === null) {
          valuesForValidation.companyId = undefined;
        }

        // Agregar todos los campos del formulario al FormData (excepto image)
        Object.keys(valuesForValidation).forEach(key => {
          const value = valuesForValidation[key as keyof typeof valuesForValidation];
          if (value !== undefined && value !== null) {
            // Convertir arrays a string JSON para FormData
            if (Array.isArray(value)) {
              formData.append(key, JSON.stringify(value));
            } else {
              formData.append(key, String(value));
            }
          }
        });

        // Agregar el archivo si existe
        if (selectedFile) {
          formData.append('image', selectedFile);
        }

        // Mostrar los valores que se están enviando en la consola (ayuda para depuración)
        if (process.env.NODE_ENV === 'development') {
          console.log("Enviando datos al servidor:");
          formData.forEach((value, key) => {
            console.log(`${key}: ${value instanceof File ? `File: ${value.name}` : value}`);
          });
        }

        if (isEditing && initialData?.id) {
          // Para edición, aseguramos que solo enviamos la contraseña si está presente y no está vacía
          if (!values.password || (typeof values.password === "string" && values.password.trim() === "")) {
            formData.delete('password'); // Eliminamos el campo si está vacío para mantener la contraseña actual
          }
          actionResponse = await editAction(initialData.id, formData);
        } else {
          // Solo para NUEVO registro verificamos si hay contraseña
          if (!valuesForValidation.password) {
            form.setError("password", {
              type: "manual",
              message: "La contraseña es obligatoria para registrar un nuevo usuario"
            });
            setError("La contraseña es obligatoria para registrar un nuevo usuario");
            return;
          }

          // Ahora creamos el objeto con la seguridad de que password existe
          const registerInputData: RegisterActionInput = {
            email: valuesForValidation.email,
            password: valuesForValidation.password, // Aquí ya sabemos que no es undefined
            name: valuesForValidation.name,
            middleName: valuesForValidation.middleName || "",
            lastName: valuesForValidation.lastName,
            secondLastName: valuesForValidation.secondLastName || "",
            userName: valuesForValidation.userName,
            run: valuesForValidation.run,
            roles: valuesForValidation.roles,
            adminContractorId: valuesForValidation.adminContractorId !== undefined ?
              valuesForValidation.adminContractorId : "",
            companyId: valuesForValidation.companyId !== undefined ?
              valuesForValidation.companyId : "",
            category: valuesForValidation.category || "No definido",
            phoneNumber: valuesForValidation.phoneNumber
          };

          actionResponse = await registerAction(registerInputData, formData);
        }

        // Manejar errores de validación específicos
        if (actionResponse.error) {
          setError(actionResponse.error);

          // Si hay errores de validación detallados, mostrarlos en el formulario
          if (actionResponse.validationErrors && actionResponse.validationErrors.length > 0) {
            console.error("Errores de validación:", actionResponse.validationErrors);

            // Mostrar mensaje más detallado
            setError(`Datos inválidos: ${actionResponse.validationErrors.map(e => `${e.path}: ${e.message}`).join(', ')}`);

            // Establecer errores en los campos específicos del formulario
            actionResponse.validationErrors.forEach(error => {
              const fieldName = error.path.split('.')[0] as keyof FormValues;
              if (fieldName && form.setError) {
                form.setError(fieldName, {
                  type: 'manual',
                  message: error.message
                });
              }
            });
          }
          return;
        }

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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Función auxiliar para encontrar la imagen del usuario
  const findUserImage = (userData?: UserEdit): string | null | undefined => {
    if (!userData) return null;

    // Intentar todas las posibles ubicaciones donde podría estar la URL de la imagen
    // Eliminamos imageUrl que no existe en el tipo UserEdit
    return userData.image ||
      userData.images ||
      (typeof userData === 'object' && 'image' in userData ? (userData as any).image : null);
  };

  // Cargar la imagen existente cuando estamos en modo edición
  useEffect(() => {
    console.log("Datos iniciales:", initialData);

    if (isEditing && initialData?.id) {
        const cloudinaryUrl = getCldImageUrl({
            src: `user-profiles/user-${initialData.id}.jpg`,
            width: 300,
            height: 300,
        });
        console.log("Intentando cargar imagen desde:", cloudinaryUrl);
        setSelectedImage(cloudinaryUrl);
    } else {
        setSelectedImage("/placeholder-user.png");
    }

    const userImage = initialData?.image || initialData?.images;
    if (isEditing && userImage && typeof userImage === 'string') {
        setSelectedImage(userImage);
    }
}, [isEditing, initialData]);

  useEffect(() => {
    const loadAdmins = async () => {
      // Cargar los administradores independientemente del rol seleccionado
      const response = await fetchAdmins();
      if (response.ok && response.admins) {
        setAdmins(response.admins);
      }
    };
    loadAdmins();
  }, []);

  // Manejador para la carga de imágenes
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB límite
        addToast({
          title: "Error",
          description: "La imagen no debe superar los 5MB",
          timeout: 3000,
          icon: "❌",
          color: "danger"
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
      setSelectedFile(file);

      // Importante: No almacenamos el nombre del archivo en form.setValue
      // En su lugar, solo marcamos que la imagen ha cambiado
      setImageChanged(true);
      console.log("Imagen cargada:", file);
    }
  };

  // Función para simular el clic en el input file
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // Creamos una función para contar los FormField visibles
  const countVisibleFormFields = () => {
    let count = FormInputs.length; // Campos base
    count += 2; // Para roles y companyId
    return count;
  };

  // En el componente, antes del return
  const visibleFieldsCount = countVisibleFormFields();
  const needsFiller = visibleFieldsCount % 2 !== 0;

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-12 col-span-12 gap-x-6">
          {/* Campos de formulario existentes */}
          {FormInputs.map((field, index) => (
            <FormInput
              key={field.name}
              {...field}
              form={form}
            />
          ))}

          {/* Campo de roles */}
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
                        }}
                        placeholder="Seleccione uno o más roles"
                        defaultValue={initialData?.roles?.map(r => r.role.name) || []}
                        maxCount={3}
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

          {/* Campo de compañía */}
          <FormField
            name="companyId"
            control={form.control}
            render={({ field }) => (
              <FormItem className="col-span-12 md:col-span-6 md:col-start-1 md:row-start-6">
                <FormLabel>Empresa del usuario</FormLabel>
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
                        value={field.value === null ? undefined : field.value}
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

          {/* Campo de imagen */}
          <FormField
            name="image"
            control={form.control}
            render={({ field }) => (
              <FormItem className="col-span-12 md:col-span-6">
                <FormLabel>Imagen de perfil</FormLabel>
                <FormControl>
                  <div className="flex items-center gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={triggerFileInput}
                      className="flex items-center gap-2"
                    >
                      <ImageIcon size={16} />
                      {isEditing ? "Cambiar imagen" : "Subir Imagen"}
                    </Button>
                    <input
                      type="file"
                      accept="image/png, image/jpeg, image/avif"
                      ref={fileInputRef}
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    {selectedImage && (
                      <div className="relative">
                        {/* Usar un componente que evite ciclos de error */}
                        <Image
                          src={selectedImage}
                          alt="Imagen de perfil"
                          width={64}
                          height={64}
                          className="h-14 w-14 bg-cover rounded-full object-cover"
                          onError={() => {
                            // Registrar error una sola vez, luego usar una imagen predeterminada
                            console.error("Error al cargar la imagen de Cloudinary:", selectedImage);
                            setSelectedImage("/placeholder-user.png"); // Imagen local de fallback
                          }}
                          unoptimized={true} // Intentar saltarse la optimización de Next.js para imágenes externas
                        />
                        {isEditing && !selectedFile && (
                          <div className="absolute -bottom-1 -right-1 bg-blue-100 text-blue-500 rounded-full px-1 text-[10px]">
                            Actual
                          </div>
                        )}
                        {selectedFile && (
                          <div className="absolute -bottom-1 -right-1 bg-green-100 text-green-500 rounded-full px-1 text-[10px]">
                            Nueva
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </FormControl>
                <FormMessage className="text-red-600 dark:text-red-400 text-[12px] fade-in" />
              </FormItem>
            )}
          />

          {/* Elemento de relleno si es necesario */}
          {needsFiller && (
            <div className="col-span-12 md:col-span-6 md:col-start-7 hidden md:block" />
          )}

          {/* Sección de mensajes de error */}
          <div className="col-span-7 mt-8">
            {error && <p className="text-red-500">{error}</p>}
            {hasErrors && (
              <p className="text-red-600 dark:text-red-400 text-sm fade-in flex gap-2">
                Revisa los <strong>campos marcados</strong> <span className="hidden md:block">antes de enviar el formulario.</span>
              </p>
            )}
          </div>

          {/* Sección de botones */}
          <div className="col-span-5 flex justify-end mt-8">
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
                (isEditing && !isDirty) || // No hay cambios en modo edición
                hasErrors ||               // Hay errores de validación
                isPending                  // Está procesando la acción
              }
              className={cn(
                hasErrors && 'opacity-50 bg-slate-500 fade-in',
                (isEditing && !isDirty) && 'opacity-50 cursor-not-allowed'
              )}
            >
              {isPending ? 'Enviando...' : isEditing ? 'Guardar Cambios' : 'Enviar Registro'}
            </Button>
          </div>

          {/* Componente de depuración */}
          {process.env.NODE_ENV === 'development' && <DebugForm form={form} enabled={true} />}
        </form>
      </Form>
    </>
  );
};

export default FormRegister;
