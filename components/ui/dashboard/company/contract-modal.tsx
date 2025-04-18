"use client";

import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@heroui/modal";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Contract } from "@/interfaces/contract.interface";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/date-picker";
import { SearchSelect } from "@/components/ui/search-select";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { AdminContractor } from "@/interfaces/admin-contractor.interface";

const contractSchema = z.object({
    contractNumber: z.string().min(1, "El número de contrato es requerido"),
    contractName: z.string().min(1, "El nombre del contrato es requerido"),
    initialDate: z.string().transform((str) => new Date(str)),
    finalDate: z.string().transform((str) => new Date(str)),
    useracId: z.string().min(1, "El administrador es requerido"),
    companyId: z.string()
});

type ContractFormValues = z.infer<typeof contractSchema>;

interface ContractModalProps {
    isOpen: boolean;
    onClose: () => void;
    companyId: string;
    onSubmit: (values: ContractFormValues) => void;
    adminContractors: AdminContractor[]; // Actualizamos el tipo
}

export const ContractModal = ({
    isOpen,
    onClose,
    companyId,
    onSubmit,
    adminContractors
}: ContractModalProps) => {
    const [isPending, setIsPending] = useState(false);

    const form = useForm<ContractFormValues>({
        resolver: zodResolver(contractSchema),
        defaultValues: {
            contractNumber: "",
            contractName: "",
            initialDate: new Date(new Date().toISOString().split('T')[0]),
            finalDate: new Date(new Date().toISOString().split('T')[0]),
            useracId: "",
            companyId: companyId
        }
    });
    // Validar que la fecha final sea posterior a la inicial
    const initialDate = form.watch("initialDate");
    const finalDate = form.watch("finalDate");

    useEffect(() => {
        if (initialDate && finalDate && finalDate <= initialDate) {
            form.setError("finalDate", {
                type: "manual",
                message: "La fecha de término debe ser posterior a la fecha de inicio"
            });
        } else {
            form.clearErrors("finalDate");
        }
    }, [initialDate, finalDate, form]);


    const handleSubmit = async (values: ContractFormValues) => {
        // Formatear las fechas para mostrarlas de manera legible
        const formattedInitialDate = new Date(values.initialDate).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        const formattedFinalDate = new Date(values.finalDate).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        // Encontrar el administrador seleccionado para mostrar sus datos
        const selectedAdmin = adminContractors.find(admin => admin.value === values.useracId);

        // Mostrar los datos que se van a guardar
        console.group('Datos del contrato a guardar:');
        console.log('Número de contrato:', values.contractNumber);
        console.log('Nombre del contrato:', values.contractName);
        console.log('Fecha de inicio:', formattedInitialDate);
        console.log('Fecha de término:', formattedFinalDate);
        console.log('Administrador seleccionado:', {
            id: selectedAdmin?.value,
            nombre: selectedAdmin?.label,
            email: selectedAdmin?.description
        });
        console.log('ID de la empresa:', values.companyId);
        console.log('Datos completos:', values);
        console.groupEnd();

        // Validación de fechas
        const startDate = new Date(values.initialDate);
        const endDate = new Date(values.finalDate);

        if (endDate <= startDate) {
            form.setError("finalDate", {
                type: "manual",
                message: "La fecha de término debe ser posterior a la fecha de inicio"
            });
            return;
        }

        // Validación de campos obligatorios
        if (!values.contractNumber.trim()) {
            form.setError("contractNumber", {
                type: "manual",
                message: "El número de contrato es requerido"
            });
            return;
        }

        if (!values.contractName.trim()) {
            form.setError("contractName", {
                type: "manual",
                message: "El nombre del contrato es requerido"
            });
            return;
        }

        if (!values.useracId) {
            form.setError("useracId", {
                type: "manual",
                message: "Debe seleccionar un administrador"
            });
            return;
        }

        // Si todo está bien, procedemos a guardar
        setIsPending(true);
        try {
            const contractData = {
                ...values,
                initialDate: startDate,
                finalDate: endDate,
                companyId: values.companyId
            };

            console.log('Datos preparados para enviar:', contractData);
            await onSubmit(contractData);

            console.log('Contrato guardado exitosamente');
            form.reset();
            onClose();
        } catch (error) {
            console.error('Error al guardar el contrato:', error);
        } finally {
            setIsPending(false);
        }
    };


return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg" backdrop="blur">
        <ModalContent>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)}>
                    <ModalHeader>
                        Agregar Nuevo Contrato
                    </ModalHeader>
                    <ModalBody>
                        <div className="space-y-4">
                            {/* Número de Contrato */}
                            <FormField
                                name="contractNumber"
                                control={form.control}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Número de Contrato</FormLabel>
                                        <FormControl>
                                            <Input 
                                                {...field}
                                                placeholder="Ej: CONT-2024-001"
                                                className={cn(
                                                    "w-full",
                                                    form.formState.errors.contractNumber && "border-destructive"
                                                )}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Nombre del Contrato */}
                            <FormField
                                name="contractName"
                                control={form.control}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Nombre del Contrato</FormLabel>
                                        <FormControl>
                                            <Input 
                                                {...field}
                                                placeholder="Ej: Contrato de Servicios 2024"
                                                className={cn(
                                                    "w-full",
                                                    form.formState.errors.contractName && "border-destructive"
                                                )}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="grid grid-cols-2 gap-4">
                                {/* Fecha Inicio */}
                                <FormField
                                    name="initialDate"
                                    control={form.control}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Fecha Inicio</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="date"
                                                    {...field}
                                                    value={field.value ? new Date(field.value).toISOString().split('T')[0] : ''}
                                                    className={cn(
                                                        "flex h-10 w-full rounded-md px-3 py-2",
                                                        "text-sm",
                                                        "bg-white dark:bg-gray-900",
                                                        "border-gray-300 dark:border-gray-700",
                                                        "hover:bg-gray-50 dark:hover:bg-gray-800",
                                                        form.formState.errors.initialDate && "border-destructive"
                                                    )}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Fecha Término */}
                                <FormField
                                    name="finalDate"
                                    control={form.control}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Fecha Término</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="date"
                                                    {...field}
                                                    value={field.value ? new Date(field.value).toISOString().split('T')[0] : ''}
                                                    className={cn(
                                                        "flex h-10 w-full rounded-md px-3 py-2",
                                                        "text-sm",
                                                        "bg-white dark:bg-gray-900",
                                                        "border-gray-300 dark:border-gray-700",
                                                        "hover:bg-gray-50 dark:hover:bg-gray-800",
                                                        form.formState.errors.finalDate && "border-destructive"
                                                    )}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {/* Administrador de Contrato */}
                            <FormField
                                name="useracId"
                                control={form.control}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Administrador de Contrato</FormLabel>
                                        <FormControl>
                                            <select 
                                                {...field}
                                                className={cn(
                                                    "flex h-10 w-full rounded-md px-3 py-2",
                                                    "text-sm placeholder:text-muted-foreground",
                                                    "disabled:cursor-not-allowed disabled:opacity-50",
                                                    "bg-white dark:bg-gray-900",
                                                    "border border-gray-300 dark:border-gray-700",
                                                    "text-gray-900 dark:text-gray-100",
                                                    "hover:bg-gray-50 dark:hover:bg-gray-800",
                                                    form.formState.errors.useracId && "border-destructive"
                                                )}
                                            >
                                                <option value="">Seleccione un administrador</option>
                                                {adminContractors.map((admin) => (
                                                    <option 
                                                        key={admin.value} 
                                                        value={admin.value}
                                                    >
                                                        {admin.label} ({admin.description})
                                                    </option>
                                                ))}
                                            </select>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </ModalBody>
                    <ModalFooter>
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={onClose}
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            disabled={isPending}
                        >
                            {isPending ? "Guardando..." : "Guardar Contrato"}
                        </Button>
                    </ModalFooter>
                </form>
            </Form>
        </ModalContent>
    </Modal>
);
};
