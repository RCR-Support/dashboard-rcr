import { actionButton, emailWrapper, escapeHtml, getAppUrl } from './email-client';

interface WelcomeEmailParams {
  displayName: string;
  passwordSetupUrl: string;
  toEmail: string;
  userName: string;
}

export function buildWelcomeEmailHtml({
  displayName,
  passwordSetupUrl,
  toEmail,
  userName,
}: WelcomeEmailParams) {
  const loginUrl = getAppUrl('/login');
  const credentialsBox = `
    <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px 24px; margin: 24px 0;">
      <p style="margin: 0 0 12px; font-size: 13px; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;">Tus credenciales de acceso</p>
      <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
        <tr><td style="padding: 6px 0; color: #64748b; width: 40%;">Usuario</td><td style="padding: 6px 0; font-weight: 700; color: #1e293b; font-family: monospace; font-size: 15px;">${escapeHtml(userName)}</td></tr>
        <tr><td style="padding: 6px 0; color: #64748b;">Email</td><td style="padding: 6px 0; font-weight: 700; color: #1e293b;">${escapeHtml(toEmail)}</td></tr>
      </table>
    </div>`;

  const stepsHtml = `
    <p style="margin: 20px 0 12px; font-size: 13px; font-weight: 600; color: #374151; text-transform: uppercase; letter-spacing: 0.05em;">Primeros pasos</p>
    <table style="width: 100%; border-collapse: collapse;">
      <tr><td style="vertical-align: top; padding: 8px 0; width: 32px;"><span style="display: inline-flex; align-items: center; justify-content: center; width: 22px; height: 22px; background: #D05F27; color: white; border-radius: 50%; font-size: 11px; font-weight: 700;">1</span></td><td style="vertical-align: top; padding: 8px 0; font-size: 13px; color: #374151;"><strong>Inicia sesión</strong> con las credenciales de arriba en el botón de acceso.</td></tr>
      <tr><td colspan="2" style="padding: 8px 0 16px;"><img src="https://res.cloudinary.com/ddwzut6un/image/upload/v1778356671/copy_of_captura_de_pantalla_2026-05-09_a_la_s_33321_pm_guc2zd_554437.png" alt="Pantalla de inicio de sesión" style="width: 100%; max-width: 520px; border-radius: 8px; border: 1px solid #e5e7eb; display: block; margin: 0 auto;" /></td></tr>
      <tr><td style="vertical-align: top; padding: 8px 0; width: 32px;"><span style="display: inline-flex; align-items: center; justify-content: center; width: 22px; height: 22px; background: #D05F27; color: white; border-radius: 50%; font-size: 11px; font-weight: 700;">2</span></td><td style="vertical-align: top; padding: 8px 0; font-size: 13px; color: #374151;"><strong>Explora el panel</strong>: desde el menú lateral podrás ver tus solicitudes de acreditación, documentos y estado de tus trabajadores.</td></tr>
      <tr><td style="vertical-align: top; padding: 8px 0; width: 32px;"><span style="display: inline-flex; align-items: center; justify-content: center; width: 22px; height: 22px; background: #D05F27; color: white; border-radius: 50%; font-size: 11px; font-weight: 700;">3</span></td><td style="vertical-align: top; padding: 8px 0; font-size: 13px; color: #374151;"><strong>Crea una solicitud de acreditación</strong>: selecciona el trabajador, adjunta sus documentos y envíala para revisión del Administrador de Contrato y SHEQ.</td></tr>
      <tr><td style="vertical-align: top; padding: 8px 0; width: 32px;"><span style="display: inline-flex; align-items: center; justify-content: center; width: 22px; height: 22px; background: #D05F27; color: white; border-radius: 50%; font-size: 11px; font-weight: 700;">4</span></td><td style="vertical-align: top; padding: 8px 0; font-size: 13px; color: #374151;"><strong>Recibe notificaciones</strong> por correo en cada etapa del proceso: aprobación, observaciones, credencial lista para imprimir y código QR de habilitación.</td></tr>
      <tr><td style="vertical-align: top; padding: 8px 0; width: 32px;"><span style="display: inline-flex; align-items: center; justify-content: center; width: 22px; height: 22px; background: #D05F27; color: white; border-radius: 50%; font-size: 11px; font-weight: 700;">5</span></td><td style="vertical-align: top; padding: 8px 0; font-size: 13px; color: #374151;"><strong>Actualiza tu perfil</strong>: desde el menú superior (ícono de tu nombre) puedes cambiar tu foto, teléfono y contraseña en cualquier momento.</td></tr>
    </table>`;

  return emailWrapper(`
    <h2 style="color: #D05F27; margin-top: 0;">¡Bienvenido/a a SHEQ Manto Verde, ${escapeHtml(displayName)}!</h2>
    <p style="font-size: 13px; color: #6b7280; margin-top: -8px;">Sistema de acreditación de licencias internas — Minera Manto Verde</p>
    <p>Tu cuenta fue creada y ya está activa. A partir de ahora puedes ingresar al sistema para gestionar las solicitudes de acreditación de tus trabajadores.</p>
    ${credentialsBox}
    <div style="background: #fefce8; border-left: 4px solid #ca8a04; padding: 12px 16px; border-radius: 4px; margin: 0 0 20px; font-size: 13px; color: #713f12;"><strong>Configura tu contraseña:</strong> usa el enlace seguro antes de 24 horas para activar tu acceso.</div>
    ${actionButton(passwordSetupUrl, 'Configurar contraseña')}
    ${stepsHtml}
    ${actionButton(loginUrl, 'Acceder al sistema')}
    <p style="font-size: 12px; color: #9ca3af; text-align: center; margin-top: 8px;">Si tienes algún problema para ingresar, comunícate con el administrador del sistema.</p>
  `);
}