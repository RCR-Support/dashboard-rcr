"use client";

import { addToast } from "@heroui/toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DatePicker } from "@/components/date-picker";
import { preRegisterAction } from "@/actions/pre-registration/pre-registration-action";
import { useEffect, useState, useTransition } from "react";
import { SearchSelect } from "@/components/ui/search-select";
import { useRouter } from "next/navigation";
import { baseUserSchema } from "@/lib/zod";
import { companySchema } from "@/lib/validation-company";

// El mismo esquema de Zod que en la acción para validación en el cliente
const preRegisterFormSchema = z.object({
    companyId: z.string().optional(),
    companyName: companySchema.shape.name.optional(),
    companyRut: companySchema.shape.rut.optional(),
    companyPhone: companySchema.shape.phone.optional(),
    companyCity: companySchema.shape.city.optional(),
    companyUrl: companySchema.shape.url.optional().or(z.literal("")),

    // Campos de usuario reutilizando baseUserSchema
    userName: baseUserSchema.shape.name,
    userLastName: baseUserSchema.shape.lastName,
    userMiddleName: baseUserSchema.shape.middleName,
    userSecondLastName: baseUserSchema.shape.secondLastName,
    userEmail: baseUserSchema.shape.email,
    userRun: baseUserSchema.shape.run,
    userPhoneNumber: z.string().min(9, "El teléfono es requerido"),
    displayName: z.string().optional(),

    contractNumber: z.string().min(1, "El número de contrato es requerido"),
    contractName: z.string().min(3, "El nombre del contrato es requerido"),
    initialDate: z.coerce.date({ required_error: "La fecha de inicio es requerida" }),
    finalDate: z.coerce.date({ required_error: "La fecha de término es requerida" }),
    adminContractorId: z.string().min(1, "Debe seleccionar un administrador de contrato"),
}).superRefine((data, ctx) => {
    // Si NO hay companyId, los campos de empresa son obligatorios
    if (!data.companyId) {
        if (!data.companyName || data.companyName.trim().length < 3) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["companyName"],
                message: "El nombre de la empresa es requerido"
            });
        }
        if (!data.companyRut || data.companyRut.trim().length < 9) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["companyRut"],
                message: "El RUT de la empresa es requerido"
            });
        }
    }
});

type PreRegisterFormValues = z.infer<typeof preRegisterFormSchema>;

