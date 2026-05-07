import { ServerClient } from 'postmark';
import { db } from '../db';

const POSTMARK_API_TOKEN = process.env.POSTMARK_API_TOKEN;
const EMAIL_FROM = process.env.EMAIL_FROM || 'no-reply@example.com';
const APP_URL = process.env.APP_URL || '';

const client = POSTMARK_API_TOKEN ? new ServerClient(POSTMARK_API_TOKEN) : null;

// ============================================
// HELPERS
// ============================================

/** Escapa caracteres HTML para prevenir inyección en emails */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function getAppUrl(path: string): string {
  return `${APP_URL.replace(/\/$/, '')}${path}`;
}

async function sendEmail(to: string, subject: string, html: string): Promise<{ MessageID: string }> {
  if (!client) {
    console.log(`[EMAIL SIMULADO] To: ${to} | Subject: ${subject}`);
    return { MessageID: 'local-simulated' };
  }

  return client.sendEmail({
    From: EMAIL_FROM,
    To: to,
    Subject: subject,
    HtmlBody: html,
  });
}

/** Bloque de cabecera reutilizable */
function emailWrapper(content: string): string {
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

function actionButton(url: string, label: string): string {
  return `
    <p style="text-align: center; margin: 24px 0;">
      <a href="${url}" style="background: #2563eb; color: white; padding: 12px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
        ${label}
      </a>
    </p>
  `;
}

// ============================================
// HELPER: obtener email de cualquier usuario por ID
// ============================================

async function getUserEmail(userId: string | null | undefined): Promise<string | null> {
  if (!userId) return null;
  const user = await db.user.findUnique({ where: { id: userId }, select: { email: true } });
  return user?.email ?? null;
}

/** Envía a múltiples destinatarios en paralelo, ignorando los que fallen */
async function sendToMany(emails: (string | null)[], subject: string, html: string) {
  const valid = Array.from(new Set(emails.filter((e): e is string => !!e)));
  await Promise.allSettled(valid.map(to => sendEmail(to, subject, html)));
}

// ============================================
// EMAILS DE SOLICITUD
// ============================================

/**
 * 1. Usuario crea solicitud
 *    → Usuarios de la empresa emisora: confirmación
 *    → AC del contrato: aviso para revisar
 *    → Admin creador (si es distinto de la empresa): copia de respaldo
 */
export async function sendApplicationConfirmationEmail(applicationId: string, creatorEmail?: string) {
  const app = await db.application.findUnique({
    where: { id: applicationId },
    select: { userId: true, userAcId: true, companyId: true, displayWorkerName: true },
  });
  if (!app) throw new Error('Application not found');

  const url = getAppUrl(`/dashboard/applications/${applicationId}`);
  const workerName = escapeHtml(app.displayWorkerName || '');

  // 1. Obtener emails de usuarios de la empresa emisora (rol 'user')
  const companyUsers = app.companyId
    ? await db.user.findMany({
        where: {
          companyId: app.companyId,
          deletedLogic: false,
          roles: { some: { role: { name: 'user' } } },
        },
        select: { email: true },
      })
    : [];
  const companyEmails = companyUsers.map(u => u.email).filter(Boolean) as string[];

  // Email a los usuarios de la empresa
  if (companyEmails.length > 0) {
    const html = emailWrapper(`
      <h2 style="color: #2563eb; margin-top: 0;">✅ Solicitud recibida</h2>
      <p>La solicitud de acreditación para <strong>${workerName}</strong> ha sido recibida correctamente y está pendiente de revisión por el Administrador de Contrato.</p>
      <div style="background: #f3f4f6; padding: 14px 18px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 0;"><strong>Estado:</strong> Pendiente de revisión AC</p>
      </div>
      ${actionButton(url, 'Ver solicitud')}
    `);
    await sendToMany(companyEmails, '✅ Solicitud recibida - RCR Support', html);
  }

  // 2. Email al AC: aviso de nueva solicitud para revisar
  const acEmail = await getUserEmail(app.userAcId);
  if (acEmail) {
    const html = emailWrapper(`
      <h2 style="color: #2563eb; margin-top: 0;">📋 Nueva solicitud pendiente de revisión</h2>
      <p>Hay una nueva solicitud de acreditación para <strong>${workerName}</strong> esperando tu revisión.</p>
      <div style="background: #eff6ff; border-left: 4px solid #2563eb; padding: 14px 18px; border-radius: 4px; margin: 20px 0;">
        <p style="margin: 0;"><strong>Acción requerida:</strong> Revisar y aprobar o rechazar los documentos</p>
      </div>
      ${actionButton(url, 'Revisar solicitud')}
    `);
    await sendEmail(acEmail, '📋 Nueva solicitud para revisar - RCR Support', html);
  }

  // 3. Copia al admin creador si no pertenece a la empresa
  if (creatorEmail && !companyEmails.includes(creatorEmail)) {
    const html = emailWrapper(`
      <h2 style="color: #6b7280; margin-top: 0;">📋 Copia — Solicitud creada</h2>
      <p>Este correo es una copia de respaldo. Creaste una solicitud de acreditación para <strong>${workerName}</strong> a nombre de la empresa.</p>
      <div style="background: #f9fafb; border-left: 4px solid #6b7280; padding: 14px 18px; border-radius: 4px; margin: 20px 0;">
        <p style="margin: 0;"><strong>Estado:</strong> Pendiente de revisión AC</p>
      </div>
      ${actionButton(url, 'Ver solicitud')}
    `);
    await sendEmail(creatorEmail, '📋 Copia: Solicitud creada - RCR Support', html);
  }
}

/**
 * 2. AC aprueba
 *    → Usuarios de la empresa: pasa a revisión SHEQ
 *    → SHEQ seleccionado: nueva solicitud para revisar
 *    → Admin actor (si no es el AC vinculado): copia de respaldo
 */
export async function sendApplicationApprovedByACEmail(applicationId: string, actorEmail?: string) {
  const app = await db.application.findUnique({
    where: { id: applicationId },
    select: { userId: true, userAcId: true, userSheqId: true, companyId: true, displayWorkerName: true },
  });
  if (!app) return;

  const url = getAppUrl(`/dashboard/applications/${applicationId}`);
  const workerName = escapeHtml(app.displayWorkerName || '');

  // Email a los usuarios de la empresa
  const companyUsers = app.companyId
    ? await db.user.findMany({
        where: { companyId: app.companyId, deletedLogic: false, roles: { some: { role: { name: 'user' } } } },
        select: { email: true },
      })
    : [];
  const companyEmails = companyUsers.map(u => u.email).filter(Boolean) as string[];
  if (companyEmails.length > 0) {
    const html = emailWrapper(`
      <h2 style="color: #16a34a; margin-top: 0;">✅ Solicitud aprobada por Admin Contrato</h2>
      <p>La solicitud de acreditación para <strong>${workerName}</strong> fue aprobada por el Administrador de Contrato y ahora está en revisión por el equipo SHEQ.</p>
      <div style="background: #f0fdf4; border-left: 4px solid #16a34a; padding: 14px 18px; border-radius: 4px; margin: 20px 0;">
        <p style="margin: 0;"><strong>Estado:</strong> En revisión SHEQ</p>
      </div>
      <p>Te notificaremos cuando SHEQ complete la revisión.</p>
      ${actionButton(url, 'Ver solicitud')}
    `);
    await sendToMany(companyEmails, '✅ Solicitud en revisión SHEQ - RCR Support', html);
  }

  // Email al SHEQ: aviso de solicitud para revisar
  const sheqEmail = await getUserEmail(app.userSheqId);
  if (sheqEmail) {
    const html = emailWrapper(`
      <h2 style="color: #2563eb; margin-top: 0;">📋 Solicitud pendiente de revisión SHEQ</h2>
      <p>La solicitud de acreditación para <strong>${workerName}</strong> fue aprobada por el Admin Contrato y está esperando tu revisión.</p>
      <div style="background: #eff6ff; border-left: 4px solid #2563eb; padding: 14px 18px; border-radius: 4px; margin: 20px 0;">
        <p style="margin: 0;"><strong>Acción requerida:</strong> Revisar y aprobar o rechazar los documentos</p>
      </div>
      ${actionButton(url, 'Revisar solicitud')}
    `);
    await sendEmail(sheqEmail, '📋 Solicitud para revisión SHEQ - RCR Support', html);
  }

  // Copia al admin actor si no es el AC vinculado
  const acEmail = await getUserEmail(app.userAcId);
  if (actorEmail && actorEmail !== acEmail && !companyEmails.includes(actorEmail)) {
    const html = emailWrapper(`
      <h2 style="color: #6b7280; margin-top: 0;">📋 Copia — Aprobación AC registrada</h2>
      <p>Aprobaste la solicitud de <strong>${workerName}</strong> en representación del Administrador de Contrato. El proceso continúa en revisión SHEQ.</p>
      ${actionButton(url, 'Ver solicitud')}
    `);
    await sendEmail(actorEmail, '📋 Copia: Aprobación AC registrada - RCR Support', html);
  }
}

/**
 * 3. AC rechaza
 *    → Usuarios de la empresa: motivo del rechazo
 *    → Admin actor (si no es el AC vinculado): copia de respaldo
 */
export async function sendApplicationRejectedByACEmail(
  applicationId: string,
  observations: string,
  rejectedDocs: string[],
  actorEmail?: string,
) {
  const app = await db.application.findUnique({
    where: { id: applicationId },
    select: { userId: true, userAcId: true, companyId: true, displayWorkerName: true },
  });
  if (!app) return;

  const url = getAppUrl(`/dashboard/applications/${applicationId}`);
  const workerName = escapeHtml(app.displayWorkerName || '');
  const docsHtml = rejectedDocs.length > 0
    ? `<ul style="margin: 8px 0; padding-left: 20px;">${rejectedDocs.map(d => `<li>${escapeHtml(d)}</li>`).join('')}</ul>`
    : '';

  // Email a los usuarios de la empresa
  const companyUsers = app.companyId
    ? await db.user.findMany({
        where: { companyId: app.companyId, deletedLogic: false, roles: { some: { role: { name: 'user' } } } },
        select: { email: true },
      })
    : [];
  const companyEmails = companyUsers.map(u => u.email).filter(Boolean) as string[];
  if (companyEmails.length > 0) {
    const html = emailWrapper(`
    <h2 style="color: #dc2626; margin-top: 0;">⚠️ Solicitud requiere correcciones</h2>
    <p>La solicitud de acreditación para <strong>${workerName}</strong> fue revisada por el Administrador de Contrato y requiere correcciones.</p>
    ${observations ? `
    <div style="background: #fef2f2; border-left: 4px solid #dc2626; padding: 14px 18px; border-radius: 4px; margin: 20px 0;">
      <p style="margin: 0 0 4px;"><strong>Observaciones:</strong></p>
      <p style="margin: 0;">${escapeHtml(observations)}</p>
    </div>` : ''}
    ${docsHtml ? `<p><strong>Documentos a corregir:</strong></p>${docsHtml}` : ''}
    <p>Por favor ingresa al sistema, corrige los documentos indicados y vuelve a enviar la solicitud.</p>
    ${actionButton(url, 'Corregir solicitud')}
  `);
    await sendToMany(companyEmails, '⚠️ Tu solicitud requiere correcciones - RCR Support', html);
  }

  // Copia al admin actor si no es el AC vinculado
  const acEmail = await getUserEmail(app.userAcId);
  if (actorEmail && actorEmail !== acEmail && !companyEmails.includes(actorEmail)) {
    const html = emailWrapper(`
      <h2 style="color: #6b7280; margin-top: 0;">📋 Copia — Rechazo AC registrado</h2>
      <p>Rechazaste la solicitud de <strong>${workerName}</strong> en representación del Administrador de Contrato.</p>
      ${observations ? `<p><strong>Observaciones registradas:</strong> ${escapeHtml(observations)}</p>` : ''}
      ${actionButton(url, 'Ver solicitud')}
    `);
    await sendEmail(actorEmail, '📋 Copia: Rechazo AC registrado - RCR Support', html);
  }
}

/**
 * 4. SHEQ aprueba
 *    → Usuarios de la empresa: solicitud aprobada completamente
 *    → AC de la solicitud: aviso de aprobación final
 *    → Usuarios con rol credential: aviso para imprimir
 *    → Admin actor (si no es el SHEQ vinculado): copia de respaldo
 */
export async function sendApplicationApprovedBySHEQEmail(applicationId: string, actorEmail?: string) {
  const app = await db.application.findUnique({
    where: { id: applicationId },
    select: {
      userId: true, userAcId: true, userSheqId: true, companyId: true, displayWorkerName: true,
      qr: { select: { token: true } },
    },
  });
  if (!app) return;

  // Obtener o crear QR token para el link de estado
  let qrToken = app.qr?.token;
  if (!qrToken) {
    const newQr = await db.applicationQR.create({ data: { applicationId } });
    qrToken = newQr.token;
  }

  const url = getAppUrl(`/dashboard/applications/${applicationId}`);
  const statusUrl = getAppUrl(`/applications/status/${qrToken}`);
  const workerName = escapeHtml(app.displayWorkerName || '');

  // Email a los usuarios de la empresa
  const companyUsers = app.companyId
    ? await db.user.findMany({
        where: { companyId: app.companyId, deletedLogic: false, roles: { some: { role: { name: 'user' } } } },
        select: { email: true },
      })
    : [];
  const companyEmails = companyUsers.map(u => u.email).filter(Boolean) as string[];
  if (companyEmails.length > 0) {
    const html = emailWrapper(`
      <h2 style="color: #16a34a; margin-top: 0;">🎉 Solicitud aprobada completamente</h2>
      <p>La solicitud de acreditación para <strong>${workerName}</strong> fue <strong>aprobada por SHEQ</strong>.</p>
      <div style="background: #f0fdf4; border-left: 4px solid #16a34a; padding: 14px 18px; border-radius: 4px; margin: 20px 0;">
        <p style="margin: 0;"><strong>Estado:</strong> Aprobada ✅</p>
      </div>
      <p>Puedes ver el estado de habilitación del trabajador escaneando el código QR de su credencial o ingresando al siguiente enlace:</p>
      <p style="text-align: center; margin: 24px 0;">
        <a href="${statusUrl}" style="background: #16a34a; color: white; padding: 12px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
          Ver estado de habilitación
        </a>
      </p>
      <p style="color: #6b7280; font-size: 13px; text-align: center;">
        Esta página es pública y puede ser compartida con guardias o personal de acceso.
      </p>
      ${actionButton(url, 'Ver solicitud en el sistema')}
    `);
    await sendToMany(companyEmails, '🎉 Solicitud aprobada completamente - RCR Support', html);
  }

  // Email al AC: aviso de aprobación final
  const acEmail = await getUserEmail(app.userAcId);
  if (acEmail) {
    const html = emailWrapper(`
      <h2 style="color: #16a34a; margin-top: 0;">✅ Solicitud aprobada por SHEQ</h2>
      <p>La solicitud de acreditación para <strong>${workerName}</strong> fue aprobada por el equipo SHEQ.</p>
      <div style="background: #f0fdf4; border-left: 4px solid #16a34a; padding: 14px 18px; border-radius: 4px; margin: 20px 0;">
        <p style="margin: 0;"><strong>Estado:</strong> Aprobada completamente ✅</p>
      </div>
      ${actionButton(url, 'Ver solicitud')}
    `);
    await sendEmail(acEmail, '✅ Solicitud aprobada por SHEQ - RCR Support', html);
  }

  // Email a usuarios credential: aviso para imprimir credencial
  const credentialUsers = await db.user.findMany({
    where: { roles: { some: { role: { name: 'credential' } } }, deletedLogic: false },
    select: { email: true },
  });
  const credentialEmails = credentialUsers.map(u => u.email).filter((e): e is string => !!e);
  if (credentialEmails.length > 0) {
    const html = emailWrapper(`
      <h2 style="color: #7c3aed; margin-top: 0;">🖨️ Nueva credencial lista para imprimir</h2>
      <p>La solicitud de acreditación para <strong>${workerName}</strong> fue aprobada y está lista para generar la credencial.</p>
      ${actionButton(url, 'Ver e imprimir credencial')}
    `);
    await sendToMany(credentialEmails, '🖨️ Nueva credencial lista para imprimir - RCR Support', html);
  }

  // Copia al admin actor si no es el SHEQ vinculado
  const sheqEmail = await getUserEmail(app.userSheqId);
  if (actorEmail && actorEmail !== sheqEmail && actorEmail !== acEmail && !companyEmails.includes(actorEmail)) {
    const html = emailWrapper(`
      <h2 style="color: #6b7280; margin-top: 0;">📋 Copia — Aprobación SHEQ registrada</h2>
      <p>Aprobaste la solicitud de <strong>${workerName}</strong> en representación del equipo SHEQ. La credencial está siendo procesada.</p>
      ${actionButton(url, 'Ver solicitud')}
    `);
    await sendEmail(actorEmail, '📋 Copia: Aprobación SHEQ registrada - RCR Support', html);
  }
}

/**
 * 5. SHEQ rechaza
 *    → Usuarios de la empresa: motivo del rechazo, reinicia ciclo
 *    → Admin actor (si no es el SHEQ vinculado): copia de respaldo
 */
export async function sendApplicationRejectedBySHEQEmail(
  applicationId: string,
  observations: string,
  rejectedDocs: string[],
  actorEmail?: string,
) {
  const app = await db.application.findUnique({
    where: { id: applicationId },
    select: { userId: true, userAcId: true, userSheqId: true, companyId: true, displayWorkerName: true },
  });
  if (!app) return;

  const url = getAppUrl(`/dashboard/applications/${applicationId}`);
  const workerName = escapeHtml(app.displayWorkerName || '');
  const docsHtml = rejectedDocs.length > 0
    ? `<ul style="margin: 8px 0; padding-left: 20px;">${rejectedDocs.map(d => `<li>${escapeHtml(d)}</li>`).join('')}</ul>`
    : '';

  // Email a los usuarios de la empresa
  const companyUsers = app.companyId
    ? await db.user.findMany({
        where: { companyId: app.companyId, deletedLogic: false, roles: { some: { role: { name: 'user' } } } },
        select: { email: true },
      })
    : [];
  const companyEmails = companyUsers.map(u => u.email).filter(Boolean) as string[];
  if (companyEmails.length > 0) {
    const html = emailWrapper(`
    <h2 style="color: #dc2626; margin-top: 0;">❌ Solicitud rechazada por SHEQ</h2>
    <p>La solicitud de acreditación para <strong>${workerName}</strong> fue rechazada por el equipo SHEQ y debe ser corregida.</p>
    ${observations ? `
    <div style="background: #fef2f2; border-left: 4px solid #dc2626; padding: 14px 18px; border-radius: 4px; margin: 20px 0;">
      <p style="margin: 0 0 4px;"><strong>Observaciones:</strong></p>
      <p style="margin: 0;">${escapeHtml(observations)}</p>
    </div>` : ''}
    ${docsHtml ? `<p><strong>Documentos a corregir:</strong></p>${docsHtml}` : ''}
    <p>La solicitud vuelve al inicio del proceso. Por favor corrige los documentos indicados y envíala nuevamente.</p>
    ${actionButton(url, 'Corregir solicitud')}
  `);
    await sendToMany(companyEmails, '❌ Solicitud rechazada por SHEQ - RCR Support', html);
  }

  // Copia al admin actor si no es el SHEQ vinculado
  const sheqEmail = await getUserEmail(app.userSheqId);
  if (actorEmail && actorEmail !== sheqEmail && !companyEmails.includes(actorEmail)) {
    const html = emailWrapper(`
      <h2 style="color: #6b7280; margin-top: 0;">📋 Copia — Rechazo SHEQ registrado</h2>
      <p>Rechazaste la solicitud de <strong>${workerName}</strong> en representación del equipo SHEQ.</p>
      ${observations ? `<p><strong>Observaciones registradas:</strong> ${escapeHtml(observations)}</p>` : ''}
      ${actionButton(url, 'Ver solicitud')}
    `);
    await sendEmail(actorEmail, '📋 Copia: Rechazo SHEQ registrado - RCR Support', html);
  }
}
