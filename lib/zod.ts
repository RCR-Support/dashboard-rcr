import { run } from 'node:test';
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
        .regex(/^([a-zA-Z]+)$/, "El nombre debe ser un solo nombre")
        .min(2, "El nombre debe tener al menos 2 caracteres")
        .max(32, "El nombre debe tener menos de 32 caracteres"),
    lastName: z.string({ required_error: "El apellido es requerido" })
        .min(2, "El apellido debe tener al menos 2 caracteres")
        .max(32, "El apellido debe tener menos de 32 caracteres"),
    middleName: z.string()
        .max(32, "El segundo nombre debe tener menos de 32 caracteres")
        .refine((value) => value === "" || value.length >= 2, "El segundo nombre debe tener al menos 2 caracteres")
        .optional(),
    secondLastName: z.string()
        .max(32, "El segundo apellido debe tener menos de 32 caracteres")
        .refine((value) => value === "" || value.length >= 2, "El segundo apellido debe tener al menos 2 caracteres")
        .optional(),
    userName: z.string({ required_error: "El nombre de usuario es requerido" })
        .max(32, "El nombre de usuario debe tener menos de 32 caracteres"),
    email: z.string({ required_error: "El correo es requerido" })
        .min(6, "El correo es requerido")
        .email("Correo electrónico inválido"),
    password: z.string({ required_error: "La contraseña es requerida" })
        .min(6, "La contraseña debe tener más de 6 caracteres")
        .max(16, "La contraseña debe tener menos de 16 caracteres"),
    role: z.enum(["admin", "sheq", "adminContractor", "user", "credential"]).optional(),
    image: z.string().optional(),
    run: z.string({ required_error: "El run es requerido" })
        .min(8, "El run debe tener al menos 8 caracteres")
        .max(9, "El run debe tener menos de 9 caracteres"),
    phoneNumber: z.string({ required_error: "El telefono es requerido" })
        .min(9, "El telefono debe tener al menos 9 caracteres")
        .max(15, "El telefono debe tener menos de 15 caracteres"),
    category: z.string({ required_error: "La categoria es requerida" })
        .min(2, "La categoria debe tener al menos 2 caracteres")
        .max(32, "La categoria debe tener menos de 32 caracteres"),
});
