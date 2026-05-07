'use client';

import { useRef, useState, useEffect } from 'react';
import { Button, Card, CardBody, Chip } from '@heroui/react';
import { ArrowLeft, Download, Printer, CreditCard, RotateCcw } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import Link from 'next/link';
import QRCode from 'qrcode';

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

interface Props {
  application: Application;
}

/* ── Card dimensions ─────────────────────────────────
 * ISO/IEC 7810 ID-1 (credit card / cédula):
 *   85.6 mm × 53.98 mm  →  342 px × 216 px  (4 px/mm)
 * ────────────────────────────────────────────────── */
const CARD_W = 342;
const CARD_H = 216;
const CARD_MM_W = 85.6;
const CARD_MM_H = 53.98;
const ACCENT = '#052d4f';

export default function CredentialDetail({ application }: Props) {
  const frontRef = useRef<HTMLDivElement>(null);
  const backRef = useRef<HTMLDivElement>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewSide, setPreviewSide] = useState<'front' | 'back'>('front');

  const workerPhoto = application.documentationFiles.find(
    doc => doc.type === 'IMG' && !doc.documentationId
  )?.url;

  const isExpired = application.licenseExpiration
    ? new Date(application.licenseExpiration) < new Date()
    : false;

  const qrUrl = application.qr?.token
    ? `${typeof window !== 'undefined' ? window.location.origin : ''}/applications/status/${application.qr.token}`
    : '';

  useEffect(() => {
    if (qrUrl) {
      QRCode.toDataURL(qrUrl, {
        width: 200,
        margin: 1,
        color: { dark: '#000000', light: '#ffffff' },
      }).then(setQrDataUrl);
    }
  }, [qrUrl]);

  const handlePrint = () => window.print();

  const handleDownloadPDF = async () => {
    if (!frontRef.current || !backRef.current) return;
    setIsGenerating(true);

    try {
      const html2canvas = (await import('html2canvas-pro')).default;
      const { jsPDF } = await import('jspdf');

      const opts = { scale: 4, useCORS: true, backgroundColor: '#ffffff' };

      const [frontCanvas, backCanvas] = await Promise.all([
        html2canvas(frontRef.current, opts),
        html2canvas(backRef.current, opts),
      ]);

      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: [CARD_MM_W, CARD_MM_H],
      });

      // Page 1 — Front
      pdf.addImage(frontCanvas.toDataURL('image/png'), 'PNG', 0, 0, CARD_MM_W, CARD_MM_H);

      // Page 2 — Back
      pdf.addPage([CARD_MM_W, CARD_MM_H], 'landscape');
      pdf.addImage(backCanvas.toDataURL('image/png'), 'PNG', 0, 0, CARD_MM_W, CARD_MM_H);

      pdf.save(`credencial-${application.workerRun}.pdf`);
    } catch (error) {
      console.error('Error generando PDF:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  /* ── Shared card wrapper style ────────────────────── */
  const cardStyle: React.CSSProperties = {
    width: `${CARD_W}px`,
    height: `${CARD_H}px`,
    fontFamily: 'Arial, Helvetica, sans-serif',
  };

  /* ── Card face renderers (reused in preview + offscreen PDF area) ── */
  const renderFront = (ref?: React.RefObject<HTMLDivElement>) => (
    <div
      ref={ref}
      className="bg-white text-black overflow-hidden rounded-lg"
      style={cardStyle}
    >
      {/* Header bar */}
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

      {/* Body */}
      <div className="flex px-3 pt-2 pb-1 gap-3" style={{ height: `${CARD_H - 38 - 22}px` }}>
        {/* Photo column */}
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

        {/* Info column */}
        <div className="flex-1 min-w-0 flex flex-col justify-between">
          <div>
            <p className="font-bold text-[12px] leading-tight truncate">
              {application.displayWorkerName}
            </p>
            <p className="text-[9px] text-gray-500 font-medium">RUN: {application.workerRun}</p>

            <div className="mt-2 space-y-1">
              <div className="text-[8px]">
                <span className="font-semibold text-gray-700">Empresa:</span>{' '}
                <span className="text-gray-600">{application.company?.name || '-'}</span>
              </div>
              {application.contract && (
                <div className="text-[8px]">
                  <span className="font-semibold text-gray-700">Contrato:</span>{' '}
                  <span className="text-gray-600">{application.contract.contractName}</span>
                </div>
              )}
              {application.license && (
                <div className="text-[8px]">
                  <span className="font-semibold text-gray-700">Lic. Conducir:</span>{' '}
                  <span className="text-gray-600 font-semibold">{application.license.toUpperCase()}</span>
                </div>
              )}
              {application.licenseExpiration && (
                <div className="text-[8px]">
                  <span className="font-semibold" style={{ color: '#ef4444' }}>Vencimiento:</span>{' '}
                  <span className="font-semibold" style={{ color: '#ef4444' }}>
                    {format(new Date(application.licenseExpiration), 'dd/MM/yyyy')}
                  </span>
                </div>
              )}
            </div>
          </div>

          {application.activities.length > 0 && (
            <div className="mt-1">
              <span className="text-[7px] font-semibold text-gray-700">Actividades: </span>
              <span className="text-[7px] text-gray-500">
                {application.activities.map(a => a.name).join(' · ')}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
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

  const renderBack = (ref?: React.RefObject<HTMLDivElement>) => (
    <div
      ref={ref}
      className="bg-white text-black overflow-hidden rounded-lg"
      style={cardStyle}
    >
      {/* Header bar */}
      <div
        className="flex items-center justify-center px-4"
        style={{ backgroundColor: ACCENT, height: '38px' }}
      >
        <span className="text-white font-bold text-[11px] tracking-wider uppercase">
          Información de Verificación
        </span>
      </div>

      {/* Body */}
      <div className="flex px-4 py-2 gap-4" style={{ height: `${CARD_H - 38 - 22}px` }}>
        {/* QR column */}
        <div className="flex-shrink-0 flex flex-col items-center justify-center">
          {qrDataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={qrDataUrl}
              alt="QR"
              style={{ width: '100px', height: '100px' }}
            />
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

        {/* Info column */}
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
                <span className="text-gray-600">{application.contract.contractNumber}</span>
              </div>
            )}
            {application.zones.length > 0 && (
              <div>
                <span className="font-semibold text-gray-700">Zonas autorizadas:</span>{' '}
                <span className="text-gray-600">
                  {application.zones.map(z => z.name).join(' · ')}
                </span>
              </div>
            )}
            {application.activities.length > 0 && (
              <div>
                <span className="font-semibold text-gray-700">Actividades:</span>{' '}
                <span className="text-gray-600">
                  {application.activities.map(a => a.name).join(' · ')}
                </span>
              </div>
            )}
          </div>

          <p className="text-[7px] text-gray-400 leading-snug mt-1">
            Esta credencial es personal e intransferible.
            Presentar junto con cédula de identidad vigente.
          </p>
        </div>
      </div>

      {/* Footer */}
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

  return (
    <div className="container mx-auto py-6 px-4">
      {/* ── Top bar ────────────────────────────────── */}
      <div className="flex items-center justify-between mb-6 print:hidden">
        <Link href="/dashboard/credentials">
          <Button variant="light" startContent={<ArrowLeft className="h-4 w-4" />}>
            Volver al listado
          </Button>
        </Link>
        <div className="flex gap-2 flex-wrap">
          <Button
            color="default"
            variant="flat"
            startContent={<Printer className="h-4 w-4" />}
            onPress={handlePrint}
          >
            Imprimir
          </Button>
          <Button
            color="primary"
            variant="flat"
            startContent={<CreditCard className="h-4 w-4" />}
            onPress={() => window.open(`/print/credential/${application.id}`, '_blank')}
          >
            Imprimir en máquina
          </Button>
          <Button
            color="primary"
            startContent={<Download className="h-4 w-4" />}
            onPress={handleDownloadPDF}
            isLoading={isGenerating}
          >
            Descargar PDF
          </Button>
        </div>
      </div>

      {/* ── Application info ───────────────────────── */}
      <Card className="mb-6 print:hidden">
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-default-500">Trabajador</p>
              <p className="font-semibold">{application.displayWorkerName}</p>
              <p className="text-sm text-default-500">RUN: {application.workerRun}</p>
            </div>
            <div>
              <p className="text-sm text-default-500">Empresa</p>
              <p className="font-semibold">{application.company?.name || 'Sin empresa'}</p>
              {application.contract && (
                <p className="text-sm text-default-500">
                  Contrato: {application.contract.contractName}
                </p>
              )}
            </div>
            <div>
              <p className="text-sm text-default-500">Estado</p>
              <Chip color={isExpired ? 'danger' : 'success'} variant="flat" size="sm">
                {isExpired ? 'VENCIDA' : 'VIGENTE'}
              </Chip>
              {application.licenseExpiration && (
                <p className="text-sm text-default-500 mt-1">
                  Vence: {format(new Date(application.licenseExpiration), 'dd MMM yyyy', { locale: es })}
                </p>
              )}
            </div>
          </div>
          {application.activities.length > 0 && (
            <div className="mt-4">
              <p className="text-sm text-default-500 mb-1">Actividades autorizadas</p>
              <div className="flex flex-wrap gap-1">
                {application.activities.map((act, i) => (
                  <Chip key={i} size="sm" variant="flat">{act.name}</Chip>
                ))}
              </div>
            </div>
          )}
          {application.zones.length > 0 && (
            <div className="mt-2">
              <p className="text-sm text-default-500 mb-1">Zonas</p>
              <div className="flex flex-wrap gap-1">
                {application.zones.map((z, i) => (
                  <Chip key={i} size="sm" variant="flat" color="secondary">{z.name}</Chip>
                ))}
              </div>
            </div>
          )}
        </CardBody>
      </Card>

      {/* ── Side toggle ────────────────────────────── */}
      <div className="flex justify-center mb-4 print:hidden">
        <div className="inline-flex items-center gap-2 bg-default-100 rounded-lg p-1">
          <Button
            size="sm"
            variant={previewSide === 'front' ? 'solid' : 'light'}
            color={previewSide === 'front' ? 'primary' : 'default'}
            onPress={() => setPreviewSide('front')}
          >
            Frente
          </Button>
          <Button
            size="sm"
            variant={previewSide === 'back' ? 'solid' : 'light'}
            color={previewSide === 'back' ? 'primary' : 'default'}
            startContent={<RotateCcw className="h-3 w-3" />}
            onPress={() => setPreviewSide('back')}
          >
            Reverso
          </Button>
        </div>
      </div>

      {/* ── Credential preview (visible) ───────────── */}
      <div className="flex justify-center">
        <div className="border-2 border-dashed border-default-300 rounded-xl p-6 print:border-0 print:p-0">
          <p className="text-sm text-default-500 text-center mb-4 print:hidden">
            <CreditCard className="inline h-4 w-4 mr-1" />
            Vista previa — {previewSide === 'front' ? 'Frente' : 'Reverso'} (85.6 × 54 mm)
          </p>
          <div className="flex justify-center">
            {previewSide === 'front' ? renderFront() : renderBack()}
          </div>
        </div>
      </div>

      {/* ── Offscreen area for PDF capture (both always rendered) ── */}
      <div
        className="fixed print:hidden"
        style={{ left: '-9999px', top: 0 }}
        aria-hidden="true"
      >
        {renderFront(frontRef)}
        {renderBack(backRef)}
      </div>
    </div>
  );
}
