'use client';

import { Card, CardBody, CardHeader } from '@heroui/card';
import { Chip } from '@heroui/chip';
import { Button } from '@heroui/button';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from '@heroui/modal';
import { Textarea } from '@heroui/input';
import { CheckCircle, XCircle, Clock, Edit, RotateCcw } from 'lucide-react';
import Swal from 'sweetalert2';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { approveApplicationAC, rejectApplicationAC } from '@/actions/applications/approve-reject-ac';
import { approveApplicationSHEQ, rejectApplicationSHEQ } from '@/actions/applications/approve-reject-sheq';
import { approveDocument } from '@/actions/applications/approve-document';
import { rejectDocument } from '@/actions/applications/reject-document';
import { resetApplicationStatus } from '@/actions/applications/reset-application-status';
import { usePermissions } from '@/hooks/usePermissions';
import { ApplicationSidebar } from './ApplicationSidebar';
import { ApplicationDocuments } from './ApplicationDocuments';
import { ApplicationDocumentViewer } from './ApplicationDocumentViewer';
import { RejectApplicationDocumentModal } from './RejectApplicationDocumentModal';
import { ApplicationHistory } from './ApplicationHistory';

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
  activeReassignment?: {
    originalAcId: string;
    originalAcName: string;
    returnDate: string | null;
    reason: string;
    assignedAt: string;
  } | null;
}

const stateAcColorMap: Record<string, 'success' | 'warning' | 'danger'> = {
  aprobado: 'success',
  pendiente: 'warning',
  adjuntar: 'danger',
};

const stateAcLabelMap: Record<string, string> = {
  aprobado: 'Aprobado',
  pendiente: 'En revisión',
  adjuntar: 'Rechazado',
};

const stateSheqColorMap: Record<string, 'success' | 'warning' | 'danger'> = {
  aprobado: 'success',
  pendiente: 'warning',
  rechazado: 'danger',
};

const stateSheqLabelMap: Record<string, string> = {
  aprobado: 'Aprobado',
  pendiente: 'En revisión',
  rechazado: 'Rechazado',
};

