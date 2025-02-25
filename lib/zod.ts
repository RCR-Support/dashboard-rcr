import { z } from 'zod';

export const loginSchema = z.object({
    email: z.string({ required_error: "El correo es requerido" })
        .min(1, "El correo es requerido")
        .email("Correo electrónico inválido"),
    password: z.string({ required_error: "La contraseña es requerida" })
        .min(6, "La contraseña debe tener más de 6 caracteres")
        .max(32, "La contraseña debe tener menos de 32 caracteres"),
});

export const registerSchema = z.object({
    name: z.string({ required_error: "El nombre es requerido" })
        .min(1, "El nombre es requerido")
        .max(32, "El nombre debe tener menos de 32 caracteres"),
    lastName: z.string({ required_error: "El apellido es requerido" })
        .min(1, "El apellido es requerido")
        .max(32, "El apellido debe tener menos de 32 caracteres"),
    middleName: z.string()
        .min(1, "El segundo nombre debe tener al menos un carácter")
        .max(32, "El segundo nombre debe tener menos de 32 caracteres")
        .optional(),
    secondLastName: z.string()
        .min(1, "El segundo apellido debe tener al menos un carácter")
        .max(32, "El segundo apellido debe tener menos de 32 caracteres")
        .optional(),
    userName: z.string({ required_error: "El nombre de usuario es requerido" })
        .min(1, "El nombre de usuario es requerido")
        .max(32, "El nombre de usuario debe tener menos de 32 caracteres"),
    email: z.string({ required_error: "El correo es requerido" })
        .min(1, "El correo es requerido")
        .email("Correo electrónico inválido"),
    password: z.string({ required_error: "La contraseña es requerida" })
        .min(6, "La contraseña debe tener más de 6 caracteres")
        .max(32, "La contraseña debe tener menos de 32 caracteres"),
    role: z.enum(["admin", "sheq", "adminContractor", "user", "credential"]).optional(),
});
