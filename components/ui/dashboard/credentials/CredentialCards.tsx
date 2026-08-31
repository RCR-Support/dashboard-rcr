'use client';

import { forwardRef, type CSSProperties } from 'react';
import { format } from 'date-fns';

export interface CredentialApplication {
  id: string;
  workerName: string;
  workerRun: string;
  displayWorkerName: string;
  license: string | null;
  licenseExpiration: Date | null;
  company?: { name: string | null; rut: string } | null;
  contract: {
    contractNumber: string;
    contractName: string;
    initialDate: Date;
    finalDate: Date;
  } | null;
  activities: Array<{ name: string; imageUrl: string | null }>;
  zones: Array<{ name: string }>;
  documentationFiles: Array<{
    url: string;
    type: string;
    documentationId: string | null;
  }>;
}

interface CredentialCardProps {
  application: CredentialApplication;
  qrDataUrl?: string;
  className?: string;
  style?: CSSProperties;
}

export const CREDENTIAL_CARD_WIDTH = 342;
export const CREDENTIAL_CARD_HEIGHT = 216;
export const CREDENTIAL_CARD_MM_WIDTH = 85.6;
export const CREDENTIAL_CARD_MM_HEIGHT = 53.98;

const ACCENT = '#052d4f';
const cardStyle: CSSProperties = {
  width: `${CREDENTIAL_CARD_WIDTH}px`,
  height: `${CREDENTIAL_CARD_HEIGHT}px`,
  fontFamily: 'Arial, Helvetica, sans-serif',
  background: 'white',
  color: 'black',
  overflow: 'hidden',
};

export const CredentialFront = forwardRef<HTMLDivElement, CredentialCardProps>(
  function CredentialFront({ application, className, style }, ref) {
    const workerPhoto = application.documentationFiles.find(
      document => document.type === 'IMG' && !document.documentationId
    )?.url;

    return (
      <div ref={ref} className={className} style={{ ...cardStyle, ...style }}>
        <div
          className="flex items-center justify-between px-4"
          style={{ backgroundColor: ACCENT, height: '38px' }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/logo.svg"
            alt="Logo"
            style={{ height: '24px' }}
            crossOrigin="anonymous"
          />
          <span className="text-white font-bold text-[11px] tracking-wider uppercase">
            Licencia Interna
          </span>
        </div>

        <div
          className="flex px-3 pt-2 pb-1 gap-3"
          style={{ height: `${CREDENTIAL_CARD_HEIGHT - 38 - 22}px` }}
        >
          <div className="flex-shrink-0 flex flex-col items-center">
            <div
              className="rounded-md overflow-hidden bg-gray-200 flex items-center justify-center border border-gray-300"
              style={{ width: '76px', height: '95px' }}
            >
              {workerPhoto ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={workerPhoto}
                  alt="Foto"
                  className="w-full h-full object-cover"
                  crossOrigin="anonymous"
                />
              ) : (
                <span className="text-gray-400 text-3xl font-bold">
                  {application.workerName.charAt(0)}
                </span>
              )}
            </div>
          </div>

          <div className="flex-1 min-w-0 flex flex-col justify-between">
            <div>
              <p className="font-bold text-[12px] leading-tight truncate">
                {application.displayWorkerName}
              </p>
              <p className="text-[9px] text-gray-500 font-medium">
                RUN: {application.workerRun}
              </p>
              <div className="mt-2 space-y-1">
                <div className="text-[8px]">
                  <span className="font-semibold text-gray-700">Empresa:</span>{' '}
                  <span className="text-gray-600">
                    {application.company?.name || '-'}
                  </span>
                </div>
                {application.contract && (
                  <div className="text-[8px]">
                    <span className="font-semibold text-gray-700">Contrato:</span>{' '}
                    <span className="text-gray-600">
                      {application.contract.contractName}
                    </span>
                  </div>
                )}
                {application.license && (
                  <div className="text-[8px]">
                    <span className="font-semibold text-gray-700">Lic. Conducir:</span>{' '}
                    <span className="text-gray-600 font-semibold">
                      {application.license.toUpperCase()}
                    </span>
                  </div>
                )}
                {application.licenseExpiration && (
                  <div className="text-[8px]">
                    <span className="font-semibold" style={{ color: '#ef4444' }}>
                      Vencimiento:
                    </span>{' '}
                    <span className="font-semibold" style={{ color: '#ef4444' }}>
                      {format(new Date(application.licenseExpiration), 'dd/MM/yyyy')}
                    </span>
                  </div>
                )}
              </div>
            </div>
            {application.activities.length > 0 && (
              <div className="mt-1">
                <span className="text-[7px] font-semibold text-gray-700">
                  Actividades:{' '}
                </span>
                <span className="text-[7px] text-gray-500">
                  {application.activities.map(activity => activity.name).join(' · ')}
                </span>
              </div>
            )}
          </div>
        </div>

        <div
          className="flex items-center justify-between px-3"
          style={{ backgroundColor: '#f0f0f0', height: '22px' }}
        >
          <span className="text-[7px] text-gray-500">
            N° {application.id.slice(-8).toUpperCase()}
          </span>
          <span className="text-[7px] text-gray-500">
            Emitida: {format(new Date(), 'dd/MM/yyyy')}
          </span>
        </div>
      </div>
    );
  }
);

