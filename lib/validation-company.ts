import { z } from "zod";
import { validateRun } from "./validations";

export const companySchema = z.object({
    name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
    phone: z.string().regex(/^\d{8}$/, "El número debe tener exactamente 8 dígitos"),
    rut: z.string()
        .min(9, "El RUT debe tener al menos 9 caracteres")
        .max(10, "El RUT debe tener máximo 10 caracteres")
        .regex(/^[0-9]{1,2}\.?[0-9]{3}\.?[0-9]{3}[-]?[0-9kK]{1}$/, "Formato de RUT inválido")
        .refine((val) => validateRun(val), {
            message: "RUT inválido"
        }),
    status: z.boolean().default(true),
    url: z.string().url("URL inválida").optional(),
    city: z.string().min(2, "La ciudad debe tener al menos 2 caracteres").optional(),
});
