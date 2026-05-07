'use client';

import { ActivityDetailModal } from '@/components/ui/dashboard/activity/ActivityDetailModal';
import { useExpandedActivity } from './useExpandedActivity';

export function DetailModal() {
  const { expandedActivityId, setExpandedActivityId } = useExpandedActivity();

  return (
    <ActivityDetailModal
      isOpen={!!expandedActivityId}
      onClose={() => setExpandedActivityId(null)}
      activityId={expandedActivityId}
    />
  );
}
