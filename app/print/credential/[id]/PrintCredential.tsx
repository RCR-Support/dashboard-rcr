'use client';

import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import {
  CredentialBack,
  CredentialFront,
  CREDENTIAL_CARD_MM_HEIGHT,
  CREDENTIAL_CARD_MM_WIDTH,
  type CredentialApplication,
} from '@/components/ui/dashboard/credentials/CredentialCards';

const ACCENT = '#052d4f';

export default function PrintCredential({ application }: { application: CredentialApplication & { qr?: { token: string; isActive: boolean } | null } }) {
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [origin, setOrigin] = useState('');

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  useEffect(() => {
    const token = application.qr?.token;
    if (!token || !origin) return;
    const qrUrl = `${origin}/applications/status/${token}`;
    QRCode.toDataURL(qrUrl, {
      width: 300,
      margin: 1,
      color: { dark: '#000000', light: '#ffffff' },
    })
      .then(setQrDataUrl)
      .catch(console.error);
  }, [application.qr?.token, origin]);

  return (
    <>
      {/*
       * @page sets the physical page to exactly card size.
       * -webkit-print-color-adjust / print-color-adjust force background colors.
       * On print: card-face becomes mm-sized, controls/labels hidden, layout is block.
       * The visibility trick ensures only .credential-print-root prints (hides SwitcherMini etc).
       */}
      <style>{`
        @page {
          size: ${CREDENTIAL_CARD_MM_WIDTH}mm ${CREDENTIAL_CARD_MM_HEIGHT}mm landscape;
          margin: 0;
        }
        html, body {
          margin: 0;
          padding: 0;
        }
        * {
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
          color-adjust: exact !important;
          box-sizing: border-box;
        }
        @media screen {
          body { background: #0f172a; }
        }
        @media print {
          body * { visibility: hidden; }
          .credential-print-root,
          .credential-print-root * { visibility: visible; }
          .credential-print-root {
            position: fixed;
            top: 0;
            left: 0;
            padding: 0 !important;
            background: white !important;
            display: block !important;
          }
          .print-controls { display: none !important; }
          .card-label { display: none !important; }
          .card-face {
            width: ${CREDENTIAL_CARD_MM_WIDTH}mm !important;
            height: ${CREDENTIAL_CARD_MM_HEIGHT}mm !important;
            border-radius: 0 !important;
            box-shadow: none !important;
            page-break-after: always;
            break-after: page;
          }
          .card-container {
            display: block !important;
            margin: 0 !important;
            padding: 0 !important;
          }
        }
      `}</style>

      <div className="credential-print-root" id="credential-print-root">
        {/* ── Controls bar (screen only) ────────────────────────────────── */}
        <div
          className="print-controls"
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 100,
            backgroundColor: '#1e293b',
            borderBottom: '1px solid #334155',
            padding: '12px 24px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <button
            onClick={() => window.print()}
            style={{
              backgroundColor: ACCENT,
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              padding: '8px 20px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            🖨️ Imprimir
          </button>
          <button
            onClick={() => window.close()}
            style={{
              backgroundColor: '#334155',
              color: '#cbd5e1',
              border: 'none',
              borderRadius: '6px',
              padding: '8px 16px',
              fontSize: '14px',
              cursor: 'pointer',
            }}
          >
            ✕ Cerrar
          </button>
          <span style={{ color: '#64748b', fontSize: '12px', marginLeft: 'auto' }}>
            ISO/IEC 7810 ID-1 · {CREDENTIAL_CARD_MM_WIDTH}mm × {CREDENTIAL_CARD_MM_HEIGHT}mm
          </span>
          <span style={{ color: '#94a3b8', fontSize: '13px', fontWeight: 600 }}>
            {application.displayWorkerName} — {application.workerRun}
          </span>
        </div>

        {/* ── Cards layout ─────────────────────────────────────────────── */}
        <div
          style={{
            padding: '48px',
            display: 'flex',
            gap: '60px',
            justifyContent: 'center',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
            minHeight: 'calc(100vh - 57px)',
          }}
        >
          {/* ── FRONT ─────────────────────────────────────────────────── */}
          <div className="card-container">
            <p
              className="card-label"
              style={{
                color: '#64748b',
                fontSize: '11px',
                fontWeight: 700,
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                textAlign: 'center',
                marginBottom: '8px',
              }}
            >
              FRENTE
            </p>
            <CredentialFront
              application={application}
              className="card-face rounded-lg shadow-2xl"
            />
          </div>

          {/* ── BACK ──────────────────────────────────────────────────── */}
          <div className="card-container">
            <p
              className="card-label"
              style={{
                color: '#64748b',
                fontSize: '11px',
                fontWeight: 700,
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                textAlign: 'center',
                marginBottom: '8px',
              }}
            >
              DORSO
            </p>
            <CredentialBack
              application={application}
              qrDataUrl={qrDataUrl}
              className="card-face rounded-lg shadow-2xl"
            />
          </div>
        </div>
      </div>
    </>
  );
}
