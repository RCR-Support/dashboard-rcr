'use client';

import { Card, CardBody, CardHeader } from '@heroui/card';
import { Chip } from '@heroui/chip';
import { Button } from '@heroui/button';
import { Divider } from '@heroui/divider';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from '@heroui/modal';
import { Select, SelectItem } from '@heroui/select';
import { Textarea } from '@heroui/input';
import Image from 'next/image';
import { FileText, Download, CheckCircle, XCircle, Clock, User, Building2, FileCheck, Calendar, Eye, AlertCircle, Edit } from 'lucide-react';
import Swal from 'sweetalert2';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { approveApplicationAC, rejectApplicationAC } from '@/actions/applications/approve-reject-ac';
import { approveApplicationSHEQ, rejectApplicationSHEQ } from '@/actions/applications/approve-reject-sheq';
import { approveDocument } from '@/actions/applications/approve-document';
import { rejectDocument } from '@/actions/applications/reject-document';
import { usePermissions } from '@/hooks/usePermissions';

interface SheqUser {
  id: string;
  displayName: string;
  email: string;
}

interface ApplicationDetailProps {
  application: {
    id: string;
    workerName: string;
    workerPaternal: string;
    workerMaternal: string;
    workerRun: string;
    license: string | null;
    licenseExpiration: Date | null;
    status: string;
    processStatus: string;
    stateAc: string;
    stateSheq: string;
    createdAt: Date;
    company: {
      name: string | null;
      phone?: string | null;
    } | null;
    contract: {
      contractNumber: string;
      contractName: string;
      initialDate: Date;
      finalDate: Date;
    } | null;
    userAc: {
      id: string;
      displayName: string;
      email: string;
    } | null;
    userSheq: {
      id: string;
      displayName: string;
      email: string;
    } | null;
    activities: Array<{
      id: string;
      name: string;
    }>;
    documentationFiles: Array<{
      id: string;
      url: string;
      type: string;
      expiresAt: Date | null;
      documentationId: string | null;
      approvalStatus?: string | null;
      rejectionReason?: string | null;
      documentation?: {
        name: string;
      } | null;
    }>;
    audits: Array<{
      id: string;
      action: string;
      changedAt: Date;
      details: string | null;
      changedBy: {
        displayName: string;
        email: string;
      };
    }>;
    versions?: Array<{
      id: string;
      isActive: boolean;
      processStatus: string;
    }>;
  };
  userRoles: string[];
  userId: string;
  sheqUsers: SheqUser[];
  versioningAvailable: boolean;
}

const stateAcColorMap: Record<string, 'success' | 'warning' | 'danger'> = {
  aprobado: 'success',
  pendiente: 'warning',
  adjuntar: 'danger',
};

const stateSheqColorMap: Record<string, 'success' | 'warning' | 'danger'> = {
  aprobado: 'success',
  pendiente: 'warning',
  rechazado: 'danger',
};

const actionLabels: Record<string, string> = {
  CREACION: 'Creación',
  EDICION: 'Edición',
  APROBACION: 'Aprobación',
  RECHAZO: 'Rechazo',
  OBSERVACION: 'Observación',
  ELIMINACION: 'Eliminación',
};

