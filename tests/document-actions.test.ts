import { RoleEnum } from '@prisma/client';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  auth: vi.fn(),
  findUnique: vi.fn(),
  update: vi.fn(),
}));

vi.mock('@/auth', () => ({ auth: mocks.auth }));
vi.mock('@/lib/db', () => ({
  db: {
    documentationFile: {
      findUnique: mocks.findUnique,
      update: mocks.update,
    },
  },
}));

import { approveDocument } from '../actions/applications/approve-document';
import { rejectDocument } from '../actions/applications/reject-document';

const assignedAcDocument = {
  approvalStatus: 'pending',
  application: {
    stateAc: 'pendiente',
    stateSheq: 'pendiente',
    userAcId: 'ac-1',
    userSheqId: null,
  },
};

describe('document review actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.auth.mockResolvedValue({
      user: {
        id: 'ac-1',
        roles: [RoleEnum.adminContractor],
      },
    });
    mocks.findUnique.mockResolvedValue(assignedAcDocument);
    mocks.update.mockResolvedValue({ id: 'document-1' });
  });

  it('aprueba un documento pendiente para el AC asignado', async () => {
    await expect(approveDocument('document-1')).resolves.toEqual({ success: true });

    expect(mocks.update).toHaveBeenCalledWith({
      where: { id: 'document-1' },
      data: expect.objectContaining({
        approvalStatus: 'approved',
        reviewedBy: 'ac-1',
        rejectionReason: null,
      }),
    });
  });

  it('bloquea la aprobación para un revisor no asignado', async () => {
    mocks.auth.mockResolvedValue({
      user: {
        id: 'ac-2',
        roles: [RoleEnum.adminContractor],
      },
    });

    await expect(approveDocument('document-1')).resolves.toEqual({
      success: false,
      error: 'No tienes asignado este documento para revisión.',
    });
    expect(mocks.update).not.toHaveBeenCalled();
  });

  it('bloquea documentos que ya fueron revisados', async () => {
    mocks.findUnique.mockResolvedValue({
      ...assignedAcDocument,
      approvalStatus: 'approved',
    });

    await expect(rejectDocument('document-1', 'Documento ilegible')).resolves.toEqual({
      success: false,
      error: 'El documento ya fue revisado.',
    });
    expect(mocks.update).not.toHaveBeenCalled();
  });

  it('exige un motivo antes de consultar o rechazar un documento', async () => {
    await expect(rejectDocument('document-1', '   ')).resolves.toEqual({
      success: false,
      error: 'Debe proporcionar una razón para el rechazo',
    });
    expect(mocks.findUnique).not.toHaveBeenCalled();
    expect(mocks.update).not.toHaveBeenCalled();
  });
});