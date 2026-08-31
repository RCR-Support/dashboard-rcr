import { describe, expect, it } from 'vitest';
import { buildWelcomeEmailHtml } from '@/lib/email/account-email-templates';

describe('buildWelcomeEmailHtml', () => {
  it('escapes account data and retains the password setup link', () => {
    const html = buildWelcomeEmailHtml({
      displayName: '<script>alert(1)</script>',
      passwordSetupUrl: 'https://rcr.example/set-password?token=secure-token',
      toEmail: 'user@example.com',
      userName: '<admin>',
    });

    expect(html).toContain('&lt;script&gt;alert(1)&lt;/script&gt;');
    expect(html).toContain('&lt;admin&gt;');
    expect(html).not.toContain('<script>alert(1)</script>');
    expect(html).toContain('href="https://rcr.example/set-password?token=secure-token"');
  });
});