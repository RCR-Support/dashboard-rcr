import { RoleEnum } from '@prisma/client';

export type ReviewStage = 'ac' | 'sheq';

interface ReviewableApplication {
  stateAc: string;
  stateSheq: string;
  userAcId: string | null;
  userSheqId: string | null;
}

interface ReviewAccessInput {
  application: ReviewableApplication;
  roles: RoleEnum[];
  userId: string;
  stage: ReviewStage;
}

export function getReviewAccessError({ application, roles, userId, stage }: ReviewAccessInput) {
  const isAdmin = roles.includes(RoleEnum.admin);
  const requiredRole = stage === 'ac' ? RoleEnum.adminContractor : RoleEnum.sheq;
  const stageLabel = stage === 'ac' ? 'AC' : 'SHEQ';

  if (!isAdmin && !roles.includes(requiredRole)) {
    return `Solo un revisor ${stageLabel} puede revisar esta etapa`;
  }

  const stageIsPending = stage === 'ac'
    ? application.stateAc === 'pendiente'
    : application.stateAc === 'aprobado' && application.stateSheq === 'pendiente';

  if (!stageIsPending) {
    return `La solicitud no está pendiente de revisión ${stageLabel}`;
  }

  const assignedUserId = stage === 'ac' ? application.userAcId : application.userSheqId;
  if (!isAdmin && assignedUserId !== userId) {
    return 'No tienes asignada esta solicitud';
  }

  return null;
}