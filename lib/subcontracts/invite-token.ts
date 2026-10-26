import { createHash, randomBytes } from 'crypto';

const SUBCONTRACT_INVITE_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export function hashSubcontractInviteToken(token: string) {
  return createHash('sha256').update(token).digest('hex');
}

export function createSubcontractInviteToken() {
  const token = randomBytes(32).toString('hex');

  return {
    token,
    tokenHash: hashSubcontractInviteToken(token),
    expiresAt: new Date(Date.now() + SUBCONTRACT_INVITE_TTL_MS),
  };
}