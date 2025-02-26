"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
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
import { Input } from "@/components/ui/input";
import { registerAction } from "@/actions/register-action";
import { addToast } from "@heroui/toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const FormRegister = () => {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    mode: "onChange", // Agrega esta línea
    defaultValues: {
      email: "",
      password: "",
      name: "",
      middleName: "",
      lastName: "",
      secondLastName: "",
      userName: "",
      role: "user",
    },
  });

  const onSubmit = async (values: z.infer<typeof registerSchema>) => {
    setError(null);
    startTransition(async () => {
      try {
        const response = await registerAction(values);
        if (response.error) {
          setError(response.error);
        } else {
          form.reset();
          addToast({
            title: "Usuario creado correctamente",
            description: "Redirigiendo al dashboard...",
            timeout: 2000, // 2 segundos
            icon: "✅",
            color: "success",
            variant: "flat",
            radius: "md",
            shouldShowTimeoutProgess: true,
          });
          setTimeout(() => {
            router.push("/dashboard/users");
          }, 2000);
        }
      } catch (error) {
        setError("An unexpected error occurred. Please try again.");
      }
    });
  };
  return (
    <>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="grid grid-cols-12 gap-4 col-span-12"
        >
          <FormField
            name="name"
            control={form.control}
            render={({ field }) => (
              <FormItem className="col-span-12 md:col-span-6">
                <FormLabel>
                  Primer Nombre <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input {...field} placeholder="ej: Juan" />
                </FormControl>
                <FormMessage className="text-red-500" />
              </FormItem>
            )}
          />

          <FormField
            name="middleName"
            control={form.control}
            render={({ field }) => (
              <FormItem className="col-span-12 md:col-span-6">
                <FormLabel>Segundo Nombre</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="ej: Gabriel" />
                </FormControl>
                <FormMessage className="text-red-500" />
              </FormItem>
            )}
          />

          <FormField
            name="lastName"
            control={form.control}
            render={({ field }) => (
              <FormItem className="col-span-12 md:col-span-6">
                <FormLabel>
                  Apellido Paterno <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input {...field} placeholder="ej: González" />
                </FormControl>
                <FormMessage className="text-red-500" />
              </FormItem>
            )}
          />

          <FormField
            name="secondLastName"
            control={form.control}
            render={({ field }) => (
              <FormItem className="col-span-12 md:col-span-6">
                <FormLabel>Apellido Materno</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="ej: Ramírez" />
                </FormControl>
                <FormMessage className="text-red-500" />
              </FormItem>
            )}
          />

          <FormField
            name="userName"
            control={form.control}
            render={({ field }) => (
              <FormItem className="col-span-12 md:col-span-6">
                <FormLabel>
                  Nombre de Usuario <span className="text-red-500">*</span>{" "}
                  <small className="text-xs italic text-gray-500">
                    como te llamaremos
                  </small>
                </FormLabel>
                <FormControl>
                  <Input {...field} placeholder=" ej: Juan Gabriel" />
                </FormControl>
                <FormMessage className="text-red-500" />
              </FormItem>
            )}
          />

          <FormField
            name="email"
            control={form.control}
            render={({ field }) => (
              <FormItem className="col-span-12 md:col-span-6">
                <FormLabel>
                  Correo Electrónico <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input type="email" {...field} placeholder="ej: nombre@dominio.com" />
                </FormControl>
                <FormMessage className="text-red-500" />
              </FormItem>
            )}
          />

          <FormField
            name="password"
            control={form.control}
            render={({ field }) => (
              <FormItem className="col-span-12 md:col-span-6">
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input type="password" {...field} placeholder="Password" />
                </FormControl>
                <FormMessage className="text-red-500" />
              </FormItem>
            )}
          />

          <FormField
            name="role"
            control={form.control}
            render={({ field }) => (
              <FormItem className="col-span-12 md:col-span-6">
                <FormLabel>Distintos roles del sistema</FormLabel>
                <FormControl>
                  <Controller
                    name="role"
                    control={form.control}
                    render={({ field }) => (
                      <Select {...field} onValueChange={field.onChange}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Seleccione un rol" />
                        </SelectTrigger>
                        <SelectContent className="bg-white dark:bg-gray-800">
                          <SelectItem value="admin" className="hover:bg-gray-100 dark:hover:bg-gray-900 cursor-pointer">Administrador de sistema</SelectItem>
                          <SelectItem value="sheq" className="hover:bg-gray-100 dark:hover:bg-gray-900 cursor-pointer">El SHEQ</SelectItem>
                          <SelectItem value="adminContractor" className="hover:bg-gray-100 dark:hover:bg-gray-900 cursor-pointer">Administrador de Contrato</SelectItem>
                          <SelectItem value="user" className="hover:bg-gray-100 dark:hover:bg-gray-900 cursor-pointer">Usuario de la plataforma</SelectItem>
                          <SelectItem value="credential" className="hover:bg-gray-100 dark:hover:bg-gray-900 cursor-pointer">El que imprimirá</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </FormControl>
                <FormMessage className="text-red-500" />
              </FormItem>
            )}
          />

          <div className="col-span-12 lg:col-span-6">
            {error && <p className="text-red-500">{error}</p>}
          </div>
          <div className="col-span-12 lg:col-span-6 flex justify-end">
            <Button type="submit" disabled={isPending}>
              Submit
            </Button>
          </div>
        </form>
      </Form>
    </>
  );
};

export default FormRegister;
