import { ServerClient } from 'postmark';

const postmarkApiToken = process.env.POSTMARK_API_TOKEN;
const emailFrom = process.env.EMAIL_FROM || 'no-reply@example.com';
const appUrl = process.env.APP_URL || '';

const client = postmarkApiToken ? new ServerClient(postmarkApiToken) : null;

if (!postmarkApiToken) {
  console.error('[EMAIL] POSTMARK_API_TOKEN no esta configurado; los emails no se enviaran');
}
if (!process.env.EMAIL_FROM) {
  console.warn('[EMAIL] EMAIL_FROM no esta configurado; usando no-reply@example.com');
}
if (!process.env.APP_URL) {
  console.warn('[EMAIL] APP_URL no esta configurado; los links en emails estaran rotos');
}

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function getAppUrl(path: string): string {
  return `${appUrl.replace(/\/$/, '')}${path}`;
}

export async function sendEmail(to: string, subject: string, html: string): Promise<{ MessageID: string }> {
  if (!client) {
    console.log(`[EMAIL SIMULADO] To: ${to} | Subject: ${subject}`);
    return { MessageID: 'local-simulated' };
  }

  try {
    const result = await client.sendEmail({
      From: emailFrom,
      To: to,
      Subject: subject,
      HtmlBody: html,
      MessageStream: 'outbound',
    });
    console.log(`[EMAIL] Enviado a ${to} | MessageID: ${result.MessageID}`);
    return result;
  } catch (error) {
    console.error(`[EMAIL] Error al enviar a ${to} | Subject: ${subject}`, error);
    throw error;
  }
}

export function emailWrapper(content: string): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1f2937;">
      <div style="background: #2563eb; padding: 20px 24px; border-radius: 8px 8px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 20px;">RCR Support</h1>
      </div>
      <div style="border: 1px solid #e5e7eb; border-top: none; padding: 24px; border-radius: 0 0 8px 8px;">
        ${content}
        <p style="color: #9ca3af; font-size: 11px; margin-top: 32px; border-top: 1px solid #f3f4f6; padding-top: 16px;">
          Este correo fue generado automáticamente por RCR Support. Por favor no respondas a este mensaje.
        </p>
      </div>
    </div>
  `;
}

export function actionButton(url: string, label: string): string {
  return `
    <p style="text-align: center; margin: 24px 0;">
      <a href="${url}" style="background: #2563eb; color: white; padding: 12px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
        ${label}
      </a>
    </p>
  `;
}

export async function sendToMany(emails: (string | null)[], subject: string, html: string) {
  const validEmails = Array.from(new Set(emails.filter((email): email is string => !!email)));
  const results = await Promise.allSettled(validEmails.map((email) => sendEmail(email, subject, html)));
  results.forEach((result, index) => {
    if (result.status === 'rejected') {
      console.error(`[EMAIL] sendToMany fallo para ${validEmails[index]}:`, result.reason);
    }
  });
}