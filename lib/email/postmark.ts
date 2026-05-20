import { ServerClient } from 'postmark';
import { db } from '../db';

const POSTMARK_API_TOKEN = process.env.POSTMARK_API_TOKEN;
const EMAIL_FROM = process.env.EMAIL_FROM || 'no-reply@example.com';
const APP_URL = process.env.APP_URL || '';

const client = POSTMARK_API_TOKEN ? new ServerClient(POSTMARK_API_TOKEN) : null;

// Advertencia al iniciar si faltan variables de entorno críticas
if (!POSTMARK_API_TOKEN) {
  console.error('[EMAIL] ⚠️  POSTMARK_API_TOKEN no está configurado — los emails no se enviarán');
}
if (!process.env.EMAIL_FROM) {
  console.warn('[EMAIL] ⚠️  EMAIL_FROM no está configurado — usando no-reply@example.com');
}
if (!process.env.APP_URL) {
  console.warn('[EMAIL] ⚠️  APP_URL no está configurado — los links en emails estarán rotos');
}

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

  try {
    const result = await client.sendEmail({
      From: EMAIL_FROM,
      To: to,
      Subject: subject,
      HtmlBody: html,
      MessageStream: 'outbound',
    });
    console.log(`[EMAIL] ✓ Enviado a ${to} | MessageID: ${result.MessageID}`);
    return result;
  } catch (err) {
    console.error(`[EMAIL] ✗ Error al enviar a ${to} | Subject: ${subject}`, err);
    throw err;
  }
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
  const results = await Promise.allSettled(valid.map(to => sendEmail(to, subject, html)));
  results.forEach((r, i) => {
    if (r.status === 'rejected') {
      console.error(`[EMAIL] ✗ sendToMany falló para ${valid[i]}:`, r.reason);
    }
  });
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
 * PRE-REGISTRO
 *    → Usuario: confirmación con resumen de sus datos enviados
 *    → Admins del sistema: alerta interna para revisar y activar la cuenta
 *    → Admin Contrato seleccionado: aviso de que fue asignado a un contrato pendiente
 */
