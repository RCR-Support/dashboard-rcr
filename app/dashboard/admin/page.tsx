'use client';

import { useSession } from 'next-auth/react';
import LogoutButton from '@/components/ui/auth/logout-button';
import { withPermission } from '@/components/ui/auth/withPermission';

const AdminPage = () => {
    const { data: session } = useSession();
    

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Panel de Administración</h1>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                <pre className="overflow-auto">
                    {JSON.stringify(session, null, 2)}
                </pre>
                <div className="mt-4">
                    <LogoutButton />
                </div>
            </div>
        </div>
    );
};

export default withPermission(AdminPage, '/dashboard/admin');
