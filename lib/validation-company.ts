import { z } from 'zod';
import { validateRun } from './validations';

export const companySchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  phone: z
    .string()
    .regex(
      /^(\d{9}|[68]00\d{7})$/,
      'Ingresa 9 dígitos (teléfono) o un número 600/800 de 10 dígitos'
    ),
  rut: z.preprocess(
    (val) => (typeof val === 'string' ? val.replace(/\./g, '') : val),
    z
      .string()
      .min(8, 'El RUT debe tener al menos 8 caracteres')
      .max(11, 'El RUT inválido')
      .regex(
        /^[0-9]{7,9}[-]?[0-9kK]$/,
        'Formato de RUT inválido'
      )
      .refine(val => validateRun(val), {
        message: 'RUT inválido',
      })
  ),
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
