"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { Prisma, RoleEnum } from "@prisma/client";

// 1. Esquema de validación para el pre-registro
const preRegisterSchema = z.object({
  companyId: z.string().optional(),
  // Datos de la Empresa (solo requeridos si NO hay companyId)
  companyName: z.string().min(3, "El nombre de la empresa es requerido").optional().or(z.literal("")),
  companyRut: z.string().min(8, "El RUT de la empresa es requerido").optional().or(z.literal("")),
  companyPhone: z.string().optional().or(z.literal("")),
  companyCity: z.string().optional().or(z.literal("")),
  companyUrl: z.string().url("URL inválida").optional().or(z.literal("")),

  // Datos del Usuario
  userEmail: z.string().email("Email inválido"),
  userRun: z.string().min(8, "El RUN debe tener al menos 10 caracteres"),
  userName: z.string().min(1, "El nombre es requerido"),
  userLastName: z.string().min(1, "El apellido paterno es requerido"),
  userMiddleName: z.string().optional(),
  userSecondLastName: z.string().optional(),
  userPhoneNumber: z.string().min(9, "El teléfono es requerido"),
  displayName: z.string().optional(),

  // Datos del Contrato
  contractNumber: z.string().min(1, "El número de contrato es requerido"),
  contractName: z.string().min(3, "El nombre del contrato es requerido"),
  initialDate: z.coerce.date({ required_error: "La fecha de inicio es requerida" }),
  finalDate: z.coerce.date({ required_error: "La fecha de término es requerida" }),
  adminContractorId: z.string().min(1, "Debe seleccionar un administrador de contrato"),
}).superRefine((data, ctx) => {
  // Solo validar datos de empresa si NO hay companyId
  if (!data.companyId) {
    if (!data.companyName || data.companyName.trim().length < 3) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["companyName"],
        message: "El nombre de la empresa es requerido"
      });
    }
    if (!data.companyRut || data.companyRut.trim().length < 8) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["companyRut"],
        message: "El RUT de la empresa debe tener al menos 8 caracteres"
      });
    }
    // Solo validar URL si está presente
    if (data.companyUrl && data.companyUrl !== "" && !/^https?:\/\//.test(data.companyUrl)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["companyUrl"],
        message: "URL inválida"
      });
    }
  }
});

