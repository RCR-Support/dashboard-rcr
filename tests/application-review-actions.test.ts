import { RoleEnum } from '@prisma/client';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  auth: vi.fn(),
  findUnique: vi.fn(),
  applicationUpdate: vi.fn(),
  documentationUpdateMany: vi.fn(),
  auditCreate: vi.fn(),
  revalidatePath: vi.fn(),
  sendApplicationApprovedByACEmail: vi.fn(),
  sendApplicationApprovedBySHEQEmail: vi.fn(),
  notifyCredentialOnApproval: vi.fn(),
  notifyUserOnApproval: vi.fn(),
  notifySheqOnAcApproval: vi.fn(),
}));

vi.mock('@/auth', () => ({ auth: mocks.auth }));
vi.mock('next/cache', () => ({ revalidatePath: mocks.revalidatePath }));
vi.mock('@/lib/email/postmark', () => ({
  sendApplicationApprovedByACEmail: mocks.sendApplicationApprovedByACEmail,
  sendApplicationApprovedBySHEQEmail: mocks.sendApplicationApprovedBySHEQEmail,
  sendApplicationRejectedByACEmail: vi.fn(),
  sendApplicationRejectedBySHEQEmail: vi.fn(),
}));
vi.mock('@/actions/notifications/create-notification', () => ({
  notifyCredentialOnApproval: mocks.notifyCredentialOnApproval,
  notifyUserOnApproval: mocks.notifyUserOnApproval,
  notifyUserOnRejection: vi.fn(),
  notifySheqOnAcApproval: mocks.notifySheqOnAcApproval,
}));
vi.mock('@/lib/db', () => ({
  db: {
    application: { findUnique: mocks.findUnique },
    $transaction: async (callback: (transaction: unknown) => Promise<void>) => callback({
      application: { update: mocks.applicationUpdate },
      documentationFile: { updateMany: mocks.documentationUpdateMany },
      applicationAudit: { create: mocks.auditCreate },
    }),
  },
}));

import { approveApplicationAC } from '../actions/applications/approve-reject-ac';
import { approveApplicationSHEQ, rejectApplicationSHEQ } from '../actions/applications/approve-reject-sheq';

const approvedDocuments = [{ approvalStatus: 'approved' }, { approvalStatus: 'approved' }];

describe('application review actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.applicationUpdate.mockResolvedValue({ id: 'application-1' });
    mocks.documentationUpdateMany.mockResolvedValue({ count: 2 });
    mocks.auditCreate.mockResolvedValue({ id: 'audit-1' });
    mocks.sendApplicationApprovedByACEmail.mockResolvedValue(undefined);
    mocks.sendApplicationApprovedBySHEQEmail.mockResolvedValue(undefined);
    mocks.notifyCredentialOnApproval.mockResolvedValue({ ok: true });
    mocks.notifyUserOnApproval.mockResolvedValue({ ok: true });
    mocks.notifySheqOnAcApproval.mockResolvedValue({ ok: true });
  });

  it('AC asignado aprueba, asigna SHEQ y reinicia documentos para la siguiente etapa', async () => {
    mocks.auth.mockResolvedValue({ user: { id: 'ac-1', email: 'ac@example.com', roles: [RoleEnum.adminContractor] } });
    mocks.findUnique.mockResolvedValue({
      stateAc: 'pendiente',
      stateSheq: 'pendiente',
      userAcId: 'ac-1',
      userSheqId: null,
      contract: { useracId: 'ac-1' },
      documentationFiles: approvedDocuments,
    });

    await expect(approveApplicationAC('application-1', 'ignored', 'sheq-1')).resolves.toMatchObject({ success: true });

    expect(mocks.applicationUpdate).toHaveBeenCalledWith({
      where: { id: 'application-1' },
      data: { stateAc: 'aprobado', userSheqId: 'sheq-1' },
    });
    expect(mocks.documentationUpdateMany).toHaveBeenCalledWith({
      where: { applicationId: 'application-1', documentationId: { not: null } },
      data: expect.objectContaining({ approvalStatus: 'pending', reviewedBy: null }),
    });
    expect(mocks.notifySheqOnAcApproval).toHaveBeenCalledWith('application-1', 'sheq-1');
  });

  it('bloquea la aprobación AC cuando quedan documentos pendientes', async () => {
    mocks.auth.mockResolvedValue({ user: { id: 'ac-1', roles: [RoleEnum.adminContractor] } });
    mocks.findUnique.mockResolvedValue({
      stateAc: 'pendiente',
      stateSheq: 'pendiente',
      userAcId: 'ac-1',
      userSheqId: null,
      contract: null,
      documentationFiles: [{ approvalStatus: 'pending' }],
    });

    await expect(approveApplicationAC('application-1', 'ignored', 'sheq-1')).resolves.toMatchObject({
      success: false,
      message: expect.stringContaining('sin revisar'),
    });
    expect(mocks.applicationUpdate).not.toHaveBeenCalled();
  });

  it('SHEQ asignado completa la aprobación y notifica a credenciales', async () => {
    mocks.auth.mockResolvedValue({ user: { id: 'sheq-1', email: 'sheq@example.com', roles: [RoleEnum.sheq] } });
    mocks.findUnique.mockResolvedValue({
      stateAc: 'aprobado',
      stateSheq: 'pendiente',
      userAcId: 'ac-1',
      userSheqId: 'sheq-1',
      documentationFiles: approvedDocuments,
    });

    await expect(approveApplicationSHEQ('application-1')).resolves.toMatchObject({ success: true });

    expect(mocks.applicationUpdate).toHaveBeenCalledWith({
      where: { id: 'application-1' },
      data: { stateSheq: 'aprobado', processStatus: 'aprobado' },
    });
    expect(mocks.notifyCredentialOnApproval).toHaveBeenCalledWith('application-1');
  });

  it('bloquea el rechazo SHEQ para un revisor no asignado', async () => {
    mocks.auth.mockResolvedValue({ user: { id: 'sheq-2', roles: [RoleEnum.sheq] } });
    mocks.findUnique.mockResolvedValue({
      stateAc: 'aprobado',
      stateSheq: 'pendiente',
      userAcId: 'ac-1',
      userSheqId: 'sheq-1',
    });

    await expect(rejectApplicationSHEQ('application-1', 'ignored', 'Documento ilegible')).resolves.toEqual({
      success: false,
      message: 'No tienes asignada esta solicitud',
    });
    expect(mocks.applicationUpdate).not.toHaveBeenCalled();
  });
});