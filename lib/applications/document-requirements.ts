export interface ConfiguredActivityDocument {
  isSpecific: boolean;
  documentation: { id: string; name: string };
}

export interface ConfiguredZoneDocument {
  zoneId: string;
  zone: { name: string };
  documentation: { id: string; name: string };
}

export interface ActivityDocumentRules {
  id: string;
  requiredDocumentations: ConfiguredActivityDocument[];
  zoneDocumentations: ConfiguredZoneDocument[];
}

export interface UploadedRequiredDocument {
  documentationId?: string;
  activityId?: string | null;
  url: string;
}

export function getRequiredApplicationDocuments(
  activities: ActivityDocumentRules[],
  selectedZoneIds: string[]
) {
  const required = new Map<string, string>();
  const globalDocumentationIds = new Set<string>();

  for (const activity of activities) {
    for (const rule of activity.requiredDocumentations) {
      if (!rule.isSpecific) {
        globalDocumentationIds.add(rule.documentation.id);
        required.set(`global:${rule.documentation.id}`, rule.documentation.name);
      } else {
        required.set(`${activity.id}:${rule.documentation.id}`, rule.documentation.name);
      }
    }
  }

  for (const activity of activities) {
    for (const rule of activity.zoneDocumentations) {
      if (!selectedZoneIds.includes(rule.zoneId) || globalDocumentationIds.has(rule.documentation.id)) {
        continue;
      }
      const key = `${activity.id}:${rule.documentation.id}`;
      required.set(key, `${rule.documentation.name} (${rule.zone.name})`);
    }
  }

  return required;
}

export function validateApplicationDocumentCoverage(
  required: Map<string, string>,
  documents: UploadedRequiredDocument[]
): string | null {
  const uploaded = new Set(
    documents
      .filter(document => Boolean(document.url && document.documentationId))
      .map(document => document.activityId
        ? `${document.activityId}:${document.documentationId}`
        : `global:${document.documentationId}`)
  );

  const missing = Array.from(required.entries()).filter(([key]) => !uploaded.has(key));
  if (missing.length > 0) {
    return `Faltan documentos obligatorios: ${missing.map(([, name]) => name).join(', ')}.`;
  }

  const unexpected = Array.from(uploaded).filter(key => !required.has(key));
  if (unexpected.length > 0) {
    return 'La solicitud incluye archivos que no corresponden a documentos requeridos para las actividades y zonas seleccionadas.';
  }

  return null;
}
