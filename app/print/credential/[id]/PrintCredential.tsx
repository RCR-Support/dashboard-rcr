'use client';

import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import QRCode from 'qrcode';

const ACCENT = '#052d4f';
const CARD_W = 342;
const CARD_H = 216;
const CARD_MM_W = 85.6;
const CARD_MM_H = 53.98;

interface Application {
  id: string;
  workerName: string;
  workerPaternal: string;
  workerMaternal: string;
  workerRun: string;
  displayWorkerName: string;
  status: string;
  license: string | null;
  licenseExpiration: Date | null;
  createdAt: Date;
  updatedAt: Date;
  company?: { name: string | null; rut: string } | null;
  contract: {
    contractNumber: string;
    contractName: string;
    initialDate: Date;
    finalDate: Date;
  } | null;
  activities: Array<{ name: string; imageUrl: string | null }>;
  zones: Array<{ name: string }>;
  documentationFiles: Array<{ url: string; type: string; documentationId: string | null }>;
  qr?: { token: string; isActive: boolean } | null;
}

export default function PrintCredential({ application }: { application: Application }) {
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

  const workerPhoto = application.documentationFiles.find(
    doc => doc.type === 'IMG' && !doc.documentationId,
  )?.url;

  const cardBase: React.CSSProperties = {
    width: `${CARD_W}px`,
    height: `${CARD_H}px`,
    fontFamily: 'Arial, Helvetica, sans-serif',
    background: 'white',
    color: 'black',
    overflow: 'hidden',
    position: 'relative',
  };

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
          size: ${CARD_MM_W}mm ${CARD_MM_H}mm landscape;
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
            width: ${CARD_MM_W}mm !important;
            height: ${CARD_MM_H}mm !important;
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
            ISO/IEC 7810 ID-1 · {CARD_MM_W}mm × {CARD_MM_H}mm
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
            <div
              className="card-face"
              style={{
                ...cardBase,
                borderRadius: '8px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
              }}
            >
              {/* Header */}
              <div
                style={{
                  backgroundColor: ACCENT,
                  height: '38px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0 16px',
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/logo.svg"
                  alt="Logo"
                  style={{ height: '24px' }}
                  crossOrigin="anonymous"
                />
                <span
                  style={{
                    color: 'white',
                    fontWeight: 700,
                    fontSize: '11px',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                  }}
                >
                  Licencia Interna
                </span>
              </div>

              {/* Body */}
              <div
                style={{
                  display: 'flex',
                  padding: '8px 12px 4px',
                  gap: '12px',
                  height: `${CARD_H - 38 - 22}px`,
                }}
              >
                {/* Photo */}
                <div style={{ flexShrink: 0 }}>
                  <div
                    style={{
                      width: '76px',
                      height: '95px',
                      borderRadius: '4px',
                      overflow: 'hidden',
                      backgroundColor: '#e5e7eb',
                      border: '1px solid #d1d5db',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {workerPhoto ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={workerPhoto}
                        alt="Foto"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        crossOrigin="anonymous"
                      />
                    ) : (
                      <span style={{ color: '#9ca3af', fontSize: '32px', fontWeight: 700 }}>
                        {application.workerName.charAt(0)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Info */}
                <div
                  style={{
                    flex: 1,
                    minWidth: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <p
                      style={{
                        fontWeight: 700,
                        fontSize: '12px',
                        lineHeight: 1.2,
                        margin: 0,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {application.displayWorkerName}
                    </p>
                    <p style={{ fontSize: '9px', color: '#6b7280', fontWeight: 500, margin: '2px 0 0' }}>
                      RUN: {application.workerRun}
                    </p>

                    <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                      <div style={{ fontSize: '8px' }}>
                        <span style={{ fontWeight: 600, color: '#374151' }}>Empresa:</span>{' '}
                        <span style={{ color: '#6b7280' }}>{application.company?.name || '-'}</span>
                      </div>
                      {application.contract && (
                        <div style={{ fontSize: '8px' }}>
                          <span style={{ fontWeight: 600, color: '#374151' }}>Contrato:</span>{' '}
                          <span style={{ color: '#6b7280' }}>{application.contract.contractName}</span>
                        </div>
                      )}
                      {application.license && (
                        <div style={{ fontSize: '8px' }}>
                          <span style={{ fontWeight: 600, color: '#374151' }}>Lic. Conducir:</span>{' '}
                          <span style={{ color: '#6b7280', fontWeight: 600 }}>
                            {application.license.toUpperCase()}
                          </span>
                        </div>
                      )}
                      {application.licenseExpiration && (
                        <div style={{ fontSize: '8px' }}>
                          <span style={{ fontWeight: 600, color: '#ef4444' }}>Vencimiento:</span>{' '}
                          <span style={{ color: '#ef4444', fontWeight: 600 }}>
                            {format(new Date(application.licenseExpiration), 'dd/MM/yyyy')}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {application.activities.length > 0 && (
                    <div style={{ marginTop: '4px' }}>
                      <span style={{ fontSize: '7px', fontWeight: 600, color: '#374151' }}>
                        Actividades:{' '}
                      </span>
                      <span style={{ fontSize: '7px', color: '#6b7280' }}>
                        {application.activities.map(a => a.name).join(' · ')}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div
                style={{
                  backgroundColor: '#f0f0f0',
                  height: '22px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0 12px',
                }}
              >
                <span style={{ fontSize: '7px', color: '#6b7280' }}>
                  N° {application.id.slice(-8).toUpperCase()}
                </span>
                <span style={{ fontSize: '7px', color: '#6b7280' }}>
                  Emitida: {format(new Date(), 'dd/MM/yyyy')}
                </span>
              </div>
            </div>
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
            <div
              className="card-face"
              style={{
                ...cardBase,
                borderRadius: '8px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
              }}
            >
              {/* Header */}
              <div
                style={{
                  backgroundColor: ACCENT,
                  height: '38px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0 16px',
                }}
              >
                <span
                  style={{
                    color: 'white',
                    fontWeight: 700,
                    fontSize: '11px',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                  }}
                >
                  Información de Verificación
                </span>
              </div>

              {/* Body */}
              <div
                style={{
                  display: 'flex',
                  padding: '8px 16px',
                  gap: '16px',
                  height: `${CARD_H - 38 - 22}px`,
                }}
              >
                {/* QR */}
                <div
                  style={{
                    flexShrink: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {qrDataUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={qrDataUrl} alt="QR" style={{ width: '100px', height: '100px' }} />
                  ) : (
                    <div
                      style={{
                        width: '100px',
                        height: '100px',
                        backgroundColor: '#f3f4f6',
                        border: '1px solid #d1d5db',
                        borderRadius: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <span style={{ fontSize: '9px', color: '#9ca3af' }}>QR</span>
                    </div>
                  )}
                  <span style={{ fontSize: '7px', color: '#6b7280', marginTop: '4px', fontWeight: 500 }}>
                    Escanear para verificar
                  </span>
                </div>

                {/* Info */}
                <div
                  style={{
                    flex: 1,
                    minWidth: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    fontSize: '8px',
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    <div>
                      <span style={{ fontWeight: 600, color: '#374151' }}>Titular:</span>{' '}
                      <span style={{ color: '#6b7280' }}>{application.displayWorkerName}</span>
                    </div>
                    <div>
                      <span style={{ fontWeight: 600, color: '#374151' }}>RUN:</span>{' '}
                      <span style={{ color: '#6b7280' }}>{application.workerRun}</span>
                    </div>
                    {application.contract && (
                      <div>
                        <span style={{ fontWeight: 600, color: '#374151' }}>Contrato N°:</span>{' '}
                        <span style={{ color: '#6b7280' }}>{application.contract.contractNumber}</span>
                      </div>
                    )}
                    {application.zones.length > 0 && (
                      <div>
                        <span style={{ fontWeight: 600, color: '#374151' }}>Zonas autorizadas:</span>{' '}
                        <span style={{ color: '#6b7280' }}>
                          {application.zones.map(z => z.name).join(' · ')}
                        </span>
                      </div>
                    )}
                    {application.activities.length > 0 && (
                      <div>
                        <span style={{ fontWeight: 600, color: '#374151' }}>Actividades:</span>{' '}
                        <span style={{ color: '#6b7280' }}>
                          {application.activities.map(a => a.name).join(' · ')}
                        </span>
                      </div>
                    )}
                  </div>

                  <p style={{ fontSize: '7px', color: '#9ca3af', lineHeight: 1.4, margin: 0 }}>
                    Esta credencial es personal e intransferible.
                    <br />
                    Presentar junto con cédula de identidad vigente.
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div
                style={{
                  backgroundColor: '#f0f0f0',
                  height: '22px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0 12px',
                }}
              >
                <span style={{ fontSize: '7px', color: '#6b7280' }}>
                  N° {application.id.slice(-8).toUpperCase()}
                </span>
                <span style={{ fontSize: '7px', color: '#6b7280' }}>
                  {application.company?.name || ''}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
