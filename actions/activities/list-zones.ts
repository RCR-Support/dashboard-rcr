'use server';

import { auth } from '@/auth';
import { db } from '@/lib/db';
import { hasActionPermission } from '@/config/action-permissions';

export async function listZones() {
  const session = await auth();
  if (!session?.user) return [];
  if (!hasActionPermission('activities:view', session.user.roles)) return [];

  return db.zone.findMany({
    select: { id: true, name: true },
    orderBy: { name: 'asc' },
  });
}