export const CredentialBack = forwardRef<HTMLDivElement, CredentialCardProps>(
  function CredentialBack({ application, qrDataUrl, className, style }, ref) {
    return (
      <div ref={ref} className={className} style={{ ...cardStyle, ...style }}>
        <div
          className="flex items-center justify-center px-4"
          style={{ backgroundColor: ACCENT, height: '38px' }}
        >
          <span className="text-white font-bold text-[11px] tracking-wider uppercase">
            Información de Verificación
          </span>
        </div>

        <div
          className="flex px-4 py-2 gap-4"
          style={{ height: `${CREDENTIAL_CARD_HEIGHT - 38 - 22}px` }}
        >
          <div className="flex-shrink-0 flex flex-col items-center justify-center">
            {qrDataUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={qrDataUrl} alt="QR" style={{ width: '100px', height: '100px' }} />
            ) : (
              <div
                className="bg-gray-100 rounded flex items-center justify-center border border-gray-300"
                style={{ width: '100px', height: '100px' }}
              >
                <span className="text-[9px] text-gray-400">QR</span>
              </div>
            )}
            <span className="text-[7px] text-gray-500 mt-1 font-medium">
              Escanear para verificar
            </span>
          </div>

          <div className="flex-1 min-w-0 flex flex-col justify-between text-[8px]">
            <div className="space-y-1.5">
              <div>
                <span className="font-semibold text-gray-700">Titular:</span>{' '}
                <span className="text-gray-600">{application.displayWorkerName}</span>
              </div>
              <div>
                <span className="font-semibold text-gray-700">RUN:</span>{' '}
                <span className="text-gray-600">{application.workerRun}</span>
              </div>
              {application.contract && (
                <div>
                  <span className="font-semibold text-gray-700">Contrato N°:</span>{' '}
                  <span className="text-gray-600">
                    {application.contract.contractNumber}
                  </span>
                </div>
              )}
              {application.zones.length > 0 && (
                <div>
                  <span className="font-semibold text-gray-700">Zonas autorizadas:</span>{' '}
                  <span className="text-gray-600">
                    {application.zones.map(zone => zone.name).join(' · ')}
                  </span>
                </div>
              )}
              {application.activities.length > 0 && (
                <div>
                  <span className="font-semibold text-gray-700">Actividades:</span>{' '}
                  <span className="text-gray-600">
                    {application.activities.map(activity => activity.name).join(' · ')}
                  </span>
                </div>
              )}
            </div>
            <p className="text-[7px] text-gray-400 leading-snug mt-1">
              Esta credencial es personal e intransferible. Presentar junto con cédula
              de identidad vigente.
            </p>
          </div>
        </div>

        <div
          className="flex items-center justify-between px-3"
          style={{ backgroundColor: '#f0f0f0', height: '22px' }}
        >
          <span className="text-[7px] text-gray-500">
            N° {application.id.slice(-8).toUpperCase()}
          </span>
          <span className="text-[7px] text-gray-500">
            {application.company?.name || ''}
          </span>
        </div>
      </div>
    );
  }
);