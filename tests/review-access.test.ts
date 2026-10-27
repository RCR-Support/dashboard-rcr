import { describe, expect, it } from 'vitest';
import { RoleEnum, StateAc, StateSheq } from '@prisma/client';
import { getReviewAccessError } from '../lib/applications/review-access';

const acPendingApplication: {
  stateAc: StateAc;
  stateSheq: StateSheq;
  userAcId: string;
  userSheqId: string | null;
} = {
  stateAc: StateAc.pendiente,
  stateSheq: StateSheq.pendiente,
  userAcId: 'ac-1',
  userSheqId: null,
};

const sheqPendingApplication: {
  stateAc: StateAc;
  stateSheq: StateSheq;
  userAcId: string;
  userSheqId: string | null;
} = {
  stateAc: StateAc.aprobado,
  stateSheq: StateSheq.pendiente,
  userAcId: 'ac-1',
  userSheqId: 'sheq-1',
};

describe('getReviewAccessError', () => {
  it('permite al AC asignado revisar su etapa pendiente', () => {
    expect(getReviewAccessError({
      application: acPendingApplication,
      roles: [RoleEnum.adminContractor],
      userId: 'ac-1',
      stage: 'ac',
    })).toBeNull();
  });

  it('rechaza a un AC no asignado', () => {
    expect(getReviewAccessError({
      application: acPendingApplication,
      roles: [RoleEnum.adminContractor],
      userId: 'ac-2',
      stage: 'ac',
    })).toBe('No tienes asignada esta solicitud');
  });

  it('mantiene la asignación estricta del AC aunque pertenezca a otro equipo', () => {
    expect(getReviewAccessError({
      application: acPendingApplication,
      roles: [RoleEnum.adminContractor],
      userId: 'ac-otro',
      stage: 'ac',
    })).toBe('No tienes asignada esta solicitud');
  });

  it('permite al SHEQ asignado solo después de la aprobación AC', () => {
    expect(getReviewAccessError({
      application: sheqPendingApplication,
      roles: [RoleEnum.sheq],
      userId: 'sheq-1',
      stage: 'sheq',
    })).toBeNull();
  });

  it('permite a otro SHEQ revisar una solicitud pendiente asignada a un colega', () => {
    expect(getReviewAccessError({
      application: sheqPendingApplication,
      roles: [RoleEnum.sheq],
      userId: 'sheq-2',
      stage: 'sheq',
    })).toBeNull();
  });

  it('no permite a un usuario sin rol SHEQ revisar una solicitud de otro revisor', () => {
    expect(getReviewAccessError({
      application: sheqPendingApplication,
      roles: [RoleEnum.user],
      userId: 'user-1',
      stage: 'sheq',
    })).toBe('Solo un revisor SHEQ puede revisar esta etapa');
  });

  it('rechaza el cruce de roles y etapas', () => {
    expect(getReviewAccessError({
      application: sheqPendingApplication,
      roles: [RoleEnum.adminContractor],
      userId: 'ac-1',
      stage: 'sheq',
    })).toBe('Solo un revisor SHEQ puede revisar esta etapa');
  });

  it('rechaza una revisión AC cuando esa etapa ya fue resuelta', () => {
    expect(getReviewAccessError({
      application: sheqPendingApplication,
      roles: [RoleEnum.adminContractor],
      userId: 'ac-1',
      stage: 'ac',
    })).toBe('La solicitud no está pendiente de revisión AC');
  });

  it('rechaza una revisión SHEQ antes de la aprobación AC', () => {
    expect(getReviewAccessError({
      application: acPendingApplication,
      roles: [RoleEnum.sheq],
      userId: 'sheq-1',
      stage: 'sheq',
    })).toBe('La solicitud no está pendiente de revisión SHEQ');
  });

  it('no permite al administrador ignorar una transición inválida', () => {
    expect(getReviewAccessError({
      application: {
        ...sheqPendingApplication,
        stateSheq: 'aprobado',
      },
      roles: [RoleEnum.admin],
      userId: 'admin-1',
      stage: 'sheq',
    })).toBe('La solicitud no está pendiente de revisión SHEQ');
  });

  it('permite al administrador revisar cualquier solicitud en una etapa válida', () => {
    expect(getReviewAccessError({
      application: sheqPendingApplication,
      roles: [RoleEnum.admin],
      userId: 'admin-1',
      stage: 'sheq',
    })).toBeNull();
  });
});