interface ReviewDocument {
  approvalStatus: string | null;
}

export function getApplicationApprovalError(documents: ReviewDocument[]) {
  const pendingDocuments = documents.filter(
    document => !document.approvalStatus || document.approvalStatus === 'pending'
  );
  if (pendingDocuments.length > 0) {
    return `Aún hay ${pendingDocuments.length} documento(s) sin revisar. Debes aprobar o rechazar todos los documentos antes de aprobar la solicitud.`;
  }

  const rejectedDocuments = documents.filter(
    document => document.approvalStatus === 'rejected'
  );
  if (rejectedDocuments.length > 0) {
    return `Hay ${rejectedDocuments.length} documento(s) rechazado(s). No puedes aprobar una solicitud con documentos rechazados.`;
  }

  return null;
}