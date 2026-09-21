import { describe, expect, it } from 'vitest';
import { preRegisterSchema } from '@/lib/validation-pre-registration';

const validInput = {
  companyId: 'company-1',
  userEmail: 'juan.perez@example.com',
  userRun: '12.345.678-5',
  userName: 'Juan',
  userLastName: 'Perez',
  userMiddleName: '',
  userSecondLastName: '',
  userPhoneNumber: '+56987654321',
  displayName: 'Juan Perez',
  isSubcontract: false,
  contractNumber: 'C-2026-001',
  contractName: 'Servicios Generales',
  initialDate: '2026-01-01',
  finalDate: '2026-12-31',
  adminContractorId: 'admin-1',
};

describe('preRegisterSchema', () => {
  it('accepts a valid registration for an existing company', () => {
    expect(preRegisterSchema.safeParse(validInput).success).toBe(true);
  });

  it('rejects an end date before the contract start date', () => {
    const result = preRegisterSchema.safeParse({
      ...validInput,
      initialDate: '2026-12-31',
      finalDate: '2026-01-01',
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues).toContainEqual(
        expect.objectContaining({
          path: ['finalDate'],
          message: 'La fecha de término debe ser posterior a la fecha de inicio',
        })
      );
    }
  });

  it('requires company details when no existing company is selected', () => {
    const result = preRegisterSchema.safeParse({
      ...validInput,
      companyId: '',
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.map(issue => issue.path)).toEqual(
        expect.arrayContaining([['companyName'], ['companyRut']])
      );
    }
  });
});