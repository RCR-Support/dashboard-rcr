import { Button } from '@heroui/button';
import { Card, CardBody, CardHeader } from '@heroui/card';
import { Chip } from '@heroui/chip';
import { CheckCircle, Clock, Download, Eye, FileCheck, FileText, XCircle } from 'lucide-react';

interface ApplicationDocument {
  id: string;
  url: string;
  type: string;
  expiresAt: Date | null;
  approvalStatus?: string | null;
  rejectionReason?: string | null;
  documentation?: { name: string } | null;
}

interface ApplicationDocumentsProps {
  documents: ApplicationDocument[];
  pendingReviewer: string;
  canApprove: boolean;
  canReject: boolean;
  onView: (url: string, type: string, name: string) => void;
  onApprove: (documentId: string) => void;
  onReject: (documentId: string) => void;
}

export function ApplicationDocuments({
  documents,
  pendingReviewer,
  canApprove,
  canReject,
  onView,
  onApprove,
  onReject,
}: ApplicationDocumentsProps) {
  return (
    <Card>
      <CardHeader>
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <FileCheck className="w-5 h-5" />
          Documentos Adjuntos ({documents.length})
        </h2>
      </CardHeader>
      <CardBody>
        {documents.length > 0 ? (
          <div className="space-y-3">
            {documents.map((document) => {
              const approvalStatus = document.approvalStatus || 'pending';
              const documentName = document.documentation?.name || 'Documento';

              return (
                <div
                  key={document.id}
                  className={`flex items-center justify-between p-4 border rounded-lg hover:bg-default-100 transition-colors ${
                    approvalStatus === 'approved' ? 'border-l-4 border-l-success bg-success-50/40 dark:bg-success-900/20' :
                    approvalStatus === 'rejected' ? 'border-l-4 border-l-danger bg-danger-50/40 dark:bg-danger-900/20' :
                    'border-l-4 border-l-warning'
                  }`}
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div className={`p-2 rounded ${document.type === 'PDF' ? 'bg-red-100 dark:bg-red-900/30' : 'bg-blue-100 dark:bg-blue-900/30'}`}>
                      <FileText className={`w-5 h-5 ${document.type === 'PDF' ? 'text-red-600 dark:text-red-400' : 'text-blue-600 dark:text-blue-400'}`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{documentName}</p>
                        {approvalStatus === 'approved' && <Chip size="sm" color="success" variant="flat" startContent={<CheckCircle className="w-3 h-3" />}>Aprobado</Chip>}
                        {approvalStatus === 'rejected' && <Chip size="sm" color="danger" variant="flat" startContent={<XCircle className="w-3 h-3" />}>Rechazado</Chip>}
                        {approvalStatus === 'pending' && <Chip size="sm" color="warning" variant="flat" startContent={<Clock className="w-3 h-3" />}>Pendiente · {pendingReviewer}</Chip>}
                      </div>
                      {document.expiresAt && <p className="text-sm text-default-500">Vence: {new Date(document.expiresAt).toLocaleDateString('es-CL')}</p>}
                      {document.rejectionReason && <p className="text-sm text-danger mt-1">Motivo: {document.rejectionReason}</p>}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="flat" color="primary" isIconOnly onPress={() => onView(document.url, document.type, documentName)} aria-label="Ver documento">
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="flat" color="default" isIconOnly as="a" href={document.url} target="_blank" rel="noopener noreferrer" aria-label="Descargar documento">
                      <Download className="w-4 h-4" />
                    </Button>
                    {canApprove && approvalStatus === 'pending' && (
                      <Button size="sm" variant="flat" color="success" isIconOnly onPress={() => onApprove(document.id)} aria-label="Aprobar documento">
                        <CheckCircle className="w-4 h-4" />
                      </Button>
                    )}
                    {canReject && approvalStatus === 'pending' && (
                      <Button size="sm" variant="flat" color="danger" isIconOnly onPress={() => onReject(document.id)} aria-label="Rechazar documento">
                        <XCircle className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-default-300 bg-default-50 p-4">
            <p className="text-sm font-medium">No hay documentos adjuntos en esta solicitud.</p>
            <p className="mt-1 text-sm text-default-500">Si existían documentos en una versión anterior y fueron eliminados, ya no estarán disponibles aquí.</p>
          </div>
        )}
      </CardBody>
    </Card>
  );
}