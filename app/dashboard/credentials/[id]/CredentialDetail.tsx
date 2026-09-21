'use client';

import { useRef, useState, useEffect } from 'react';
import { Button, Card, CardBody, Chip } from '@heroui/react';
import { ArrowLeft, Download, Printer, CreditCard, RotateCcw } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import Link from 'next/link';
import QRCode from 'qrcode';
import {
  CredentialBack,
  CredentialFront,
  CREDENTIAL_CARD_MM_HEIGHT,
  CREDENTIAL_CARD_MM_WIDTH,
  type CredentialApplication,
} from '@/components/ui/dashboard/credentials/CredentialCards';

interface Props {
  application: CredentialApplication & { qr?: { token: string; isActive: boolean } | null };
}

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
        format: [CREDENTIAL_CARD_MM_WIDTH, CREDENTIAL_CARD_MM_HEIGHT],
      });

      // Page 1 — Front
      pdf.addImage(frontCanvas.toDataURL('image/png'), 'PNG', 0, 0, CREDENTIAL_CARD_MM_WIDTH, CREDENTIAL_CARD_MM_HEIGHT);

      // Page 2 — Back
      pdf.addPage([CREDENTIAL_CARD_MM_WIDTH, CREDENTIAL_CARD_MM_HEIGHT], 'landscape');
      pdf.addImage(backCanvas.toDataURL('image/png'), 'PNG', 0, 0, CREDENTIAL_CARD_MM_WIDTH, CREDENTIAL_CARD_MM_HEIGHT);

      pdf.save(`credencial-${application.workerRun}.pdf`);
    } catch (error) {
      console.error('Error generando PDF:', error);
    } finally {
      setIsGenerating(false);
    }
  };

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
            {previewSide === 'front' ? (
              <CredentialFront application={application} className="rounded-lg" />
            ) : (
              <CredentialBack
                application={application}
                qrDataUrl={qrDataUrl}
                className="rounded-lg"
              />
            )}
          </div>
        </div>
      </div>

      {/* ── Offscreen area for PDF capture (both always rendered) ── */}
      <div
        className="fixed print:hidden"
        style={{ left: '-9999px', top: 0 }}
        aria-hidden="true"
      >
        <CredentialFront ref={frontRef} application={application} />
        <CredentialBack ref={backRef} application={application} qrDataUrl={qrDataUrl} />
      </div>
    </div>
  );
}
