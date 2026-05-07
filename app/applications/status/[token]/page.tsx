import { notFound } from 'next/navigation';
import { db } from '../../../../lib/db';

type Props = {
  params: { token: string };
};

function formatDate(d?: Date | string | null) {
  if (!d) return '—';
  const date = typeof d === 'string' ? new Date(d) : d;
  return date.toLocaleDateString('es-CL', { day: '2-digit', month: 'long', year: 'numeric' });
}

export default async function Page({ params }: Props) {
  const { token } = params;

  const qr = await db.applicationQR.findUnique({
    where: { token },
    include: {
      application: {
        include: {
          company: true,
          contract: true,
          activities: true,
          zones: true,
          documentationFiles: {
            select: { url: true, type: true, documentationId: true, expiresAt: true },
          },
        },
      },
    },
  });

  if (!qr || !qr.application) return notFound();

  const app = qr.application;
  const isApproved = app.stateAc === 'aprobado' && app.stateSheq === 'aprobado';

  // Reúne todas las fechas de vencimiento: licencia + documentos
  const allExpirations: Date[] = [];
  if (app.licenseExpiration) allExpirations.push(new Date(app.licenseExpiration));
  for (const doc of app.documentationFiles) {
    if (doc.expiresAt) allExpirations.push(new Date(doc.expiresAt));
  }
  // La fecha de término es la más próxima
  const nearestExpiration = allExpirations.length > 0
    ? allExpirations.reduce((a, b) => (a < b ? a : b))
    : null;

  const isExpired = nearestExpiration ? nearestExpiration < new Date() : false;
  const isValid = isApproved && !isExpired;

  const workerPhoto = app.documentationFiles.find(
    d => d.type === 'IMG' && !d.documentationId,
  )?.url;

  const verifiedAt = new Date().toLocaleString('es-CL', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        :root {
          --bg: #0f172a;
          --card: #1e293b;
          --card2: #0f172a;
          --border: #334155;
          --text: #f1f5f9;
          --muted: #94a3b8;
          --accent: #052d4f;
          --accent2: #0ea5e9;
        }
        @media (prefers-color-scheme: light) {
          :root {
            --bg: #f1f5f9;
            --card: #ffffff;
            --card2: #f8fafc;
            --border: #e2e8f0;
            --text: #0f172a;
            --muted: #64748b;
            --accent: #052d4f;
            --accent2: #0284c7;
          }
        }
        html, body { background: var(--bg); font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; }
        .logo-light { display: block; }
        .logo-dark  { display: none; }
        @media (prefers-color-scheme: dark) {
          .logo-light { display: none; }
          .logo-dark  { display: block; }
        }
      ` }} />

      <main style={{ minHeight: '100dvh', backgroundColor: 'var(--bg)', padding: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ width: '100%', maxWidth: '420px', display: 'flex', flexDirection: 'column', gap: '12px' }}>

          {/* ── Header ──────────────────────────────────────────── */}
          <div style={{ textAlign: 'center', paddingTop: '8px', paddingBottom: '4px' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/logoInv.svg" alt="RCR Support" width={72} height={32} className="logo-light" style={{ height: '32px', width: '72px', margin: '0 auto 8px' }} />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/logo.svg" alt="RCR Support" width={72} height={32} className="logo-dark" style={{ height: '32px', width: '72px', margin: '0 auto 8px' }} />
            <p style={{ color: 'var(--muted)', fontSize: '12px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              Verificación de Acreditación
            </p>
          </div>

          {/* ── Verification badge ──────────────────────────────── */}
          <div style={{
            backgroundColor: isValid ? '#052d4f' : '#1c0a0a',
            border: `2px solid ${isValid ? '#16a34a' : '#dc2626'}`,
            borderRadius: '16px',
            padding: '20px 16px',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '48px', lineHeight: 1, marginBottom: '8px' }}>
              {isValid ? '✅' : isExpired ? '⏰' : '🚫'}
            </div>
            <p style={{
              fontSize: '22px',
              fontWeight: 800,
              color: isValid ? '#4ade80' : '#f87171',
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
            }}>
              {isValid ? 'Habilitado' : isExpired ? 'Vencido' : 'No habilitado'}
            </p>
            <p style={{ color: 'var(--muted)', fontSize: '12px', marginTop: '6px' }}>
              Verificado el {verifiedAt}
            </p>
          </div>

          {/* ── Worker card ─────────────────────────────────────── */}
          <div style={{ backgroundColor: 'var(--card)', borderRadius: '16px', border: '1px solid var(--border)', overflow: 'hidden' }}>
            {/* Photo + name */}
            <div style={{ backgroundColor: 'var(--accent)', padding: '20px 16px', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{
                width: '72px', height: '90px', borderRadius: '8px', flexShrink: 0,
                overflow: 'hidden', backgroundColor: '#0a1628', border: '2px solid rgba(255,255,255,0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {workerPhoto ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={workerPhoto} alt="Foto" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '28px', fontWeight: 700 }}>
                    {app.workerName.charAt(0)}
                  </span>
                )}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ color: 'white', fontWeight: 700, fontSize: '17px', lineHeight: 1.2 }}>
                  {app.displayWorkerName}
                </p>
                <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '13px', marginTop: '4px', fontFamily: 'monospace' }}>
                  RUN {app.workerRun}
                </p>
                {nearestExpiration && (
                  <p style={{ color: isExpired ? '#f87171' : '#86efac', fontSize: '12px', marginTop: '6px', fontWeight: 600 }}>
                    {isExpired ? '⚠ Vencido el ' : '✓ Válido hasta '}{formatDate(nearestExpiration)}
                  </p>
                )}
              </div>
            </div>

            {/* Info rows */}
            <div style={{ padding: '4px 0' }}>
              {[
                { label: 'Empresa', value: app.company?.name },
                { label: 'Contrato', value: app.contract?.contractName },
                { label: 'N° Contrato', value: app.contract?.contractNumber ? `#${app.contract.contractNumber}` : null },
                { label: 'Licencia', value: app.license ? app.license.toUpperCase() : null },
              ].filter(r => r.value).map((row, i) => (
                <div key={i} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '12px 16px', borderBottom: '1px solid var(--border)',
                }}>
                  <span style={{ color: 'var(--muted)', fontSize: '13px' }}>{row.label}</span>
                  <span style={{ color: 'var(--text)', fontSize: '13px', fontWeight: 600, textAlign: 'right', maxWidth: '60%' }}>
                    {row.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Activities ──────────────────────────────────────── */}
          {app.activities.length > 0 && (
            <div style={{ backgroundColor: 'var(--card)', borderRadius: '16px', border: '1px solid var(--border)', padding: '16px' }}>
              <p style={{ color: 'var(--muted)', fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>
                Actividades autorizadas
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {app.activities.map(act => (
                  <span key={act.id} style={{
                    backgroundColor: 'rgba(14,165,233,0.15)', color: 'var(--accent2)',
                    border: '1px solid rgba(14,165,233,0.3)', padding: '5px 12px',
                    borderRadius: '9999px', fontSize: '13px', fontWeight: 500,
                  }}>
                    {act.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* ── Zones ───────────────────────────────────────────── */}
          {app.zones.length > 0 && (
            <div style={{ backgroundColor: 'var(--card)', borderRadius: '16px', border: '1px solid var(--border)', padding: '16px' }}>
              <p style={{ color: 'var(--muted)', fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>
                Zonas autorizadas
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {app.zones.map((z: { id: string; name: string }) => (
                  <span key={z.id} style={{
                    backgroundColor: 'rgba(168,85,247,0.15)', color: '#c084fc',
                    border: '1px solid rgba(168,85,247,0.3)', padding: '5px 12px',
                    borderRadius: '9999px', fontSize: '13px', fontWeight: 500,
                  }}>
                    {z.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* ── Footer ──────────────────────────────────────────── */}
          <div style={{ textAlign: 'center', padding: '12px 0 24px', color: 'var(--muted)', fontSize: '11px' }}>
            <p>ID {app.id.slice(-10).toUpperCase()}</p>
            <p style={{ marginTop: '4px' }}>RCR Support · Sistema de Acreditaciones</p>
          </div>

        </div>
      </main>
    </>
  );
}