export function ApplicationDetail({ application, userRoles, userId, sheqUsers, versioningAvailable, activeReassignment }: ApplicationDetailProps) {
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
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [resetStage, setResetStage] = useState<'ac' | 'sheq'>('ac');

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

  // Revisor actual de documentos pendientes
  const pendingReviewer = application.stateAc !== 'aprobado' ? 'AC' : 'SHEQ';

  // Verificar estado de revisión de documentos
  const docsApproved = documents.filter(d => d.approvalStatus === 'approved').length;
  const docsRejected = documents.filter(d => d.approvalStatus === 'rejected').length;
  const docsPending = documents.filter(d => !d.approvalStatus || d.approvalStatus === 'pending').length;
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
  const canReviewCurrentStage = canApproveAC || canApproveSHEQ;

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
      `Documentos rechazados: ${documents.filter(d => d.approvalStatus === 'rejected').map(d => d.documentation?.name).join(', ')}`;

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
      `Documentos rechazados: ${documents.filter(d => d.approvalStatus === 'rejected').map(d => d.documentation?.name).join(', ')}`;

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

  const handleResetStatus = async () => {
    setIsLoading(true);
    const result = await resetApplicationStatus(application.id, resetStage);
    setIsLoading(false);

    if (result.success) {
      Swal.fire({ icon: 'success', title: 'Estado reiniciado', text: result.message });
      setResetModalOpen(false);
      router.refresh();
    } else {
      Swal.fire({ icon: 'error', title: 'Error', text: result.message });
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
        {isAdmin && (
          <p className="text-xs text-default-400 font-mono">ID: {application.id}</p>
        )}
      </div>

      {/* Estados y Acciones */}
      <Card className="mb-6">
        <CardBody>
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex gap-4 items-center flex-wrap">
              <div className="flex flex-col gap-1">
                <p className="text-xs text-default-400 uppercase tracking-wide">Revisión AC</p>
                <Chip
                  color={stateAcColorMap[application.stateAc]}
                  variant="flat"
                  startContent={
                    application.stateAc === 'aprobado'
                      ? <CheckCircle className="w-3.5 h-3.5" />
                      : application.stateAc === 'adjuntar'
                      ? <XCircle className="w-3.5 h-3.5" />
                      : <Clock className="w-3.5 h-3.5" />
                  }
                >
                  {stateAcLabelMap[application.stateAc] ?? application.stateAc}
                </Chip>
              </div>

              <div className="text-default-300 self-center">→</div>

              <div className="flex flex-col gap-1">
                <p className="text-xs text-default-400 uppercase tracking-wide">Revisión SHEQ</p>
                <Chip
                  color={stateSheqColorMap[application.stateSheq]}
                  variant="flat"
                  isDisabled={application.stateAc !== 'aprobado'}
                  startContent={
                    application.stateSheq === 'aprobado'
                      ? <CheckCircle className="w-3.5 h-3.5" />
                      : application.stateSheq === 'rechazado'
                      ? <XCircle className="w-3.5 h-3.5" />
                      : <Clock className="w-3.5 h-3.5" />
                  }
                >
                  {stateSheqLabelMap[application.stateSheq] ?? application.stateSheq}
                </Chip>
              </div>
            </div>

            {/* Botones de acción según rol */}
            {isAdmin && (
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="flat"
                  color="warning"
                  startContent={<RotateCcw className="w-4 h-4" />}
                  onPress={() => {
                    setResetStage(
                      application.stateAc === 'aprobado' ? 'sheq' : 'ac'
                    );
                    setResetModalOpen(true);
                  }}
                >
                  Reiniciar estado
                </Button>
              </div>
            )}

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
        <ApplicationSidebar
          workerFullName={workerFullName}
          workerPhoto={workerPhoto}
          application={application}
          activeReassignment={activeReassignment}
        />

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
          <ApplicationDocuments
            documents={documents}
            pendingReviewer={pendingReviewer}
            canApprove={canReviewCurrentStage && canApproveDocuments}
            canReject={canReviewCurrentStage && canRejectDocuments}
            onView={handleViewDocument}
            onApprove={handleApproveDocument}
            onReject={handleRejectDocumentClick}
          />

          <ApplicationHistory
            application={application}
            versioningAvailable={versioningAvailable}
            activeReassignment={activeReassignment}
          />
        </div>
      </div>

      <ApplicationDocumentViewer
        isOpen={viewerOpen}
        document={viewerDocument}
        onClose={() => setViewerOpen(false)}
      />

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
                    .filter(d => d.approvalStatus === 'rejected')
                    .map((doc, idx) => (
                      <li key={idx} className="text-default-600">
                        • <strong>{doc.documentation?.name}</strong>: {doc.rejectionReason}
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

      <RejectApplicationDocumentModal
        isOpen={rejectDocModalOpen}
        rejectionReason={docRejectionReason}
        onClose={() => setRejectDocModalOpen(false)}
        onRejectionReasonChange={setDocRejectionReason}
        onConfirm={handleConfirmRejectDocument}
      />

      {/* Modal Reiniciar Estado (solo Admin) */}
      {isAdmin && (
        <Modal isOpen={resetModalOpen} onClose={() => setResetModalOpen(false)} size="lg" isDismissable={false}>
          <ModalContent>
            <ModalHeader className="flex items-center gap-2">
              <RotateCcw className="w-5 h-5 text-warning" />
              Reiniciar estado de la solicitud
            </ModalHeader>
            <ModalBody>
              <p className="text-sm text-default-600 mb-4">
                Selecciona en qué etapa quieres reiniciar la solicitud. Todos los documentos volverán a estado <strong>Pendiente</strong> y el revisor correspondiente deberá revisarlos nuevamente.
              </p>

              <div className="flex flex-col gap-3">
                <button
                  type="button"
                  onClick={() => setResetStage('ac')}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-colors ${
                    resetStage === 'ac'
                      ? 'border-warning bg-warning-50 dark:bg-warning-900/20'
                      : 'border-default-200 hover:border-default-400'
                  }`}
                >
                  <p className="font-semibold">Como Admin Contractor</p>
                  <p className="text-sm text-default-500 mt-1">
                    Reinicia todo el ciclo desde el inicio. El AC deberá revisar y aprobar nuevamente todos los documentos antes de pasar a SHEQ.
                  </p>
                  <p className="text-xs text-warning mt-2">
                    stateAc → PENDIENTE · stateSheq → PENDIENTE · todos los docs → PENDIENTE
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setResetStage('sheq')}
                  disabled={application.stateAc !== 'aprobado'}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-colors ${
                    application.stateAc !== 'aprobado'
                      ? 'border-default-100 opacity-40 cursor-not-allowed'
                      : resetStage === 'sheq'
                      ? 'border-warning bg-warning-50 dark:bg-warning-900/20'
                      : 'border-default-200 hover:border-default-400'
                  }`}
                >
                  <p className="font-semibold">Como SHEQ</p>
                  <p className="text-sm text-default-500 mt-1">
                    Mantiene la aprobación del AC. Solo reinicia la etapa SHEQ. Requiere que el AC ya haya aprobado.
                  </p>
                  <p className="text-xs text-warning mt-2">
                    stateAc → APROBADO (sin cambios) · stateSheq → PENDIENTE · todos los docs → PENDIENTE
                  </p>
                  {application.stateAc !== 'aprobado' && (
                    <p className="text-xs text-danger mt-1">El AC todavía no ha aprobado esta solicitud</p>
                  )}
                </button>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button variant="flat" onPress={() => setResetModalOpen(false)}>
                Cancelar
              </Button>
              <Button
                color="warning"
                startContent={<RotateCcw className="w-4 h-4" />}
                onPress={handleResetStatus}
                isLoading={isLoading}
              >
                Reiniciar como {resetStage === 'ac' ? 'Admin Contractor' : 'SHEQ'}
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}
    </div>
  );
}
