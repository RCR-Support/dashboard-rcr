import { z } from 'zod';
import { baseUserSchema } from '@/lib/zod';
import { companySchema } from '@/lib/validation-company';

export const preRegisterInputSchema = z.object({
  isSubcontract: z.boolean().optional(),
  companyId: z.string().optional(),
  companyName: companySchema.shape.name.optional().or(z.literal('')),
  companyRut: companySchema.shape.rut.optional().or(z.literal('')),
  companyPhone: companySchema.shape.phone.optional().or(z.literal('')),
  companyCity: companySchema.shape.city.optional().or(z.literal('')),
  companyUrl: companySchema.shape.url.optional().or(z.literal('')),
  userName: baseUserSchema.shape.name,
  userLastName: baseUserSchema.shape.lastName,
  userMiddleName: baseUserSchema.shape.middleName,
  userSecondLastName: baseUserSchema.shape.secondLastName,
  userEmail: baseUserSchema.shape.email,
  userRun: baseUserSchema.shape.run,
  userPhoneNumber: z.string().min(9, 'El teléfono es requerido'),
  displayName: z.string().optional(),
  contractNumber: z.string().optional().or(z.literal('')),
  contractName: z.string().optional().or(z.literal('')),
  initialDate: z.coerce.date().optional(),
  finalDate: z.coerce.date().optional(),
  adminContractorId: z.string().optional().or(z.literal('')),
});

export function validatePreRegisterConditions(
  data: z.infer<typeof preRegisterInputSchema>,
  ctx: z.RefinementCtx
) {
  if (!data.companyId) {
    if (!data.companyName || data.companyName.trim().length < 3) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['companyName'],
        message: 'El nombre de la empresa es requerido',
      });
    }
    if (!data.companyRut || data.companyRut.trim().length < 8) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['companyRut'],
        message: 'El RUT de la empresa debe tener al menos 8 caracteres',
      });
    }
  }

  if (!data.isSubcontract) {
    if (!data.contractNumber || data.contractNumber.trim().length < 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['contractNumber'],
        message: 'El número de contrato es requerido',
      });
    }
    if (!data.contractName || data.contractName.trim().length < 3) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['contractName'],
        message: 'El nombre del contrato es requerido',
      });
    }
    if (!data.initialDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['initialDate'],
        message: 'La fecha de inicio es requerida',
      });
    }
    if (!data.finalDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['finalDate'],
        message: 'La fecha de término es requerida',
      });
    }
    if (!data.adminContractorId || data.adminContractorId.trim().length < 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['adminContractorId'],
        message: 'Debe seleccionar un administrador de contrato',
      });
    }
    if (data.initialDate && data.finalDate && data.finalDate <= data.initialDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['finalDate'],
        message: 'La fecha de término debe ser posterior a la fecha de inicio',
      });
    }
  }
}

export const preRegisterSchema = preRegisterInputSchema.superRefine(
  validatePreRegisterConditions
);