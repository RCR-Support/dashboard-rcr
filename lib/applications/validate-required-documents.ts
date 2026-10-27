import { db } from '@/lib/db';
import {
  getRequiredApplicationDocuments,
  validateApplicationDocumentCoverage,
  type UploadedRequiredDocument,
} from './document-requirements';

export async function validateRequiredApplicationDocuments(
  activityIds: string[],
  zoneIds: string[],
  documents: UploadedRequiredDocument[]
): Promise<string | null> {
  const uniqueActivityIds = Array.from(new Set(activityIds));
  const uniqueZoneIds = Array.from(new Set(zoneIds));
  if (uniqueActivityIds.length !== activityIds.length || uniqueZoneIds.length !== zoneIds.length) {
    return 'La solicitud contiene actividades o zonas duplicadas.';
  }

  const [activities, zones] = await Promise.all([
    db.activity.findMany({
      where: { id: { in: uniqueActivityIds } },
      select: {
        id: true,
        name: true,
        requiredDocumentations: {
          select: {
            isSpecific: true,
            documentation: { select: { id: true, name: true } },
          },
        },
        zoneDocumentations: {
          where: { zoneId: { in: uniqueZoneIds } },
          select: {
            zoneId: true,
            zone: { select: { name: true } },
            notes: true,
            documentation: { select: { id: true, name: true } },
          },
        },
      },
    }),
    db.zone.findMany({
      where: { id: { in: uniqueZoneIds } },
      select: { id: true },
    }),
  ]);

  if (activities.length !== uniqueActivityIds.length) {
    return 'Una o más actividades seleccionadas no existen.';
  }
  if (zones.length !== uniqueZoneIds.length) {
    return 'Una o más zonas seleccionadas no existen.';
  }

  const required = getRequiredApplicationDocuments(activities, uniqueZoneIds);
  return validateApplicationDocumentCoverage(required, documents);
}
