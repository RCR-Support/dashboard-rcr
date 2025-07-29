'use client';

import { withPermission } from '@/components/ui/auth/withPermission';
import ActivitiesView from './ActivitiesView';

interface Activity {
    id: string;
    name: string;
    imageUrl: string | null;
    requiredDriverLicense: string | null;
    requiredDocumentations?: {
        id: string;
        documentation: {
            id: string;
            name: string;
        };
        notes?: string | null;
    }[];
}

interface Props {
    activities: Activity[];
}

function ActivitiesClientPage({ activities }: Props) {
    return <ActivitiesView activities={activities} />;
}

const ProtectedActivitiesPage = withPermission(ActivitiesClientPage, '/dashboard/activities');
export default ProtectedActivitiesPage;