export const preRegisterAction = async (values: unknown) => {
    console.log("[preRegisterAction] values recibidos:", values);
    try {
        // 1. Parseo general para obtener companyId
        const parsedGeneral = preRegisterSchema.safeParse(values);
        if (!parsedGeneral.success) {
            console.log("[preRegisterAction] Error de validación general:", parsedGeneral.error.errors);
            return {
                error: "Datos inválidos",
                validationErrors: parsedGeneral.error.errors.map(error => ({
                    path: error.path.join('.'),
                    message: error.message
                }))
            };
        }
        const data = parsedGeneral.data;
        const isEmpresaExistente = !!data.companyId && data.companyId !== "";
        console.log("[preRegisterAction] isEmpresaExistente:", isEmpresaExistente);

        // Validación condicional de campos de empresa
        if (!isEmpresaExistente) {
            // Si NO hay companyId, validar que los campos de empresa estén presentes
            if (!data.companyName || !data.companyRut) {
                return { error: "Debe completar los datos de la empresa" };
            }
        }

        // Validaciones de unicidad
        if (!isEmpresaExistente) {
            // Si se va a crear empresa nueva, validar que no exista ese RUT
            const companyExists = await db.company.findFirst({ where: { rut: data.companyRut } });
            if (companyExists) {
                console.log("[preRegisterAction] Empresa ya existe");
                return { error: "El RUT de la empresa ya está registrado" };
            }
        }
        // Validar usuario único (siempre)
        const userExists = await db.user.findFirst({ where: { OR: [{ email: data.userEmail }, { run: data.userRun }] } });
        if (userExists) {
            console.log("[preRegisterAction] Usuario ya existe");
            return { error: "El email o RUN del usuario ya está registrado" };
        }
        // Validar contrato único (siempre)
        const contractExists = await db.contract.findFirst({ where: { contractNumber: data.contractNumber } });
        if (contractExists) {
            console.log("[preRegisterAction] Contrato ya existe");
            return { error: "El número de contrato ya existe" };
        }

        // 2. Lógica principal según si es empresa existente o nueva
        if (isEmpresaExistente) {
            // --- FLUJO: Asociar a empresa existente ---
            if (!data.companyId) {
                return { error: "Debe seleccionar una empresa válida" };
            }
            const company = await db.company.findUnique({ where: { id: data.companyId } });
            if (!company) {
                return { error: "La empresa seleccionada no existe" };
            }
            // Crear usuario inactivo asociado a la empresa existente
            const newUser = await db.user.create({
                data: {
                    email: data.userEmail,
                    run: data.userRun,
                    name: data.userName,
                    lastName: data.userLastName,
                    middleName: data.userMiddleName,
                    secondLastName: data.userSecondLastName,
                    displayName: data.displayName && data.displayName.trim() !== '' ? data.displayName : `${data.userName} ${data.userLastName}`.trim(),
                    userName: `${data.userName.charAt(0).toLowerCase()}${data.userLastName.toLowerCase()}`,
                    phoneNumber: data.userPhoneNumber,
                    category: 'default',
                    isActive: false,
                    companyId: data.companyId,
                    roles: {
                        create: [{
                            role: {
                                connect: { name: RoleEnum.user }
                            }
                        }]
                    }
                }
            });
            // Crear contrato asociado a la empresa existente y admin contractor seleccionado
            const newContract = await db.contract.create({
                data: {
                    contractNumber: data.contractNumber,
                    contractName: data.contractName,
                    initialDate: data.initialDate,
                    finalDate: data.finalDate,
                    companyId: data.companyId,
                    useracId: data.adminContractorId,
                }
            });
            return {
                success: true,
                message: "Solicitud de pre-registro enviada correctamente. Un administrador la revisará.",
                data: { company, newUser, newContract }
            };
        } else {
            // --- FLUJO: Crear nueva empresa ---
            if (!data.companyRut || !data.companyName) {
                return { error: "Debe completar los datos de la empresa" };
            }
            const result = await db.$transaction(async (prisma) => {
                // Crear Empresa pendiente de aprobación
                const newCompany = await prisma.company.create({
                    data: {
                        name: data.companyName,
                        rut: data.companyRut || '',
                        phone: data.companyPhone || '',
                        city: data.companyCity,
                        url: data.companyUrl,
                        status: false, // <-- Marcada como pendiente
                    }
                });
                // Crear Usuario (rol user) inactivo
                const newUser = await prisma.user.create({
                    data: {
                        email: data.userEmail,
                        run: data.userRun,
                        name: data.userName,
                        lastName: data.userLastName,
                        middleName: data.userMiddleName,
                        secondLastName: data.userSecondLastName,
                        displayName: data.displayName && data.displayName.trim() !== '' ? data.displayName : `${data.userName} ${data.userLastName}`.trim(),
                        userName: `${data.userName.charAt(0).toLowerCase()}${data.userLastName.toLowerCase()}`,
                        phoneNumber: data.userPhoneNumber,
                        category: 'default',
                        isActive: false, // <-- Inactivo hasta aprobación
                        companyId: newCompany.id,
                        roles: {
                            create: [{
                                role: {
                                    connect: { name: RoleEnum.user }
                                }
                            }]
                        }
                    }
                });
                // Crear Contrato con el adminContractorId seleccionado
                const newContract = await prisma.contract.create({
                    data: {
                        contractNumber: data.contractNumber,
                        contractName: data.contractName,
                        initialDate: data.initialDate,
                        finalDate: data.finalDate,
                        companyId: newCompany.id,
                        useracId: data.adminContractorId,
                    }
                });
                return { newCompany, newUser, newContract };
            });
            return {
                success: true,
                message: "Solicitud de pre-registro enviada correctamente. Un administrador la revisará.",
                data: result
            };
        }
    } catch (error) {
        console.error("Error en preRegisterAction:", error);
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2002') {
                 const target = (error.meta?.target as string[]) || [];
                 if (target.includes('rut')) return { error: 'El RUT de la empresa ya existe.' };
                 if (target.includes('email') || target.includes('run')) return { error: 'El email o RUN del usuario ya existe.' };
                 if (target.includes('contractNumber')) return { error: 'El número de contrato ya existe.' };
            }
        }
        return {
            error: "Error interno del servidor al procesar la solicitud.",
            details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
        };
    }
};
