import { describe, expect, it } from 'vitest';
import { getApplicationApprovalError } from '../lib/applications/document-review';

describe('getApplicationApprovalError', () => {
  it('permite aprobar cuando todos los documentos están aprobados', () => {
    expect(getApplicationApprovalError([
      { approvalStatus: 'approved' },
      { approvalStatus: 'approved' },
    ])).toBeNull();
  });

  it('bloquea la aprobación cuando existen documentos pendientes', () => {
    expect(getApplicationApprovalError([
      { approvalStatus: 'approved' },
      { approvalStatus: 'pending' },
      { approvalStatus: null },
    ])).toContain('2 documento(s) sin revisar');
  });

  it('bloquea la aprobación cuando existe un documento rechazado', () => {
    expect(getApplicationApprovalError([
      { approvalStatus: 'approved' },
      { approvalStatus: 'rejected' },
    ])).toContain('1 documento(s) rechazado(s)');
  });
});