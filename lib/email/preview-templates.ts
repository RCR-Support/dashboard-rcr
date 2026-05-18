/**
 * Templates de previsualización de correos con datos de muestra.
 * Usado exclusivamente por la página /dashboard/admin/email-preview
 */

export interface EmailPreview {
  id: string;
  label: string;
  category: string;
  subject: string;
  html: string;
}

// ─── Datos de muestra ────────────────────────────────────────────────────────
const D = {
  loginUrl: '#',
  dashUrl: '#',
  appUrl: '#',
  statusUrl: '#',
  name: 'Juan Pérez',
  userName: 'jperez',
  email: 'juan.perez@constructora.cl',
  pass: 'Rcr#Xk3mP9',
  company: 'Construcciones ABC Ltda.',
  contractNum: 'CT-2024-001',
  contractName: 'Contrato de Mantención Planta Norte',
  initDate: '01/03/2024',
  endDate: '31/12/2024',
  worker: 'María González Rodríguez',
  obs: 'El contrato de trabajo presenta inconsistencias en las fechas indicadas. Por favor revisar y adjuntar el documento actualizado.',
  docs: ['Contrato de trabajo', 'Cédula de identidad'],
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
function doc(body: string): string {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Vista previa</title>
  <style>
    body { margin: 0; padding: 20px; background: #f3f4f6; font-family: Arial, sans-serif; }
  </style>
</head>
<body>
  <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#1f2937;">
    <div style="background:#2563eb;padding:20px 24px;border-radius:8px 8px 0 0;">
      <h1 style="color:white;margin:0;font-size:20px;">RCR Support</h1>
    </div>
    <div style="border:1px solid #e5e7eb;border-top:none;padding:24px;border-radius:0 0 8px 8px;background:white;">
      ${body}
      <p style="color:#9ca3af;font-size:11px;margin-top:32px;border-top:1px solid #f3f4f6;padding-top:16px;">
        Este correo fue generado automáticamente por RCR Support. Por favor no respondas a este mensaje.
      </p>
    </div>
  </div>
</body>
</html>`;
}

function btn(label: string, color = '#2563eb'): string {
  return `<p style="text-align:center;margin:24px 0;">
    <a href="#" style="background:${color};color:white;padding:12px 28px;text-decoration:none;border-radius:6px;display:inline-block;font-weight:bold;">${label}</a>
  </p>`;
}

function dataTable(): string {
  return `<table style="width:100%;border-collapse:collapse;font-size:13px;margin:16px 0;">
    <tr style="background:#f9fafb;">
      <td style="padding:8px 12px;color:#6b7280;width:45%;">Nombre</td>
      <td style="padding:8px 12px;font-weight:600;">${D.name}</td>
    </tr>
    <tr>
      <td style="padding:8px 12px;color:#6b7280;">RUN</td>
      <td style="padding:8px 12px;font-weight:600;">12.345.678-9</td>
    </tr>
    <tr style="background:#f9fafb;">
      <td style="padding:8px 12px;color:#6b7280;">Email registrado</td>
      <td style="padding:8px 12px;font-weight:600;">${D.email}</td>
    </tr>
    <tr>
      <td style="padding:8px 12px;color:#6b7280;">Empresa</td>
      <td style="padding:8px 12px;font-weight:600;">${D.company}</td>
    </tr>
    <tr style="background:#f9fafb;">
      <td style="padding:8px 12px;color:#6b7280;">N° Contrato</td>
      <td style="padding:8px 12px;font-weight:600;">${D.contractNum}</td>
    </tr>
    <tr>
      <td style="padding:8px 12px;color:#6b7280;">Nombre contrato</td>
      <td style="padding:8px 12px;font-weight:600;">${D.contractName}</td>
    </tr>
    <tr style="background:#f9fafb;">
      <td style="padding:8px 12px;color:#6b7280;">Vigencia</td>
      <td style="padding:8px 12px;font-weight:600;">${D.initDate} → ${D.endDate}</td>
    </tr>
  </table>`;
}

function steps(items: { label: string; text: string }[]): string {
  return `<table style="width:100%;border-collapse:collapse;">
    ${items.map(({ label, text }, i) => `
    <tr>
      <td style="vertical-align:top;padding:8px 0;width:32px;">
        <span style="display:inline-flex;align-items:center;justify-content:center;width:22px;height:22px;background:#D05F27;color:white;border-radius:50%;font-size:11px;font-weight:700;">${i + 1}</span>
      </td>
      <td style="vertical-align:top;padding:8px 0;font-size:13px;color:#374151;">
        <strong>${label}</strong> ${text}
      </td>
    </tr>`).join('')}
  </table>`;
}

// ─── Templates ────────────────────────────────────────────────────────────────

function tplWelcomeManual(): string {
  const credBox = `
    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:20px 24px;margin:24px 0;">
      <p style="margin:0 0 12px;font-size:13px;color:#64748b;font-weight:600;text-transform:uppercase;letter-spacing:.05em;">Tus credenciales de acceso</p>
      <table style="width:100%;border-collapse:collapse;font-size:14px;">
        <tr>
          <td style="padding:6px 0;color:#64748b;width:40%;">Usuario</td>
          <td style="padding:6px 0;font-weight:700;color:#1e293b;font-family:monospace;font-size:15px;">${D.userName}</td>
        </tr>
        <tr>
          <td style="padding:6px 0;color:#64748b;">Contraseña</td>
          <td style="padding:6px 0;font-weight:700;color:#1e293b;font-family:monospace;font-size:15px;">${D.pass}</td>
        </tr>
        <tr>
          <td style="padding:6px 0;color:#64748b;">Email</td>
          <td style="padding:6px 0;font-weight:700;color:#1e293b;">${D.email}</td>
        </tr>
      </table>
    </div>`;

  return doc(`
    <h2 style="color:#D05F27;margin-top:0;">¡Bienvenido/a a SHEQ Manto Verde, ${D.name}!</h2>
    <p style="font-size:13px;color:#6b7280;margin-top:-8px;">Sistema de acreditación de licencias internas — Minera Manto Verde</p>
    <p>Tu cuenta fue creada y ya está activa. A partir de ahora puedes ingresar al sistema para gestionar las solicitudes de acreditación de tus trabajadores.</p>
    ${credBox}
    <p style="margin:20px 0 12px;font-size:13px;font-weight:600;color:#374151;text-transform:uppercase;letter-spacing:.05em;">Primeros pasos</p>
    ${steps([
      { label: 'Inicia sesión', text: 'con las credenciales de arriba en el botón de acceso.' },
    ])}
    <p style="text-align:center;margin:8px 0 16px;"><img src="https://res.cloudinary.com/ddwzut6un/image/upload/v1778356671/copy_of_captura_de_pantalla_2026-05-09_a_la_s_33321_pm_guc2zd_554437.png" alt="Pantalla de inicio de sesión" style="width:100%;max-width:520px;border-radius:8px;border:1px solid #e5e7eb;" /></p>
    ${steps([
      { label: 'Explora el panel:', text: 'desde el menú lateral podrás ver tus solicitudes de acreditación, documentos y estado de tus trabajadores.' },
      { label: 'Crea una solicitud de acreditación:', text: 'selecciona el trabajador, adjunta sus documentos y envíala para revisión del Administrador de Contrato y SHEQ.' },
      { label: 'Recibe notificaciones', text: 'por correo en cada etapa del proceso: aprobación, observaciones, credencial lista para imprimir y código QR de habilitación.' },
      { label: 'Actualiza tu perfil', text: 'desde el menú superior (ícono de tu nombre) puedes cambiar tu foto, teléfono y contraseña en cualquier momento.' },
    ])}
    ${btn('Acceder al sistema')}
    <p style="font-size:12px;color:#9ca3af;text-align:center;margin-top:8px;">Si tienes algún problema para ingresar, comunícate con el administrador del sistema.</p>
  `);
}

function tplWelcomePreRegister(): string {
  const credBox = `
    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:20px 24px;margin:24px 0;">
      <p style="margin:0 0 12px;font-size:13px;color:#64748b;font-weight:600;text-transform:uppercase;letter-spacing:.05em;">Tus credenciales de acceso</p>
      <table style="width:100%;border-collapse:collapse;font-size:14px;">
        <tr>
          <td style="padding:6px 0;color:#64748b;width:40%;">Usuario</td>
          <td style="padding:6px 0;font-weight:700;color:#1e293b;font-family:monospace;font-size:15px;">${D.userName}</td>
        </tr>
        <tr>
          <td style="padding:6px 0;color:#64748b;">Contraseña</td>
          <td style="padding:6px 0;font-weight:700;color:#1e293b;font-family:monospace;font-size:15px;">${D.pass}</td>
        </tr>
        <tr>
          <td style="padding:6px 0;color:#64748b;">Email</td>
          <td style="padding:6px 0;font-weight:700;color:#1e293b;">${D.email}</td>
        </tr>
      </table>
    </div>`;

  const tempNote = `<div style="background:#fefce8;border-left:4px solid #ca8a04;padding:12px 16px;border-radius:4px;margin:0 0 20px;font-size:13px;color:#713f12;">
    <strong>Contraseña temporal:</strong> Te recomendamos cambiarla en tu primer ingreso desde tu perfil de usuario.
  </div>`;

  return doc(`
    <h2 style="color:#D05F27;margin-top:0;">¡Bienvenido/a a SHEQ Manto Verde, ${D.name}!</h2>
    <p style="font-size:13px;color:#6b7280;margin-top:-8px;">Sistema de acreditación de licencias internas — Minera Manto Verde</p>
    <p>Tu cuenta fue revisada y aprobada. Ya puedes ingresar al sistema para gestionar las solicitudes de acreditación de tus trabajadores.</p>
    ${credBox}
    ${tempNote}
    <p style="margin:20px 0 12px;font-size:13px;font-weight:600;color:#374151;text-transform:uppercase;letter-spacing:.05em;">Primeros pasos</p>
    ${steps([
      { label: 'Inicia sesión', text: 'con las credenciales de arriba en el botón de acceso.' },
    ])}
    <p style="text-align:center;margin:8px 0 16px;"><img src="https://res.cloudinary.com/ddwzut6un/image/upload/v1778356671/copy_of_captura_de_pantalla_2026-05-09_a_la_s_33321_pm_guc2zd_554437.png" alt="Pantalla de inicio de sesión" style="width:100%;max-width:520px;border-radius:8px;border:1px solid #e5e7eb;" /></p>
    ${steps([
      { label: 'Explora el panel:', text: 'desde el menú lateral podrás ver tus solicitudes de acreditación, documentos y estado de tus trabajadores.' },
      { label: 'Crea una solicitud de acreditación:', text: 'selecciona el trabajador, adjunta sus documentos y envíala para revisión del Administrador de Contrato y SHEQ.' },
      { label: 'Recibe notificaciones', text: 'por correo en cada etapa del proceso: aprobación, observaciones, credencial lista para imprimir y código QR de habilitación.' },
      { label: 'Actualiza tu perfil', text: 'desde el menú superior (ícono de tu nombre) puedes cambiar tu foto, teléfono y contraseña en cualquier momento.' },
    ])}
    ${btn('Acceder al sistema')}
    <p style="font-size:12px;color:#9ca3af;text-align:center;margin-top:8px;">Si tienes algún problema para ingresar, comunícate con el administrador del sistema.</p>
  `);
}

function tplPreRegisterUser(): string {
  return doc(`
    <h2 style="color:#16a34a;margin-top:0;">✅ Solicitud de pre-registro recibida</h2>
    <p>Hola <strong>${D.name}</strong>, recibimos tu solicitud de registro en RCR Support. A continuación encontrarás un resumen de los datos que ingresaste:</p>
    ${dataTable()}
    <div style="background:#eff6ff;border-left:4px solid #2563eb;padding:14px 18px;border-radius:4px;margin:20px 0;">
      <p style="margin:0 0 6px;"><strong>¿Qué sigue?</strong></p>
      <ol style="margin:0;padding-left:18px;font-size:13px;line-height:1.8;">
        <li>Un administrador revisará tus datos y los de tu empresa.</li>
        <li>Cuando tu cuenta sea activada, recibirás un segundo correo en esta dirección con tus credenciales de acceso.</li>
        <li>Con esas credenciales podrás ingresar al sistema y comenzar a gestionar tus solicitudes.</li>
      </ol>
    </div>
    <p style="font-size:13px;color:#6b7280;">Si los datos anteriores tienen algún error, comunícate con el administrador antes de que la cuenta sea activada.</p>
  `);
}

function tplPreRegisterAdmin(): string {
  return doc(`
    <h2 style="color:#d97706;margin-top:0;">🔔 Nuevo pre-registro pendiente de aprobación</h2>
    <p>Un usuario realizó una solicitud de pre-registro. A continuación los datos enviados:</p>
    ${dataTable()}
    <div style="background:#fffbeb;border-left:4px solid #d97706;padding:14px 18px;border-radius:4px;margin:20px 0;">
      <p style="margin:0;"><strong>Acción requerida:</strong> Revisar los datos y activar la cuenta en el panel de administración.</p>
    </div>
    ${btn('Ir al panel de administración')}
  `);
}

function tplPreRegisterAC(): string {
  return doc(`
    <h2 style="color:#7c3aed;margin-top:0;">📋 Fuiste asignado a un contrato pendiente de aprobación</h2>
    <p>Un usuario se registró indicándote como <strong>Administrador de Contrato</strong> para el siguiente contrato:</p>
    ${dataTable()}
    <div style="background:#f5f3ff;border-left:4px solid #7c3aed;padding:14px 18px;border-radius:4px;margin:20px 0;">
      <p style="margin:0;"><strong>Nota:</strong> El contrato y la cuenta del usuario estarán activos una vez que un administrador del sistema apruebe la solicitud.</p>
    </div>
    ${btn('Acceder al sistema')}
  `);
}

function tplAppCreated(): string {
  return doc(`
    <h2 style="color:#2563eb;margin-top:0;">✅ Solicitud recibida</h2>
    <p>La solicitud de acreditación para <strong>${D.worker}</strong> ha sido recibida correctamente y está pendiente de revisión por el Administrador de Contrato.</p>
    <div style="background:#f3f4f6;padding:14px 18px;border-radius:8px;margin:20px 0;">
      <p style="margin:0;"><strong>Estado:</strong> Pendiente de revisión AC</p>
    </div>
    ${btn('Ver solicitud')}
  `);
}

function tplAppApprovedByAC(): string {
  return doc(`
    <h2 style="color:#16a34a;margin-top:0;">✅ Solicitud aprobada por Admin Contrato</h2>
    <p>La solicitud de acreditación para <strong>${D.worker}</strong> fue aprobada por el Administrador de Contrato y ahora está en revisión por el equipo SHEQ.</p>
    <div style="background:#f0fdf4;border-left:4px solid #16a34a;padding:14px 18px;border-radius:4px;margin:20px 0;">
      <p style="margin:0;"><strong>Estado:</strong> En revisión SHEQ</p>
    </div>
    <p>Te notificaremos cuando SHEQ complete la revisión.</p>
    ${btn('Ver solicitud')}
  `);
}

function tplAppRejectedByAC(): string {
  const docsHtml = `<ul style="margin:8px 0;padding-left:20px;">${D.docs.map(d => `<li>${d}</li>`).join('')}</ul>`;
  return doc(`
    <h2 style="color:#dc2626;margin-top:0;">⚠️ Solicitud requiere correcciones</h2>
    <p>La solicitud de acreditación para <strong>${D.worker}</strong> fue revisada por el Administrador de Contrato y requiere correcciones.</p>
    <div style="background:#fef2f2;border-left:4px solid #dc2626;padding:14px 18px;border-radius:4px;margin:20px 0;">
      <p style="margin:0 0 4px;"><strong>Observaciones:</strong></p>
      <p style="margin:0;">${D.obs}</p>
    </div>
    <p><strong>Documentos a corregir:</strong></p>
    ${docsHtml}
    <p>Por favor ingresa al sistema, corrige los documentos indicados y vuelve a enviar la solicitud.</p>
    ${btn('Corregir solicitud', '#dc2626')}
  `);
}

function tplAppApprovedBySHEQ(): string {
  return doc(`
    <h2 style="color:#16a34a;margin-top:0;">🎉 Solicitud aprobada completamente</h2>
    <p>La solicitud de acreditación para <strong>${D.worker}</strong> fue <strong>aprobada por SHEQ</strong>.</p>
    <div style="background:#f0fdf4;border-left:4px solid #16a34a;padding:14px 18px;border-radius:4px;margin:20px 0;">
      <p style="margin:0;"><strong>Estado:</strong> Aprobada ✅</p>
    </div>
    <p>Puedes ver el estado de habilitación del trabajador escaneando el código QR de su credencial o ingresando al siguiente enlace:</p>
    <p style="text-align:center;margin:24px 0;">
      <a href="#" style="background:#16a34a;color:white;padding:12px 28px;text-decoration:none;border-radius:6px;display:inline-block;font-weight:bold;">
        Ver estado de habilitación
      </a>
    </p>
    <p style="color:#6b7280;font-size:13px;text-align:center;">
      Esta página es pública y puede ser compartida con guardias o personal de acceso.
    </p>
    ${btn('Ver solicitud en el sistema')}
  `);
}

function tplAppRejectedBySHEQ(): string {
  const docsHtml = `<ul style="margin:8px 0;padding-left:20px;">${D.docs.map(d => `<li>${d}</li>`).join('')}</ul>`;
  return doc(`
    <h2 style="color:#dc2626;margin-top:0;">❌ Solicitud rechazada por SHEQ</h2>
    <p>La solicitud de acreditación para <strong>${D.worker}</strong> fue rechazada por el equipo SHEQ y debe ser corregida.</p>
    <div style="background:#fef2f2;border-left:4px solid #dc2626;padding:14px 18px;border-radius:4px;margin:20px 0;">
      <p style="margin:0 0 4px;"><strong>Observaciones:</strong></p>
      <p style="margin:0;">${D.obs}</p>
    </div>
    <p><strong>Documentos a corregir:</strong></p>
    ${docsHtml}
    <p>La solicitud vuelve al inicio del proceso. Por favor corrige los documentos indicados y envíala nuevamente.</p>
    ${btn('Corregir solicitud', '#dc2626')}
  `);
}

// ─── Exportación ──────────────────────────────────────────────────────────────

export function getEmailPreviews(): EmailPreview[] {
  return [
    {
      id: 'welcome-manual',
      label: 'Bienvenida — Creación por admin',
      category: 'Cuentas de usuario',
      subject: '¡Bienvenido/a a SHEQ Manto Verde! — Tus credenciales de acceso',
      html: tplWelcomeManual(),
    },
    {
      id: 'welcome-preregister',
      label: 'Bienvenida — Activación pre-registro',
      category: 'Cuentas de usuario',
      subject: '¡Bienvenido/a a SHEQ Manto Verde! — Tus credenciales de acceso',
      html: tplWelcomePreRegister(),
    },
    {
      id: 'preregister-user',
      label: 'Confirmación al solicitante',
      category: 'Pre-registro',
      subject: '✅ Solicitud de pre-registro recibida - RCR Support',
      html: tplPreRegisterUser(),
    },
    {
      id: 'preregister-admin',
      label: 'Notificación a admins del sistema',
      category: 'Pre-registro',
      subject: '🔔 Nuevo pre-registro pendiente - RCR Support',
      html: tplPreRegisterAdmin(),
    },
    {
      id: 'preregister-ac',
      label: 'Notificación al Admin Contrato',
      category: 'Pre-registro',
      subject: '📋 Fuiste asignado a un contrato pendiente - RCR Support',
      html: tplPreRegisterAC(),
    },
    {
      id: 'app-created',
      label: 'Solicitud creada',
      category: 'Solicitudes de acreditación',
      subject: '✅ Solicitud recibida - RCR Support',
      html: tplAppCreated(),
    },
    {
      id: 'app-approved-ac',
      label: 'Aprobada por Admin Contrato',
      category: 'Solicitudes de acreditación',
      subject: '✅ Solicitud en revisión SHEQ - RCR Support',
      html: tplAppApprovedByAC(),
    },
    {
      id: 'app-rejected-ac',
      label: 'Rechazada por Admin Contrato',
      category: 'Solicitudes de acreditación',
      subject: '⚠️ Tu solicitud requiere correcciones - RCR Support',
      html: tplAppRejectedByAC(),
    },
    {
      id: 'app-approved-sheq',
      label: 'Aprobada por SHEQ',
      category: 'Solicitudes de acreditación',
      subject: '🎉 Solicitud aprobada completamente - RCR Support',
      html: tplAppApprovedBySHEQ(),
    },
    {
      id: 'app-rejected-sheq',
      label: 'Rechazada por SHEQ',
      category: 'Solicitudes de acreditación',
      subject: '❌ Solicitud rechazada por SHEQ - RCR Support',
      html: tplAppRejectedBySHEQ(),
    },
  ];
}