export async function sendPreRegistrationEmails(params: {
  userEmail: string;
  userName: string;
  userLastName: string;
  userRun: string;
  companyName: string;
  contractNumber: string;
  contractName: string;
  initialDate: Date;
  finalDate: Date;
  adminContractorId: string;
  isSubcontract?: boolean;
}) {
  const {
    userEmail, userName, userLastName, userRun,
    companyName, contractNumber, contractName,
    initialDate, finalDate, adminContractorId,
    isSubcontract = false,
  } = params;

  const loginUrl = getAppUrl('/login');
  const dashboardUrl = getAppUrl('/dashboard');

  const safeName = escapeHtml(`${userName} ${userLastName}`);
  const safeCompany = escapeHtml(companyName);
  const safeContract = escapeHtml(contractName);
  const safeRun = escapeHtml(userRun);
  const safeContractNumber = escapeHtml(contractNumber);

  const fmt = (d: Date) =>
    d.toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit', year: 'numeric' });

  const dataTable = isSubcontract ? `
    <table style="width:100%; border-collapse: collapse; font-size: 13px; margin: 16px 0;">
      <tr style="background:#f9fafb;"><td style="padding:8px 12px; color:#6b7280; width:45%;">Nombre</td><td style="padding:8px 12px; font-weight:600;">${safeName}</td></tr>
      <tr><td style="padding:8px 12px; color:#6b7280;">RUN</td><td style="padding:8px 12px; font-weight:600;">${safeRun}</td></tr>
      <tr style="background:#f9fafb;"><td style="padding:8px 12px; color:#6b7280;">Email registrado</td><td style="padding:8px 12px; font-weight:600;">${escapeHtml(userEmail)}</td></tr>
      <tr><td style="padding:8px 12px; color:#6b7280;">Empresa</td><td style="padding:8px 12px; font-weight:600;">${safeCompany}</td></tr>
      <tr style="background:#f9fafb;"><td style="padding:8px 12px; color:#6b7280;">Tipo</td><td style="padding:8px 12px; font-weight:600;">Sub-contratista</td></tr>
    </table>
  ` : `
    <table style="width:100%; border-collapse: collapse; font-size: 13px; margin: 16px 0;">
      <tr style="background:#f9fafb;"><td style="padding:8px 12px; color:#6b7280; width:45%;">Nombre</td><td style="padding:8px 12px; font-weight:600;">${safeName}</td></tr>
      <tr><td style="padding:8px 12px; color:#6b7280;">RUN</td><td style="padding:8px 12px; font-weight:600;">${safeRun}</td></tr>
      <tr style="background:#f9fafb;"><td style="padding:8px 12px; color:#6b7280;">Email registrado</td><td style="padding:8px 12px; font-weight:600;">${escapeHtml(userEmail)}</td></tr>
      <tr><td style="padding:8px 12px; color:#6b7280;">Empresa</td><td style="padding:8px 12px; font-weight:600;">${safeCompany}</td></tr>
      <tr style="background:#f9fafb;"><td style="padding:8px 12px; color:#6b7280;">N° Contrato</td><td style="padding:8px 12px; font-weight:600;">${safeContractNumber}</td></tr>
      <tr><td style="padding:8px 12px; color:#6b7280;">Nombre contrato</td><td style="padding:8px 12px; font-weight:600;">${safeContract}</td></tr>
      <tr style="background:#f9fafb;"><td style="padding:8px 12px; color:#6b7280;">Vigencia</td><td style="padding:8px 12px; font-weight:600;">${fmt(initialDate)} → ${fmt(finalDate)}</td></tr>
    </table>
  `;

  // 1. Correo al usuario: confirmación
  const userSubcontractNote = isSubcontract ? `
    <div style="background: #eff6ff; border-left: 4px solid #2563eb; padding: 14px 18px; border-radius: 4px; margin: 20px 0;">
      <p style="margin: 0 0 6px;"><strong>¿Qué sigue?</strong></p>
      <ol style="margin: 0; padding-left: 18px; font-size: 13px; line-height: 1.8;">
        <li>Un administrador revisará tus datos y los de tu empresa.</li>
        <li>El administrador vinculará tu empresa al contrato correspondiente.</li>
        <li>Cuando tu cuenta sea activada, recibirás un segundo correo con tus credenciales de acceso.</li>
      </ol>
    </div>
  ` : `
    <div style="background: #eff6ff; border-left: 4px solid #2563eb; padding: 14px 18px; border-radius: 4px; margin: 20px 0;">
      <p style="margin: 0 0 6px;"><strong>¿Qué sigue?</strong></p>
      <ol style="margin: 0; padding-left: 18px; font-size: 13px; line-height: 1.8;">
        <li>Un administrador revisará tus datos y los de tu empresa.</li>
        <li>Cuando tu cuenta sea activada, recibirás un segundo correo en esta dirección con tus credenciales de acceso.</li>
        <li>Con esas credenciales podrás ingresar al sistema y comenzar a gestionar tus solicitudes.</li>
      </ol>
    </div>
  `;
  const userHtml = emailWrapper(`
    <h2 style="color: #16a34a; margin-top: 0;">✅ Solicitud de pre-registro recibida</h2>
    <p>Hola <strong>${safeName}</strong>, recibimos tu solicitud de registro en RCR Support. A continuación encontrarás un resumen de los datos que ingresaste:</p>
    ${dataTable}
    ${userSubcontractNote}
    <p style="font-size: 13px; color: #6b7280;">Si los datos anteriores tienen algún error, comunícate con el administrador antes de que la cuenta sea activada.</p>
  `);

  // 1. Correo al usuario: confirmación
  try {
    await sendEmail(userEmail, '✅ Solicitud de pre-registro recibida - RCR Support', userHtml);
  } catch (err) {
    console.error('[pre-register] Error enviando correo al usuario:', err);
  }

  // 2. Correo a admins del sistema
  try {
    const adminUsers = await db.user.findMany({
      where: { roles: { some: { role: { name: 'admin' } } }, deletedLogic: { not: true } },
      select: { email: true },
    });
    const adminEmails = adminUsers.map(u => u.email).filter((e): e is string => !!e);
    if (adminEmails.length > 0) {
      const adminHtml = emailWrapper(`
        <h2 style="color: #d97706; margin-top: 0;">🔔 Nuevo pre-registro pendiente de aprobación</h2>
        <p>Un usuario realizó una solicitud de pre-registro. A continuación los datos enviados:</p>
        ${dataTable}
        <div style="background: #fffbeb; border-left: 4px solid #d97706; padding: 14px 18px; border-radius: 4px; margin: 20px 0;">
          <p style="margin: 0;"><strong>Acción requerida:</strong> Revisar los datos y activar la cuenta en el panel de administración.</p>
        </div>
        ${actionButton(dashboardUrl, 'Ir al panel de administración')}
      `);
      await sendToMany(adminEmails, '🔔 Nuevo pre-registro pendiente - RCR Support', adminHtml);
    } else {
      console.warn('[pre-register] No se encontraron admins activos para notificar.');
    }
  } catch (err) {
    console.error('[pre-register] Error enviando correo a admins:', err);
  }

  // 3. Correo al Admin Contrato seleccionado (solo si no es sub-contratista)
  if (!isSubcontract && adminContractorId) {
    try {
      const acUser = await db.user.findUnique({
        where: { id: adminContractorId },
        select: { email: true, name: true, lastName: true },
      });
      if (acUser?.email) {
        const acHtml = emailWrapper(`
          <h2 style="color: #7c3aed; margin-top: 0;">📋 Fuiste asignado a un contrato pendiente de aprobación</h2>
          <p>Un usuario se registró indicándote como <strong>Administrador de Contrato</strong> para el siguiente contrato:</p>
          ${dataTable}
          <div style="background: #f5f3ff; border-left: 4px solid #7c3aed; padding: 14px 18px; border-radius: 4px; margin: 20px 0;">
            <p style="margin: 0;"><strong>Nota:</strong> El contrato y la cuenta del usuario estarán activos una vez que un administrador del sistema apruebe la solicitud.</p>
          </div>
          ${actionButton(loginUrl, 'Acceder al sistema')}
        `);
        await sendEmail(acUser.email, '📋 Fuiste asignado a un contrato pendiente - RCR Support', acHtml);
      }
    } catch (err) {
      console.error('[pre-register] Error enviando correo al admin contrato:', err);
    }
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

// ============================================
// BIENVENIDA / CREDENCIALES DE ACCESO
// ============================================

/**
 * Correo de bienvenida con credenciales de acceso.
 * Se envía en dos momentos:
 *   1. Cuando un admin crea un usuario desde el panel.
 *   2. Cuando un admin activa una cuenta pre-registrada (isActive: false → true).
 */
export async function sendWelcomeEmail(params: {
  toEmail: string;
  displayName: string;
  userName: string;
  password: string; // texto plano (antes de hashear, o temporal)
  isTemporaryPassword?: boolean;
}) {
  const { toEmail, displayName, userName, password, isTemporaryPassword = false } = params;
  const loginUrl = getAppUrl('/login');

  const credentialsBox = `
    <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px 24px; margin: 24px 0;">
      <p style="margin: 0 0 12px; font-size: 13px; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;">Tus credenciales de acceso</p>
      <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
        <tr>
          <td style="padding: 6px 0; color: #64748b; width: 40%;">Usuario</td>
          <td style="padding: 6px 0; font-weight: 700; color: #1e293b; font-family: monospace; font-size: 15px;">${escapeHtml(userName)}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #64748b;">Contraseña</td>
          <td style="padding: 6px 0; font-weight: 700; color: #1e293b; font-family: monospace; font-size: 15px;">${escapeHtml(password)}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #64748b;">Email</td>
          <td style="padding: 6px 0; font-weight: 700; color: #1e293b;">${escapeHtml(toEmail)}</td>
        </tr>
      </table>
    </div>
  `;

  const tempPasswordNote = isTemporaryPassword
    ? `<div style="background: #fefce8; border-left: 4px solid #ca8a04; padding: 12px 16px; border-radius: 4px; margin: 0 0 20px; font-size: 13px; color: #713f12;">
        <strong>Contraseña temporal:</strong> Te recomendamos cambiarla en tu primer ingreso desde tu perfil de usuario.
      </div>`
    : '';

  const stepsHtml = `
    <p style="margin: 20px 0 12px; font-size: 13px; font-weight: 600; color: #374151; text-transform: uppercase; letter-spacing: 0.05em;">Primeros pasos</p>
    <table style="width: 100%; border-collapse: collapse;">
      <tr>
        <td style="vertical-align: top; padding: 8px 0; width: 32px;">
          <span style="display: inline-flex; align-items: center; justify-content: center; width: 22px; height: 22px; background: #D05F27; color: white; border-radius: 50%; font-size: 11px; font-weight: 700;">1</span>
        </td>
        <td style="vertical-align: top; padding: 8px 0; font-size: 13px; color: #374151;">
          <strong>Inicia sesión</strong> con las credenciales de arriba en el botón de acceso.
        </td>
      </tr>
      <tr>
        <td colspan="2" style="padding: 8px 0 16px;">
          <img src="https://res.cloudinary.com/ddwzut6un/image/upload/v1778356671/copy_of_captura_de_pantalla_2026-05-09_a_la_s_33321_pm_guc2zd_554437.png" alt="Pantalla de inicio de sesión" style="width: 100%; max-width: 520px; border-radius: 8px; border: 1px solid #e5e7eb; display: block; margin: 0 auto;" />
        </td>
      </tr>
      <tr>
        <td style="vertical-align: top; padding: 8px 0; width: 32px;">
          <span style="display: inline-flex; align-items: center; justify-content: center; width: 22px; height: 22px; background: #D05F27; color: white; border-radius: 50%; font-size: 11px; font-weight: 700;">2</span>
        </td>
        <td style="vertical-align: top; padding: 8px 0; font-size: 13px; color: #374151;">
          <strong>Explora el panel</strong>: desde el menú lateral podrás ver tus solicitudes de acreditación, documentos y estado de tus trabajadores.
        </td>
      </tr>
      <tr>
        <td style="vertical-align: top; padding: 8px 0; width: 32px;">
          <span style="display: inline-flex; align-items: center; justify-content: center; width: 22px; height: 22px; background: #D05F27; color: white; border-radius: 50%; font-size: 11px; font-weight: 700;">3</span>
        </td>
        <td style="vertical-align: top; padding: 8px 0; font-size: 13px; color: #374151;">
          <strong>Crea una solicitud de acreditación</strong>: selecciona el trabajador, adjunta sus documentos y envíala para revisión del Administrador de Contrato y SHEQ.
        </td>
      </tr>
      <tr>
        <td style="vertical-align: top; padding: 8px 0; width: 32px;">
          <span style="display: inline-flex; align-items: center; justify-content: center; width: 22px; height: 22px; background: #D05F27; color: white; border-radius: 50%; font-size: 11px; font-weight: 700;">4</span>
        </td>
        <td style="vertical-align: top; padding: 8px 0; font-size: 13px; color: #374151;">
          <strong>Recibe notificaciones</strong> por correo en cada etapa del proceso: aprobación, observaciones, credencial lista para imprimir y código QR de habilitación.
        </td>
      </tr>
      <tr>
        <td style="vertical-align: top; padding: 8px 0; width: 32px;">
          <span style="display: inline-flex; align-items: center; justify-content: center; width: 22px; height: 22px; background: #D05F27; color: white; border-radius: 50%; font-size: 11px; font-weight: 700;">5</span>
        </td>
        <td style="vertical-align: top; padding: 8px 0; font-size: 13px; color: #374151;">
          <strong>Actualiza tu perfil</strong>: desde el menú superior (ícono de tu nombre) puedes cambiar tu foto, teléfono y contraseña en cualquier momento.
        </td>
      </tr>
    </table>
  `;

  const html = emailWrapper(`
    <h2 style="color: #D05F27; margin-top: 0;">¡Bienvenido/a a SHEQ Manto Verde, ${escapeHtml(displayName)}!</h2>
    <p style="font-size: 13px; color: #6b7280; margin-top: -8px;">Sistema de acreditación de licencias internas — Minera Manto Verde</p>
    <p>Tu cuenta fue creada y ya está activa. A partir de ahora puedes ingresar al sistema para gestionar las solicitudes de acreditación de tus trabajadores.</p>
    ${credentialsBox}
    ${tempPasswordNote}
    ${stepsHtml}
    ${actionButton(loginUrl, 'Acceder al sistema')}
    <p style="font-size: 12px; color: #9ca3af; text-align: center; margin-top: 8px;">
      Si tienes algún problema para ingresar, comunícate con el administrador del sistema.
    </p>
  `);

  await sendEmail(toEmail, '¡Bienvenido/a a SHEQ Manto Verde! — Tus credenciales de acceso', html);
}

// ============================================
// EMAILS DE SUBCONTRATOS
// ============================================

/**
 * FLUJO A — Empresa existente vinculada
 *   → Mandante: resumen de la empresa vinculada + datos de contacto
 *   → Sub-empresa: nombre mandante, contrato y detalles del AC
 */
export async function sendSubcontractLinkedEmails(params: {
  contractId: string;
  subCompanyId: string;
}) {
  const { contractId, subCompanyId } = params;

  const [contract, subCompany] = await Promise.all([
    db.contract.findUnique({
      where: { id: contractId },
      include: {
        Company: { select: { name: true, rut: true } },
        userAc: { select: { name: true, email: true, phoneNumber: true, displayName: true } },
      },
    }),
    db.company.findUnique({
      where: { id: subCompanyId },
      include: {
        User: {
          where: { isActive: true },
          select: { name: true, email: true, phoneNumber: true },
          take: 1,
        },
      },
    }),
  ]);

  if (!contract || !subCompany) return;

  const fmt = (d: Date) =>
    d.toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit', year: 'numeric' });

  const safeMandante = escapeHtml(contract.Company.name ?? contract.Company.rut);
  const safeSubName = escapeHtml(subCompany.name ?? 'Sin nombre');
  const safeSubRut = escapeHtml(subCompany.rut);
  const safeContract = escapeHtml(contract.contractName);
  const safeContractNum = escapeHtml(contract.contractNumber);
  const safeAcName = escapeHtml(contract.userAc.displayName ?? contract.userAc.name);
  const safeAcEmail = escapeHtml(contract.userAc.email);
  const safeAcPhone = contract.userAc.phoneNumber ? escapeHtml(contract.userAc.phoneNumber) : 'No registrado';

  const subRep = subCompany.User[0];

  // Correo a mandante
  const mandanteHtml = emailWrapper(`
    <h2 style="color: #16a34a; margin-top: 0;">✅ Nueva sub-empresa vinculada</h2>
    <p>La siguiente empresa ha sido vinculada exitosamente al contrato <strong>${safeContract} (N° ${safeContractNum})</strong>.</p>
    <table style="width:100%; border-collapse:collapse; font-size:13px; margin:16px 0;">
      <tr style="background:#f9fafb;"><td style="padding:8px 12px; color:#6b7280; width:40%;">Empresa</td><td style="padding:8px 12px; font-weight:600;">${safeSubName}</td></tr>
      <tr><td style="padding:8px 12px; color:#6b7280;">RUT</td><td style="padding:8px 12px; font-weight:600;">${safeSubRut}</td></tr>
      ${subRep ? `
      <tr style="background:#f9fafb;"><td style="padding:8px 12px; color:#6b7280;">Representante</td><td style="padding:8px 12px; font-weight:600;">${escapeHtml(subRep.name)}</td></tr>
      <tr><td style="padding:8px 12px; color:#6b7280;">Email</td><td style="padding:8px 12px;">${escapeHtml(subRep.email)}</td></tr>
      <tr style="background:#f9fafb;"><td style="padding:8px 12px; color:#6b7280;">Teléfono</td><td style="padding:8px 12px;">${subRep.phoneNumber ? escapeHtml(subRep.phoneNumber) : 'No registrado'}</td></tr>
      ` : ''}
      <tr><td style="padding:8px 12px; color:#6b7280;">Contrato</td><td style="padding:8px 12px; font-weight:600;">${safeContract}</td></tr>
      <tr style="background:#f9fafb;"><td style="padding:8px 12px; color:#6b7280;">N° Contrato</td><td style="padding:8px 12px;">${safeContractNum}</td></tr>
      <tr><td style="padding:8px 12px; color:#6b7280;">Vigencia</td><td style="padding:8px 12px;">${fmt(contract.initialDate)} → ${fmt(contract.finalDate)}</td></tr>
    </table>
    ${actionButton(getAppUrl('/dashboard/admin/subcontracts'), 'Ver sub-empresas')}
  `);

  // Correo a sub-empresa
  const subHtml = emailWrapper(`
    <h2 style="color: #16a34a; margin-top: 0;">✅ Fuiste vinculado/a como sub-empresa</h2>
    <p>La empresa <strong>${safeMandante}</strong> te ha vinculado como sub-empresa en el siguiente contrato.</p>
    <h3 style="color:#374151; margin-top:20px;">Detalles del contrato</h3>
    <table style="width:100%; border-collapse:collapse; font-size:13px; margin:12px 0;">
      <tr style="background:#f9fafb;"><td style="padding:8px 12px; color:#6b7280; width:40%;">Empresa mandante</td><td style="padding:8px 12px; font-weight:600;">${safeMandante}</td></tr>
      <tr><td style="padding:8px 12px; color:#6b7280;">Contrato</td><td style="padding:8px 12px; font-weight:600;">${safeContract}</td></tr>
      <tr style="background:#f9fafb;"><td style="padding:8px 12px; color:#6b7280;">N° Contrato</td><td style="padding:8px 12px;">${safeContractNum}</td></tr>
      <tr><td style="padding:8px 12px; color:#6b7280;">Vigencia</td><td style="padding:8px 12px;">${fmt(contract.initialDate)} → ${fmt(contract.finalDate)}</td></tr>
    </table>
    <h3 style="color:#374151; margin-top:20px;">Administrador de contrato (AC)</h3>
    <table style="width:100%; border-collapse:collapse; font-size:13px; margin:12px 0;">
      <tr style="background:#f9fafb;"><td style="padding:8px 12px; color:#6b7280; width:40%;">Nombre</td><td style="padding:8px 12px; font-weight:600;">${safeAcName}</td></tr>
      <tr><td style="padding:8px 12px; color:#6b7280;">Email</td><td style="padding:8px 12px;">${safeAcEmail}</td></tr>
      <tr style="background:#f9fafb;"><td style="padding:8px 12px; color:#6b7280;">Teléfono</td><td style="padding:8px 12px;">${safeAcPhone}</td></tr>
    </table>
    <p style="color:#6b7280; font-size:13px;">Ya puedes ingresar al sistema para crear solicitudes bajo este contrato.</p>
    ${actionButton(getAppUrl('/dashboard'), 'Ir al sistema')}
  `);

  // Obtener emails de usuarios del mandante
  const mandanteUsers = await db.user.findMany({
    where: { company: { id: contract.companyId }, isActive: true },
    select: { email: true },
  });
  const mandanteEmails = mandanteUsers.map(u => u.email);
  const subEmails = subCompany.User.map(u => u.email);

  await Promise.allSettled([
    sendToMany(mandanteEmails, `Sub-empresa vinculada: ${safeSubName} — Contrato ${safeContractNum}`, mandanteHtml),
    sendToMany(subEmails, `Fuiste vinculado/a como sub-empresa en contrato ${safeContractNum}`, subHtml),
  ]);
}

/**
 * FLUJO B — Solicitud de nueva empresa (pendiente de aprobación)
 *   → Admin sistema: alerta + botón de aprobación
 *   → Admin Contrato: notificación informativa
 *   → Mandante: confirmación de envío + estado pendiente
 *   → Sub-empresa (representante): acuse de recibo + info contrato
 */
export async function sendSubcontractRequestEmails(params: {
  contractId: string;
  subCompanyId: string;
  representativeEmail: string;
}) {
  const { contractId, subCompanyId, representativeEmail } = params;

  const [contract, subCompany] = await Promise.all([
    db.contract.findUnique({
      where: { id: contractId },
      include: {
        Company: { select: { name: true, rut: true } },
        userAc: { select: { name: true, email: true, phoneNumber: true, displayName: true } },
      },
    }),
    db.company.findUnique({ where: { id: subCompanyId } }),
  ]);

  if (!contract || !subCompany) return;

  const fmt = (d: Date) =>
    d.toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit', year: 'numeric' });

  const safeMandante = escapeHtml(contract.Company.name ?? contract.Company.rut);
  const safeSubName = escapeHtml(subCompany.name ?? 'Sin nombre');
  const safeSubRut = escapeHtml(subCompany.rut);
  const safeContract = escapeHtml(contract.contractName);
  const safeContractNum = escapeHtml(contract.contractNumber);
  const safeRepEmail = escapeHtml(representativeEmail);
  const safeAcName = escapeHtml(contract.userAc.displayName ?? contract.userAc.name);
  const safeAcEmail = escapeHtml(contract.userAc.email);
  const approvalUrl = getAppUrl('/dashboard/admin/subcontracts');
  const preRegisterUrl = getAppUrl('/pre-register');

  const dataTable = `
    <table style="width:100%; border-collapse:collapse; font-size:13px; margin:12px 0;">
      <tr style="background:#f9fafb;"><td style="padding:8px 12px; color:#6b7280; width:40%;">Empresa solicitante</td><td style="padding:8px 12px; font-weight:600;">${safeSubName}</td></tr>
      <tr><td style="padding:8px 12px; color:#6b7280;">RUT empresa</td><td style="padding:8px 12px; font-weight:600;">${safeSubRut}</td></tr>
      <tr style="background:#f9fafb;"><td style="padding:8px 12px; color:#6b7280;">Email representante</td><td style="padding:8px 12px;">${safeRepEmail}</td></tr>
      <tr><td style="padding:8px 12px; color:#6b7280;">Empresa mandante</td><td style="padding:8px 12px; font-weight:600;">${safeMandante}</td></tr>
      <tr style="background:#f9fafb;"><td style="padding:8px 12px; color:#6b7280;">Contrato</td><td style="padding:8px 12px; font-weight:600;">${safeContract}</td></tr>
      <tr><td style="padding:8px 12px; color:#6b7280;">N° Contrato</td><td style="padding:8px 12px;">${safeContractNum}</td></tr>
      <tr style="background:#f9fafb;"><td style="padding:8px 12px; color:#6b7280;">Vigencia</td><td style="padding:8px 12px;">${fmt(contract.initialDate)} → ${fmt(contract.finalDate)}</td></tr>
    </table>
  `;

  // 1. Admin sistema
  const adminHtml = emailWrapper(`
    <h2 style="color: #d97706; margin-top: 0;">⏳ Nueva solicitud de sub-empresa pendiente</h2>
    <p>Se ha recibido una solicitud para incorporar una nueva empresa como sub-contratista. El representante recibirá una invitación para completar su registro.</p>
    ${dataTable}
    ${actionButton(approvalUrl, 'Revisar solicitud')}
  `);

  // 2. Admin Contrato (informativo)
  const acHtml = emailWrapper(`
    <h2 style="color: #2563eb; margin-top: 0;">ℹ️ Nueva sub-empresa en tu contrato</h2>
    <p>Se ha recibido una solicitud para incorporar <strong>${safeSubName}</strong> como sub-contratista en el contrato <strong>${safeContract} (N° ${safeContractNum})</strong>. El administrador del sistema revisará la solicitud.</p>
    ${dataTable}
  `);

  // 3. Mandante (confirmación)
  const mandanteHtml = emailWrapper(`
    <h2 style="color: #16a34a; margin-top: 0;">✅ Solicitud enviada — Pendiente de aprobación</h2>
    <p>Tu solicitud para incorporar a <strong>${safeSubName}</strong> como sub-empresa fue enviada correctamente.</p>
    <p>Se ha enviado una invitación al representante (<strong>${safeRepEmail}</strong>) para que complete su registro en el sistema. Una vez aprobado por el administrador, la vinculación quedará activa.</p>
    ${dataTable}
  `);

  // 4. Representante (invitación a pre-registro)
  const repHtml = emailWrapper(`
    <h2 style="color: #2563eb; margin-top: 0;">📋 Invitación para completar tu registro</h2>
    <p>La empresa <strong>${safeMandante}</strong> ha solicitado incorporar a <strong>${safeSubName}</strong> como sub-empresa en el siguiente contrato:</p>
    <table style="width:100%; border-collapse:collapse; font-size:13px; margin:12px 0;">
      <tr style="background:#f9fafb;"><td style="padding:8px 12px; color:#6b7280; width:40%;">Contrato</td><td style="padding:8px 12px; font-weight:600;">${safeContract}</td></tr>
      <tr><td style="padding:8px 12px; color:#6b7280;">N° Contrato</td><td style="padding:8px 12px;">${safeContractNum}</td></tr>
      <tr style="background:#f9fafb;"><td style="padding:8px 12px; color:#6b7280;">Empresa mandante</td><td style="padding:8px 12px; font-weight:600;">${safeMandante}</td></tr>
      <tr><td style="padding:8px 12px; color:#6b7280;">Vigencia</td><td style="padding:8px 12px;">${fmt(contract.initialDate)} → ${fmt(contract.finalDate)}</td></tr>
    </table>
    <p>Para que la vinculación pueda completarse, necesitas crear tu cuenta en el sistema. Haz click en el botón a continuación y completa el formulario de registro con tus datos y los de tu empresa.</p>
    <div style="background:#fefce8; border-left:4px solid #ca8a04; padding:12px 16px; border-radius:4px; margin:16px 0; font-size:13px; color:#713f12;">
      <strong>Importante:</strong> Al completar el formulario, indica el nombre de tu empresa como <strong>${safeSubName}</strong> y el RUT <strong>${safeSubRut}</strong> para que el administrador pueda asociar tu cuenta correctamente.
    </div>
    ${actionButton(preRegisterUrl, 'Completar mi registro')}
    <p style="font-size:12px; color:#9ca3af; text-align:center; margin-top:8px;">
      Si tienes dudas, comunícate con el administrador del contrato: ${safeAcName} — ${safeAcEmail}
    </p>
  `);

  // Obtener admins del sistema
  const admins = await db.user.findMany({
    where: {
      isActive: true,
      roles: { some: { role: { name: 'admin' } } },
    },
    select: { email: true },
  });
  const adminEmails = admins.map(a => a.email);
  const mandanteUsers = await db.user.findMany({
    where: { companyId: contract.companyId, isActive: true },
    select: { email: true },
  });
  const mandanteEmails = mandanteUsers.map(u => u.email);

  await Promise.allSettled([
    sendToMany(adminEmails, `⏳ Nueva sub-empresa pendiente: ${safeSubName} — Contrato ${safeContractNum}`, adminHtml),
    sendEmail(contract.userAc.email, `Nueva sub-empresa en tu contrato ${safeContractNum}: ${safeSubName}`, acHtml),
    sendToMany(mandanteEmails, `Solicitud enviada: ${safeSubName} pendiente de aprobación`, mandanteHtml),
    sendEmail(representativeEmail, `Invitación para completar tu registro — ${safeContract}`, repHtml),
  ]);
}