export const FormPreRegister = () => {
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [empresaOptions, setEmpresaOptions] = useState<{ label: string; value: string }[]>([]);
    const [adminOptions, setAdminOptions] = useState<{ label: string; value: string; description?: string }[]>([]);
    const [showCompanyFields, setShowCompanyFields] = useState(false);
    // Estado para animación fade-out
    const [showCard, setShowCard] = useState(false);
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
            const res = await fetch("/api/companies");
            const data = await res.json();
            setEmpresaOptions(data);
        };
        loadCompanies();
        // Cargar administradores de contrato
        const loadAdmins = async () => {
            const res = await fetch("/api/admin-contractors");
            const data = await res.json();
            setAdminOptions(data);
        };
        loadAdmins();
    }, []);

    const form = useForm<PreRegisterFormValues>({
        resolver: zodResolver(preRegisterFormSchema),
        mode: "onChange", // Validación en tiempo real
        defaultValues: {
            companyId: "",
            companyName: "",
            companyRut: "",
            companyPhone: "",
            companyCity: "",
            companyUrl: "",
            userEmail: "",
            userRun: "",
            userName: "",
            userLastName: "",
            userMiddleName: "",
            userSecondLastName: "",
            userPhoneNumber: "",
            displayName: "",
            contractNumber: "",
            contractName: "",
            adminContractorId: "",
            initialDate: undefined,
            finalDate: undefined,
        },
    });

    const onSubmit = (data: PreRegisterFormValues) => {
        setError(null);
        setSuccess(null);
        console.log("[PreRegistro] Enviando datos:", data);

        // Si companyId es string vacío, lo convertimos a undefined para el flujo correcto
        const normalizedCompanyId = data.companyId && data.companyId !== '' ? data.companyId : undefined;

        // Si displayName está vacío, lo rellenamos antes de enviar
        const displayName = typeof data.displayName === "string" ? data.displayName.trim() : "";
        const nombre = typeof data.userName === "string" ? data.userName.trim() : "";
        const apellido = typeof data.userLastName === "string" ? data.userLastName.trim() : "";
        const finalDisplayName = displayName ? displayName : `${nombre} ${apellido}`.trim();

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
                displayName: finalDisplayName
            };
        } else {
            // Nueva empresa: limpiar companyId (enviar undefined, no string vacío)
            dataToSend = {
                ...data,
                companyId: undefined,
                displayName: finalDisplayName
            };
        }

        startTransition(async () => {
            const result = await preRegisterAction(dataToSend);
            console.log("[PreRegistro] Resultado de preRegisterAction:", result);
            if (result.error) {
                setError(result.error);
                setSuccess(null);
            } else {
                setError(null);
                setSuccess(result.message || "¡Solicitud enviada con éxito!");
                addToast({
                  title: "Formulario enviado",
                  description: "Redirigiendo al inicio...",
                  timeout: 2000,
                  icon: "✅",
                  color: "success",
                  variant: "flat",
                  radius: "md",
                  shouldShowTimeoutProgress: true,
                });
                setTimeout(() => {
                  router.push("/");
                  router.refresh();
                }, 2000);
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
            form.clearErrors(['companyName', 'companyRut', 'companyPhone', 'companyCity', 'companyUrl']);
        }
        if (showCompanyFields) {
            form.setValue('companyId', '', { shouldValidate: true });
            form.clearErrors(['companyId']);
        }
    }, [watchedCompanyId, showCompanyFields, form]);

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                {/* Card de Usuario */}
                <Card>
                    <CardHeader>
                        <CardTitle>Datos del Usuario</CardTitle>
                        <CardDescription>Este usuario será el responsable de gestionar el contrato.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField control={form.control} name="userName" render={({ field }) => <FormItem><FormLabel>Nombre <span className="text-red-600">*</span></FormLabel><FormControl><Input placeholder="Juan" {...field} /></FormControl><FormMessage /></FormItem>} />
                        <FormField control={form.control} name="userLastName" render={({ field }) => <FormItem><FormLabel>Apellido Paterno <span className="text-red-600">*</span></FormLabel><FormControl><Input placeholder="Pérez" {...field} /></FormControl><FormMessage /></FormItem>} />
                        <FormField control={form.control} name="userMiddleName" render={({ field }) => <FormItem><FormLabel>Segundo Nombre (Opcional)</FormLabel><FormControl><Input placeholder="Carlos" {...field} /></FormControl><FormMessage /></FormItem>} />
                        <FormField control={form.control} name="userSecondLastName" render={({ field }) => <FormItem><FormLabel>Apellido Materno (Opcional)</FormLabel><FormControl><Input placeholder="González" {...field} /></FormControl><FormMessage /></FormItem>} />
                        {/* Campo para Nombre de Usuario (displayName) */}
                        <FormField
                          control={form.control}
                          name="displayName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>¿Cómo te llamaremos en la plataforma? (Opcional)</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Ej: Juan Pérez"
                                  {...field}
                                  onBlur={e => {
                                    // Si está vacío, autocompletar con nombre y apellido
                                    if (!e.target.value) {
                                      const nombre = form.getValues("userName");
                                      const apellido = form.getValues("userLastName");
                                      form.setValue("displayName", `${nombre} ${apellido}`.trim());
                                    }
                                    field.onBlur && field.onBlur(); // <-- corregido, sin pasar e
                                  }}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField control={form.control} name="userRun" render={({ field }) => <FormItem><FormLabel>RUN <span className="text-red-600">*</span></FormLabel><FormControl><Input placeholder="12.345.678-9" {...field} /></FormControl><FormMessage /></FormItem>} />
                        <FormField control={form.control} name="userEmail" render={({ field }) => <FormItem><FormLabel>Email <span className="text-red-600">*</span></FormLabel><FormControl><Input type="email" placeholder="juan.perez@empresa.com" {...field} /></FormControl><FormMessage /></FormItem>} />
                        <FormField control={form.control} name="userPhoneNumber" render={({ field }) => <FormItem><FormLabel>Teléfono <span className="text-red-600">*</span></FormLabel><FormControl><Input placeholder="+56 9 8765 4321" {...field} /></FormControl><FormMessage /></FormItem>} />
                        <FormField
                          name="companyId"
                          control={form.control}
                          render={({ field }) => (
                            <FormItem className="md:col-span-1">
                              <FormLabel>Empresa <span className="text-red-600">*</span></FormLabel>
                              <FormControl>
                                <>
                                  <Controller
                                    name="companyId"
                                    control={form.control}
                                    render={({ field }) => (
                                      <SearchSelect
                                        {...field}
                                        onValueChange={value => {
                                          field.onChange(value);
                                          if (value) setShowCompanyFields(false);
                                        }}
                                        options={empresaOptions}
                                        placeholder="Seleccione una empresa"
                                        value={field.value === null ? undefined : field.value}
                                        className="w-full"
                                      />
                                    )}
                                  />
                                  {!form.watch('companyId') && (
                                    <div className="flex items-center mt-2">
                                      <input
                                        id="empresa-no-encontrada"
                                        type="checkbox"
                                        checked={showCompanyFields}
                                        onChange={() => setShowCompanyFields(!showCompanyFields)}
                                        className="mr-2"
                                      />
                                      <label htmlFor="empresa-no-encontrada" className="text-sm">Empresa no encontrada</label>
                                    </div>
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
                  <div className={showCompanyFields ? "fade-in transition-all duration-500" : "fade-out transition-all duration-500"}>
                    <Card>
                        <CardHeader>
                            <CardTitle>Datos de la Empresa</CardTitle>
                            <CardDescription>Información de la nueva empresa a registrar.</CardDescription>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField control={form.control} name="companyName" render={({ field }) => <FormItem><FormLabel>Nombre <span className="text-red-600">*</span></FormLabel><FormControl><Input placeholder="Nombre de la empresa" {...field} /></FormControl><FormMessage /></FormItem>} />
                            <FormField control={form.control} name="companyRut" render={({ field }) => <FormItem><FormLabel>RUT <span className="text-red-600">*</span></FormLabel><FormControl><Input placeholder="76.123.456-7" {...field} /></FormControl><FormMessage /></FormItem>} />
                            <FormField control={form.control} name="companyPhone" render={({ field }) => <FormItem><FormLabel>Teléfono <span className="text-red-600">*</span></FormLabel><FormControl><Input placeholder="+56 9 1234 5678" {...field} /></FormControl><FormMessage /></FormItem>} />
                            <FormField control={form.control} name="companyCity" render={({ field }) => <FormItem><FormLabel>Ciudad</FormLabel><FormControl><Input placeholder="Santiago" {...field} /></FormControl><FormMessage /></FormItem>} />
                            <FormField control={form.control} name="companyUrl" render={({ field }) => <FormItem className="md:col-span-2"><FormLabel>Sitio Web (Opcional)</FormLabel><FormControl><Input placeholder="https://empresa.com" {...field} /></FormControl><FormMessage /></FormItem>} />
                        </CardContent>
                    </Card>
                  </div>
                )}

                {/* Card de Contrato */}
                <Card>
                    <CardHeader>
                        <CardTitle>Datos del Contrato</CardTitle>
                        <CardDescription>Información del contrato asociado a la empresa.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField control={form.control} name="contractNumber" render={({ field }) => <FormItem><FormLabel>Número de Contrato <span className="text-red-600">*</span></FormLabel><FormControl><Input placeholder="C-2025-001" {...field} /></FormControl><FormMessage /></FormItem>} />
                        <FormField control={form.control} name="contractName" render={({ field }) => <FormItem><FormLabel>Nombre del Contrato <span className="text-red-600">*</span></FormLabel><FormControl><Input placeholder="Servicios de Mantención" {...field} /></FormControl><FormMessage /></FormItem>} />
                        <FormField control={form.control} name="initialDate" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Fecha de Inicio <span className="text-red-600">*</span></FormLabel>
                                <FormControl>
                                    <DatePicker
                                        date={field.value}
                                        setDate={field.onChange}
                                        placeholder="Seleccionar fecha"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="finalDate" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Fecha de Término <span className="text-red-600">*</span></FormLabel>
                                <FormControl>
                                    <DatePicker
                                        date={field.value}
                                        setDate={field.onChange}
                                        placeholder="Seleccionar fecha"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField
                          name="adminContractorId"
                          control={form.control}
                          render={({ field }) => (
                            <FormItem className="md:col-span-1">
                              <FormLabel>Administrador de Contrato <span className="text-red-600">*</span></FormLabel>
                              <FormControl>
                                <SearchSelect
                                  {...field}
                                  onValueChange={field.onChange}
                                  options={adminOptions}
                                  placeholder="Seleccione un administrador de contrato"
                                  value={field.value === null ? undefined : field.value}
                                  className="w-full"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                    </CardContent>
                </Card>

                {error && <div className="p-4 text-center text-sm text-red-700 bg-red-100 rounded-md">{error}</div>}
                {success && <div className="p-4 text-center text-sm text-green-700 bg-green-100 rounded-md">{success}</div>}

                <Button type="submit" className="w-full" disabled={isPending || !form.formState.isValid}>
                    {isPending ? "Enviando Solicitud..." : "Enviar Solicitud de Pre-Registro"}
                </Button>
            </form>
        </Form>
    );
};
