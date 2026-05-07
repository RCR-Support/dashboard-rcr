import { z } from 'zod';
import { validateRun } from './validations';

export const companySchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  phone: z
    .string()
    .regex(/^\d{9}$/, 'El número debe tener exactamente 9 dígitos'),
  rut: z
    .string()
    .min(9, 'El RUT debe tener al menos 9 caracteres')
    .max(10, 'El RUT debe tener máximo 10 caracteres')
    .regex(
      /^[0-9]{1,2}\.?[0-9]{3}\.?[0-9]{3}[-]?[0-9kK]{1}$/,
      'Formato de RUT inválido'
    )
    .refine(val => validateRun(val), {
      message: 'RUT inválido',
    }),
  status: z.boolean().default(true),
  url: z
    .string()
    .optional()
    .or(z.literal(''))
    .refine(
      val => {
        if (!val || !val.trim()) return true;
        const candidate = /^https?:\/\//i.test(val.trim())
          ? val.trim()
          : `https://${val.trim()}`;
        try {
          const parsed = new URL(candidate);
          return Boolean(parsed.hostname);
        } catch {
          return false;
        }
      },
      { message: 'URL inválida' }
    ),
  city: z
    .string()
    .min(2, 'La ciudad debe tener al menos 2 caracteres')
    .optional(),
  logoUrl: z.string().url('URL de logo inválida').optional().or(z.literal('')),
});
