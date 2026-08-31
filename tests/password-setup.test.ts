import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  delete: vi.fn(),
  findUnique: vi.fn(),
  hash: vi.fn(),
  transaction: vi.fn(),
  update: vi.fn(),
}));

vi.mock('@/lib/db', () => ({
  db: {
    $transaction: mocks.transaction,
    user: { update: mocks.update },
    verificationToken: {
      delete: mocks.delete,
      findUnique: mocks.findUnique,
    },
  },
}));

vi.mock('bcryptjs', () => ({ default: { hash: mocks.hash } }));

import { createHash } from 'crypto';
import { setPasswordWithSetupToken } from '@/lib/security/password-setup';

const email = 'user@example.com';
const token = 'secure-token';
const password = 'SecurePass!1';
const tokenHash = createHash('sha256').update(token).digest('hex');

describe('setPasswordWithSetupToken', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.hash.mockResolvedValue('bcrypt-hash');
    mocks.update.mockResolvedValue({ id: 'user-1' });
    mocks.delete.mockResolvedValue({ identifier: email });
    mocks.transaction.mockImplementation(async operations => Promise.all(operations));
  });

  it('rejects an expired token without changing the password', async () => {
    mocks.findUnique.mockResolvedValue({
      token: tokenHash,
      expires: new Date(Date.now() - 1),
    });

    await expect(setPasswordWithSetupToken(email, token, password)).resolves.toEqual({
      success: false,
      error: 'El enlace es inválido o ya venció',
    });

    expect(mocks.hash).not.toHaveBeenCalled();
    expect(mocks.update).not.toHaveBeenCalled();
    expect(mocks.transaction).not.toHaveBeenCalled();
  });

  it('consumes a valid token so it cannot be used twice', async () => {
    let storedToken: { token: string; expires: Date } | null = {
      token: tokenHash,
      expires: new Date(Date.now() + 60_000),
    };
    mocks.findUnique.mockImplementation(async () => storedToken);
    mocks.delete.mockImplementation(async () => {
      storedToken = null;
      return { identifier: email };
    });

    await expect(setPasswordWithSetupToken(email, token, password)).resolves.toEqual({
      success: true,
    });
    await expect(setPasswordWithSetupToken(email, token, password)).resolves.toEqual({
      success: false,
      error: 'El enlace es inválido o ya venció',
    });

    expect(mocks.update).toHaveBeenCalledTimes(1);
    expect(mocks.delete).toHaveBeenCalledWith({ where: { identifier: email } });
  });
});