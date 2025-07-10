import { z } from 'zod';
import { formatRun, validateRun } from './validations';

export const loginSchema = z.object({
    email: z.string({ required_error: "El correo es requerido" })
        .min(1, "El correo es requerido")
        .email("Correo electrónico inválido"),
    password: z.string({ required_error: "La contraseña es requerida" })
        .min(6, "La contraseña debe tener más de 6 caracteres")
        .max(32, "La contraseña debe tener menos de 32 caracteres"),
});

export const baseUserSchema = z.object({
    name: z.string({ required_error: "El nombre es requerido" })
        .regex(/^([a-zA-ZáéíóúÁÉÍÓÚñÑüÜ]+)$/, "El nombre debe ser un solo nombre")
        .min(2, "El nombre debe tener al menos 2 caracteres")
        .max(32, "El nombre debe tener menos de 32 caracteres"),
    lastName: z.string({ required_error: "El apellido es requerido" })
        .regex(/^([a-zA-ZáéíóúÁÉÍÓÚñÑüÜ]+)$/, "El apellido debe ser un solo apellido")
        .min(2, "El apellido debe tener al menos 2 caracteres")
        .max(32, "El apellido debe tener menos de 32 caracteres"),
    middleName: z.string()
        .max(32, "El segundo nombre debe tener menos de 32 caracteres")
        .regex(/^([a-zA-ZáéíóúÁÉÍÓÚñÑüÜ]*)$/, "El segundo nombre solo puede contener letras" )
        .refine((value) => value === "" || value.length >= 2, "El segundo nombre debe tener al menos 2 caracteres")
        .optional(),
    secondLastName: z.string()
        .max(32, "El segundo apellido debe tener menos de 32 caracteres")
        .regex(/^([a-zA-ZáéíóúÁÉÍÓÚñÑüÜ]*)$/, "El segundo apellido solo puede contener letras" )
        .refine((value) => value === "" || value.length >= 2, "El segundo apellido debe tener al menos 2 caracteres")
        .optional(),
    userName: z.string({ required_error: "El nombre de usuario es requerido" })
        .max(32, "El nombre de usuario debe tener menos de 32 caracteres"),
    email: z.string({ required_error: "El correo es requerido" })
        .min(6, "El correo es requerido")
        .email("Correo electrónico inválido"),

    image: z.any().optional(), // Usamos z.any() para aceptar cualquier tipo
    run: z.string({ required_error: "El run es requerido" })
    .min(1, "El run es requerido")
    .transform(value => value.replace(/[.-]/g, '')) // Limpiamos puntos y guiones
    .refine(value => {
        // Validamos largo después de limpiar
        const length = value.length;
        return length >= 8 && length <= 9;
    }, {
        message: "El RUN debe tener entre 8 y 9 dígitos"
    })
    .refine(value => /^\d+[kK0-9]$/.test(value), {
        message: "Formato de RUN inválido"
    })
    .refine(validateRun, {
        message: "RUN inválido"
    }),
       // .transform(formatRun), // Formatea el RUN automáticamente

    phoneNumber: z.string({ required_error: "El teléfono es requerido" })
    .regex(/^\d{9}$/, "El número debe tener exactamente 9 dígitos"),
    // .transform(value => `+569${value}`),

    companyId: z.string().min(1, "La empresa en la que trabajas es requerida").optional(),
        // .transform(val => val.split(",")),
    category: z.string({ required_error: "La categoria es requerida" })
        .min(2, "La categoria debe tener al menos 2 caracteres")
        .max(32, "La categoria debe tener menos de 32 caracteres"),

    roles: z.array(z.string())
        .min(1, "Debe seleccionar al menos un rol"),

    adminContractorId: z.string().optional(),
});


// Esquema para registro (password obligatorio)
export const registerSchema = baseUserSchema.extend({
    password: z.string()
        .min(6, "La contraseña debe tener más de 6 caracteres")
        .max(32, "La contraseña debe tener menos de 32 caracteres"),
});

// Schema para edición (password opcional)
export const editSchema = baseUserSchema.extend({
    password: z.string()
        .max(32, "La contraseña debe tener menos de 32 caracteres")
        .refine((value) => value === "" || value.length >= 6, "La contraseña debe tener más de 6 caracteres")
        .optional(),
});

export type FormValues = z.infer<typeof registerSchema> | z.infer<typeof editSchema>;
