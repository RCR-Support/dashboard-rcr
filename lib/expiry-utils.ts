/**
 * Calcula la fecha de vencimiento más próxima entre licenseExpiration
 * y los expiresAt de los documentos de la solicitud.
 */
export function getNearestExpiry(
  licenseExpiration: Date | string | null,
  documentationFiles: Array<{ expiresAt?: Date | string | null; documentationId: string | null }>,
): Date | null {
  const dates: Date[] = [];

  if (licenseExpiration) dates.push(new Date(licenseExpiration));

  for (const f of documentationFiles) {
    if (f.documentationId && f.expiresAt) {
      dates.push(new Date(f.expiresAt));
    }
  }

  if (dates.length === 0) return null;

  return dates.reduce((min, d) => (d < min ? d : min));
}

export type ExpiryStatus = {
  color: 'success' | 'warning' | 'danger' | 'default';
  label: string;
  daysLeft: number | null;
  key: 'vigente' | 'por_vencer' | 'vencido' | 'sin_fecha';
};

/**
 * Semáforo:
 *  🔴 vencido   : <= 0 días
 *  🟡 por_vencer: 1 – 30 días
 *  🟢 vigente   : > 30 días
 */
export function getExpiryStatus(nearestExpiry: Date | null): ExpiryStatus {
  if (!nearestExpiry) {
    return { color: 'default', label: 'Sin vencimiento', daysLeft: null, key: 'sin_fecha' };
  }

  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const target = new Date(nearestExpiry);
  target.setHours(0, 0, 0, 0);

  const daysLeft = Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  if (daysLeft <= 0) {
    return { color: 'danger', label: 'Vencido', daysLeft, key: 'vencido' };
  }
  if (daysLeft <= 30) {
    return {
      color: 'warning',
      label: `Vence en ${daysLeft}d`,
      daysLeft,
      key: 'por_vencer',
    };
  }
  return { color: 'success', label: `Vence en ${daysLeft}d`, daysLeft, key: 'vigente' };
}