export function ApplicationDetail({ application, userRoles, userId, sheqUsers, versioningAvailable }: ApplicationDetailProps) {
  const router = useRouter();
  const { can } = usePermissions();
  
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerDocument, setViewerDocument] = useState<{ url: string; type: string; name: string } | null>(null);
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedSheq, setSelectedSheq] = useState<string>('');
  const [observations, setObservations] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [rejectDocModalOpen, setRejectDocModalOpen] = useState(false);
  const [selectedDocId, setSelectedDocId] = useState<string>('');
  
  // ✅ Verificar permisos granulares
  const canApproveDocuments = can('documents:approve');
  const canRejectDocuments = can('documents:reject');
  const [docRejectionReason, setDocRejectionReason] = useState('');

  const workerFullName = `${application.workerName} ${application.workerPaternal} ${application.workerMaternal}`;
  
  // Foto del trabajador
  const workerPhoto = application.documentationFiles.find(
    doc => doc.type === 'IMG' && !doc.documentationId
  )?.url;

  // Documentos (excluyendo la foto de credencial y documentos huérfanos)
  const documents = application.documentationFiles.filter(
    doc => doc.documentationId !== null && !(doc.type === 'IMG' && !doc.documentationId)
  );

  // Verificar estado de revisión de documentos
  const docsApproved = documents.filter(d => (d as any).approvalStatus === 'approved').length;
  const docsRejected = documents.filter(d => (d as any).approvalStatus === 'rejected').length;
  const docsPending = documents.filter(d => !((d as any).approvalStatus) || (d as any).approvalStatus === 'pending').length;
  const allDocsReviewed = docsPending === 0; // Todos revisados (aprobados o rechazados)
  const allDocsApproved = docsApproved === documents.length && documents.length > 0; // Todos aprobados

  const isAdmin = userRoles.includes('admin');

  const canApproveAC = (userRoles.includes('adminContractor') && 
                       application.stateAc === 'pendiente' &&
                       application.userAc?.id && 
                       userId === application.userAc.id) ||
                       (isAdmin && application.stateAc === 'pendiente');
                       
  const canApproveSHEQ = (userRoles.includes('sheq') && 
                         application.stateAc === 'aprobado' && 
                         application.stateSheq === 'pendiente' &&
                         application.userSheq?.id &&
                         userId === application.userSheq.id) ||
                         (isAdmin && application.stateAc === 'aprobado' && application.stateSheq === 'pendiente');

  // Indica si el admin está actuando en representación
  const adminActingAsAC = isAdmin && !userRoles.includes('adminContractor') && canApproveAC;
  const adminActingAsSHEQ = isAdmin && !userRoles.includes('sheq') && canApproveSHEQ;

  // Usuario puede editar si es su solicitud y está rechazada (adjuntar)
  const canEdit = userRoles.includes('user') && 
                  application.stateAc === 'adjuntar';

  // Usuario puede crear nueva versión si la solicitud está aprobada
  const canCreateNewVersion = versioningAvailable &&
                              (userRoles.includes('user') || isAdmin) &&
                              application.processStatus === 'aprobado' &&
                              application.stateAc === 'aprobado' &&
                              application.stateSheq === 'aprobado';

  // Verificar si hay una versión pendiente de revisión
  const hasPendingVersion = application.versions?.some(
    (version) => version.isActive === false && (version.processStatus === 'pendiente' || version.processStatus === 'enRevision')
  );

  const handleViewDocument = (url: string, type: string, name: string) => {
    setViewerDocument({ url, type, name });
    setViewerOpen(true);
  };

  const handleApproveAC = async () => {
    if (!selectedSheq) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Debes seleccionar un revisor SHEQ',
      });
      return;
    }

    setIsLoading(true);
    const result = await approveApplicationAC(application.id, userId, selectedSheq);
    setIsLoading(false);

    if (result.success) {
      Swal.fire({
        icon: 'success',
        title: 'Aprobado',
        text: result.message,
      });
      setApproveModalOpen(false);
      router.refresh();
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: result.message,
      });
    }
  };

  const handleRejectAC = async () => {
    // Si hay documentos rechazados, las observaciones son opcionales
    if (docsRejected === 0 && !observations.trim()) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Debes indicar las observaciones del rechazo o rechazar documentos específicos',
      });
      return;
    }

    // Si no hay observaciones adicionales, usar resumen de documentos rechazados
    const finalObservations = observations.trim() || 
      `Documentos rechazados: ${documents.filter(d => (d as any).approvalStatus === 'rejected').map(d => d.documentation?.name).join(', ')}`;

    setIsLoading(true);
    const result = await rejectApplicationAC(application.id, userId, finalObservations);
    setIsLoading(false);

    if (result.success) {
      Swal.fire({
        icon: 'success',
        title: 'Rechazado',
        text: result.message,
      });
      setRejectModalOpen(false);
      router.refresh();
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: result.message,
      });
    }
  };

  const handleApproveSHEQ = async () => {
    setIsLoading(true);
    const result = await approveApplicationSHEQ(application.id, userId);
    setIsLoading(false);

    if (result.success) {
      Swal.fire({
        icon: 'success',
        title: 'Aprobado',
        text: result.message,
      });
      router.refresh();
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: result.message,
      });
    }
  };

  const handleRejectSHEQ = async () => {
    // Si hay documentos rechazados, las observaciones son opcionales
    if (docsRejected === 0 && !observations.trim()) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Debes indicar las observaciones del rechazo o rechazar documentos específicos',
      });
      return;
    }

    // Si no hay observaciones adicionales, usar resumen de documentos rechazados
    const finalObservations = observations.trim() || 
      `Documentos rechazados: ${documents.filter(d => (d as any).approvalStatus === 'rejected').map(d => d.documentation?.name).join(', ')}`;

    setIsLoading(true);
    const result = await rejectApplicationSHEQ(application.id, userId, finalObservations);
    setIsLoading(false);

    if (result.success) {
      Swal.fire({
        icon: 'success',
        title: 'Rechazado',
        text: result.message,
      });
      setRejectModalOpen(false);
      router.refresh();
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: result.message,
      });
    }
  };

  const handleApproveDocument = async (documentId: string) => {
    const result = await approveDocument(documentId);
    if (result.success) {
      Swal.fire({
        icon: 'success',
        title: 'Documento Aprobado',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 2000,
      });
      router.refresh();
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: result.error,
      });
    }
  };

  const handleRejectDocumentClick = (documentId: string) => {
    setSelectedDocId(documentId);
    setDocRejectionReason('');
    setRejectDocModalOpen(true);
  };

  const handleConfirmRejectDocument = async () => {
    if (!docRejectionReason.trim()) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Debes indicar por qué rechazas este documento',
      });
      return;
    }

    const result = await rejectDocument(selectedDocId, docRejectionReason);
    if (result.success) {
      Swal.fire({
        icon: 'success',
        title: 'Documento Rechazado',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 2000,
      });
      setRejectDocModalOpen(false);
      router.refresh();
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: result.error,
      });
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Revisión de Solicitud</h1>
        <p className="text-default-500">ID: {application.id}</p>
      </div>

      {/* Estados y Acciones */}
      <Card className="mb-6">
        <CardBody>
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex gap-3 items-center">
              <div>
                <p className="text-sm text-default-500 mb-1">Admin. Contrato</p>
                <Chip color={stateAcColorMap[application.stateAc]} variant="flat">
                  {application.stateAc.toUpperCase()}
                </Chip>
              </div>
              <div>
                <p className="text-sm text-default-500 mb-1">SHEQ</p>
                <Chip color={stateSheqColorMap[application.stateSheq]} variant="flat">
                  {application.stateSheq.toUpperCase()}
                </Chip>
              </div>
            </div>

            {/* Botones de acción según rol */}
            {canEdit && (
              <div className="flex gap-2">
                <Button 
                  color="warning" 
                  startContent={<Edit className="w-4 h-4" />} 
                  onPress={() => router.push(`/dashboard/applications/${application.id}/edit`)}
                >
                  Editar Solicitud
                </Button>
              </div>
            )}

            {canCreateNewVersion && !hasPendingVersion && (
              <div className="flex flex-col gap-1">
                <Button 
                  color="primary" 
                  variant="flat"
                  startContent={<Edit className="w-4 h-4" />} 
                  onPress={() => router.push(`/dashboard/applications/${application.id}/edit`)}
                >
                  Actualizar Solicitud
                </Button>
                <p className="text-xs text-default-400">Se creará una nueva versión. La credencial actual sigue vigente.</p>
              </div>
            )}

            {canCreateNewVersion && hasPendingVersion && (
              <div className="flex flex-col gap-1">
                <p className="text-xs text-warning">Ya hay una nueva versión en revisión.</p>
              </div>
            )}

            {canApproveAC && (
              <div className="flex gap-2">
                {adminActingAsAC && (
                  <Chip color="warning" variant="flat" size="sm" className="self-center">
                    Actuando como Admin Contractor
                  </Chip>
                )}
                <div className="flex flex-col items-end gap-1">
                  <Button 
                    color="success" 
                    startContent={<CheckCircle className="w-4 h-4" />} 
                    onPress={() => setApproveModalOpen(true)}
                    isDisabled={!allDocsApproved}
                  >
                    Aprobar
                  </Button>
                  {!allDocsApproved && (
                    <p className="text-xs text-warning">
                      {docsPending > 0 ? `Revisa todos los documentos primero (${docsPending} pendientes)` : 
                       docsRejected > 0 ? `Hay ${docsRejected} documento(s) rechazado(s)` : 
                       'Aprueba todos los documentos primero'}
                    </p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-1">
                  <Button 
                    color="danger" 
                    variant="bordered" 
                    startContent={<XCircle className="w-4 h-4" />} 
                    onPress={() => setRejectModalOpen(true)}
                    isDisabled={!allDocsReviewed}
                  >
                    Rechazar
                  </Button>
                  {!allDocsReviewed && (
                    <p className="text-xs text-warning">Revisa todos los documentos primero</p>
                  )}
                </div>
              </div>
            )}

            {canApproveSHEQ && (
              <div className="flex gap-2">
                {adminActingAsSHEQ && (
                  <Chip color="warning" variant="flat" size="sm" className="self-center">
                    Actuando como SHEQ
                  </Chip>
                )}
                <div className="flex flex-col items-end gap-1">
                  <Button 
                    color="success" 
                    startContent={<CheckCircle className="w-4 h-4" />} 
                    onPress={handleApproveSHEQ} 
                    isLoading={isLoading}
                    isDisabled={!allDocsApproved}
                  >
                    Aprobar
                  </Button>
                  {!allDocsApproved && (
                    <p className="text-xs text-warning">
                      {docsPending > 0 ? `Revisa todos los documentos primero (${docsPending} pendientes)` : 
                       docsRejected > 0 ? `Hay ${docsRejected} documento(s) rechazado(s)` : 
                       'Aprueba todos los documentos primero'}
                    </p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-1">
                  <Button 
                    color="danger" 
                    variant="bordered" 
                    startContent={<XCircle className="w-4 h-4" />} 
                    onPress={() => setRejectModalOpen(true)}
                    isDisabled={!allDocsReviewed}
                  >
                    Rechazar
                  </Button>
                  {!allDocsReviewed && (
                    <p className="text-xs text-warning">Revisa todos los documentos primero</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </CardBody>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna Izquierda: Foto y Datos del Trabajador */}
        <div className="space-y-6">
          {/* Foto */}
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <User className="w-5 h-5" />
                Fotografía
              </h2>
            </CardHeader>
            <CardBody>
              <div className="relative w-full max-w-[120px] mx-auto aspect-[3/4] rounded-lg overflow-hidden bg-gray-100">
                {workerPhoto ? (
                  <Image
                    src={workerPhoto}
                    alt={workerFullName}
                    fill
                    className="object-cover"
                    sizes="120px"
                    quality={90}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <User className="w-16 h-16 text-gray-400" />
                  </div>
                )}
              </div>
            </CardBody>
          </Card>

          {/* Datos del Trabajador */}
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold">Información Personal</h2>
            </CardHeader>
            <CardBody className="space-y-3">
              <div>
                <p className="text-sm text-default-500">Nombre Completo</p>
                <p className="font-medium">{workerFullName}</p>
              </div>
              <Divider />
              <div>
                <p className="text-sm text-default-500">RUN</p>
                <p className="font-medium">{application.workerRun}</p>
              </div>
              {application.licenseExpiration && (
                <>
                  <Divider />
                  <div>
                    <p className="text-sm text-default-500 flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Vencimiento de Acreditación
                    </p>
                    <p className="font-medium text-orange-600">
                      {new Date(application.licenseExpiration).toLocaleDateString('es-CL')}
                    </p>
                  </div>
                </>
              )}
            </CardBody>
          </Card>

          {/* Información del Contrato */}
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Contrato y Empresa
              </h2>
            </CardHeader>
            <CardBody className="space-y-3">
              <div>
                <p className="text-sm text-default-500">Empresa</p>
                <p className="font-medium">{application.company?.name}</p>
              </div>
              <Divider />
              <div>
                <p className="text-sm text-default-500">Contrato</p>
                <p className="font-medium">{application.contract?.contractName}</p>
                <p className="text-sm text-default-400">N° {application.contract?.contractNumber}</p>
              </div>
              {application.contract && (
                <>
                  <Divider />
                  <div>
                    <p className="text-sm text-default-500">Vigencia del Contrato</p>
                    <p className="text-sm">
                      {new Date(application.contract.initialDate).toLocaleDateString('es-CL')} - 
                      {new Date(application.contract.finalDate).toLocaleDateString('es-CL')}
                    </p>
                  </div>
                </>
              )}
              {application.userAc && (
                <>
                  <Divider />
                  <div>
                    <p className="text-sm text-default-500">Administrador de Contrato</p>
                    <p className="font-medium">{application.userAc.displayName}</p>
                    <p className="text-sm text-default-400">{application.userAc.email}</p>
                  </div>
                </>
              )}
            </CardBody>
          </Card>
        </div>

        {/* Columna Derecha: Actividades y Documentos */}
        <div className="lg:col-span-2 space-y-6">
          {/* Actividades */}
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold">Actividades Solicitadas</h2>
            </CardHeader>
            <CardBody>
              {application.activities.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {application.activities.map(activity => (
                    <Chip key={activity.id} color="primary" variant="flat">
                      {activity.name}
                    </Chip>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-default-500">No hay actividades asociadas a esta solicitud.</p>
              )}
            </CardBody>
          </Card>

          {/* Documentos */}
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
                  {documents.map((doc) => {
                  const approvalStatus = (doc as any).approvalStatus || 'pending';
                  
                  return (
                    <div 
                      key={doc.id} 
                      className={`flex items-center justify-between p-4 border rounded-lg hover:bg-default-100 transition-colors ${
                        approvalStatus === 'approved' ? 'border-l-4 border-l-success bg-success-50/40 dark:bg-success-900/20' :
                        approvalStatus === 'rejected' ? 'border-l-4 border-l-danger bg-danger-50/40 dark:bg-danger-900/20' :
                        'border-l-4 border-l-warning'
                      }`}
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <div className={`p-2 rounded ${doc.type === 'PDF' ? 'bg-red-100 dark:bg-red-900/30' : 'bg-blue-100 dark:bg-blue-900/30'}`}>
                          <FileText className={`w-5 h-5 ${doc.type === 'PDF' ? 'text-red-600 dark:text-red-400' : 'text-blue-600 dark:text-blue-400'}`} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{doc.documentation?.name || 'Documento'}</p>
                            {approvalStatus === 'approved' && (
                              <Chip size="sm" color="success" variant="flat">Aprobado</Chip>
                            )}
                            {approvalStatus === 'rejected' && (
                              <Chip size="sm" color="danger" variant="flat">Rechazado</Chip>
                            )}
                            {approvalStatus === 'pending' && (
                              <Chip size="sm" color="warning" variant="flat">Pendiente</Chip>
                            )}
                          </div>
                          {doc.expiresAt && (
                            <p className="text-sm text-default-500">
                              Vence: {new Date(doc.expiresAt).toLocaleDateString('es-CL')}
                            </p>
                          )}
                          {(doc as any).rejectionReason && (
                            <p className="text-sm text-danger mt-1">
                              Motivo: {(doc as any).rejectionReason}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="flat"
                          color="primary"
                          isIconOnly
                          onPress={() => handleViewDocument(doc.url, doc.type, doc.documentation?.name || 'Documento')}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="flat"
                          color="default"
                          isIconOnly
                          as="a"
                          href={doc.url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                        
                        {/* Botones de aprobación/rechazo solo para revisores */}
                        {/* Aprobar: se muestra si no está ya aprobado (permite cambiar desde rechazado) */}
                        {canApproveDocuments && approvalStatus !== 'approved' && (
                          <Button
                            size="sm"
                            variant="flat"
                            color="success"
                            isIconOnly
                            onPress={() => handleApproveDocument(doc.id)}
                            title="Aprobar documento"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </Button>
                        )}
                        {/* Rechazar: se muestra si no está ya rechazado (permite cambiar desde aprobado) */}
                        {canRejectDocuments && approvalStatus !== 'rejected' && (
                          <Button
                            size="sm"
                            variant="flat"
                            color="danger"
                            isIconOnly
                            onPress={() => handleRejectDocumentClick(doc.id)}
                            title="Rechazar documento"
                          >
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
                  <p className="mt-1 text-sm text-default-500">
                    Si existían documentos en una versión anterior y fueron eliminados, ya no estarán disponibles aquí.
                  </p>
                </div>
              )}
            </CardBody>
          </Card>

          {/* Historial de Revisión */}
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Historial
              </h2>
            </CardHeader>
            <CardBody className="space-y-3">
              <div>
                <p className="text-sm text-default-500">Fecha de Solicitud</p>
                <p className="font-medium">{new Date(application.createdAt).toLocaleString('es-CL')}</p>
              </div>
              
              {application.userAc && (
                <>
                  <Divider />
                  <div>
                    <p className="text-sm text-default-500">Admin. Contrato Asignado</p>
                    <p className="font-medium">{application.userAc.displayName}</p>
                    <p className="text-sm text-default-400">{application.userAc.email}</p>
                  </div>
                </>
              )}
              
              {application.userSheq && (
                <>
                  <Divider />
                  <div>
                    <p className="text-sm text-default-500">SHEQ Asignado</p>
                    <p className="font-medium">{application.userSheq.displayName}</p>
                    <p className="text-sm text-default-400">{application.userSheq.email}</p>
                  </div>
                </>
              )}

              <Divider />
              <div>
                <p className="text-sm font-semibold mb-2">Versiones relacionadas</p>
                {versioningAvailable ? (
                  application.versions && application.versions.length > 0 ? (
                    <div className="space-y-2">
                      {application.versions.map((version) => (
                        <div key={version.id} className="rounded-lg border border-default-200 p-3 text-sm">
                          <p className="font-medium">Versión en revisión</p>
                          <p className="text-default-500">ID: {version.id}</p>
                          <p className="text-default-500">Estado: {version.processStatus}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-default-500">
                      No hay versiones relacionadas para mostrar. Si una versión anterior fue eliminada, ya no está disponible.
                    </p>
                  )
                ) : (
                  <p className="text-sm text-default-500">
                    El historial de versiones todavía no está disponible en esta base de datos.
                  </p>
                )}
              </div>

              {/* Auditoría */}
              <>
                <>
                  <Divider />
                  <div>
                    <p className="text-sm font-semibold mb-2">Acciones Realizadas</p>
                    {application.audits.length > 0 ? (
                      <div className="space-y-2">
                        {application.audits.map((audit) => (
                          <div key={audit.id} className="text-sm border-l-2 border-default-300 pl-3 py-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{actionLabels[audit.action] || audit.action}</span>
                              {audit.action === 'RECHAZO' && <AlertCircle className="w-4 h-4 text-red-500" />}
                              {audit.action === 'APROBACION' && <CheckCircle className="w-4 h-4 text-green-500" />}
                            </div>
                            <p className="text-default-500">{audit.changedBy.displayName}</p>
                            <p className="text-xs text-default-400">
                              {new Date(audit.changedAt).toLocaleString('es-CL')}
                            </p>
                            {audit.details && (
                              <p className="mt-1 text-default-600 bg-default-100 p-2 rounded">
                                {audit.details}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-default-500">No hay acciones registradas todavía para esta solicitud.</p>
                    )}
                  </div>
                </>
              </>
            </CardBody>
          </Card>
        </div>
      </div>

      {/* Modal Visor de Documentos */}
      <Modal 
        isOpen={viewerOpen} 
        onClose={() => setViewerOpen(false)}
        size="5xl"
        scrollBehavior="inside"
      >
        <ModalContent>
          <ModalHeader>{viewerDocument?.name}</ModalHeader>
          <ModalBody className="p-0">
            {viewerDocument?.type === 'PDF' ? (
              <iframe
                src={`https://docs.google.com/viewer?url=${encodeURIComponent(viewerDocument.url)}&embedded=true`}
                className="w-full h-[80vh]"
                title={viewerDocument.name}
              />
            ) : (
              <div className="relative w-full h-[80vh] bg-gray-100">
                <Image
                  src={viewerDocument?.url || ''}
                  alt={viewerDocument?.name || ''}
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 100vw, 80vw"
                />
              </div>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Modal Aprobar AC */}
      {(canApproveAC) && (
        <Modal isOpen={approveModalOpen} onClose={() => setApproveModalOpen(false)} size="lg" isDismissable={false}>
          <ModalContent>
            <ModalHeader>Aprobar Solicitud</ModalHeader>
            <ModalBody>
              <p className="mb-4">Selecciona el revisor SHEQ que continuará con la revisión:</p>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-foreground">Revisor SHEQ</label>
                <select
                  value={selectedSheq}
                  onChange={(e) => setSelectedSheq(e.target.value)}
                  className="w-full rounded-lg border border-default-300 bg-default-100 px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-success"
                >
                  <option value="">Selecciona un revisor</option>
                  {sheqUsers.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.displayName} - {user.email}
                    </option>
                  ))}
                </select>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button variant="flat" onPress={() => setApproveModalOpen(false)}>
                Cancelar
              </Button>
              <Button
                color="success"
                onPress={handleApproveAC}
                isLoading={isLoading}
                isDisabled={!selectedSheq || !allDocsApproved}
              >
                Aprobar
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}

      {/* Modal Rechazar */}
      <Modal isOpen={rejectModalOpen} onClose={() => setRejectModalOpen(false)} size="lg" isDismissable={false}>
        <ModalContent>
          <ModalHeader>Rechazar Solicitud</ModalHeader>
          <ModalBody>
            <p className="mb-4 text-sm text-default-500">
              {(canApproveAC && !canApproveSHEQ)
                ? 'La solicitud será devuelta al usuario para que adjunte nuevamente los documentos.'
                : 'La solicitud será devuelta al Admin Contractor para revisión.'}
            </p>
            
            {/* Mostrar documentos rechazados si existen */}
            {docsRejected > 0 && (
              <div className="mb-4 p-3 bg-danger-50 border border-danger-200 rounded-lg">
                <p className="text-sm font-semibold text-danger mb-2">Documentos rechazados:</p>
                <ul className="text-sm space-y-1">
                  {documents
                    .filter(d => (d as any).approvalStatus === 'rejected')
                    .map((doc, idx) => (
                      <li key={idx} className="text-default-600">
                        • <strong>{doc.documentation?.name}</strong>: {(doc as any).rejectionReason}
                      </li>
                    ))}
                </ul>
                <p className="text-xs text-default-500 mt-2">
                  {docsRejected === documents.length 
                    ? 'Puedes dejar las observaciones vacías si solo rechazas por los documentos.' 
                    : 'Agrega observaciones adicionales si rechazas por otros motivos (foto, datos, etc.)'}
                </p>
              </div>
            )}
            
            <Textarea
              label={docsRejected > 0 ? "Observaciones adicionales (opcional)" : "Observaciones"}
              placeholder={docsRejected > 0 
                ? "Agrega observaciones adicionales solo si rechazas por otros motivos (foto, datos personales, contrato, etc.)"
                : "Ej: Foto no cumple con los requisitos (debe ser de rostro, fondo blanco)\nDatos personales incorrectos\nContrato no corresponde al puesto del trabajador"}
              value={observations}
              onValueChange={setObservations}
              minRows={4}
              isRequired={docsRejected === 0}
            />
          </ModalBody>
          <ModalFooter>
            <Button variant="flat" onPress={() => setRejectModalOpen(false)}>
              Cancelar
            </Button>
            <Button 
              color="danger" 
              onPress={(canApproveAC && !canApproveSHEQ) ? handleRejectAC : handleRejectSHEQ} 
              isLoading={isLoading}
            >
              Rechazar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Modal Rechazar Documento Individual */}
      <Modal isOpen={rejectDocModalOpen} onClose={() => setRejectDocModalOpen(false)} size="lg" isDismissable={false}>
        <ModalContent>
          <ModalHeader>Rechazar Documento</ModalHeader>
          <ModalBody>
            <p className="mb-4">Indica por qué este documento no es válido:</p>
            <Textarea
              label="Motivo del rechazo"
              placeholder="Ej: Documento vencido, información ilegible, falta firma..."
              value={docRejectionReason}
              onValueChange={setDocRejectionReason}
              minRows={3}
              isRequired
            />
          </ModalBody>
          <ModalFooter>
            <Button variant="flat" onPress={() => setRejectDocModalOpen(false)}>
              Cancelar
            </Button>
            <Button color="danger" onPress={handleConfirmRejectDocument}>
              Rechazar Documento
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
