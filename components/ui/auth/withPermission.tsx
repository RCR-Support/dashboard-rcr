// app/components/auth/withPermission.tsx
'use client';

import { usePermissions } from "@/hooks/usePermissions";
import { redirect } from "next/navigation";
import { ComponentType, useEffect, useState, useCallback } from "react";
import { useRoleStore } from "@/store/ui/roleStore";
import { useRoleModal } from "@/app/dashboard/layout";

export function withPermission<P extends object>(
    WrappedComponent: ComponentType<P>,
    requiredPath: string
): ComponentType<P> {
    function ProtectedComponent(props: P) {
        const { hasPermission } = usePermissions();
        const { selectedRole } = useRoleStore();
        const { showRoleModal } = useRoleModal();
        const [shouldRedirect, setShouldRedirect] = useState(false);

        const checkPermission = useCallback(() => {
            if (!showRoleModal && selectedRole && !hasPermission(requiredPath)) {
                setShouldRedirect(true);
            }
        }, [showRoleModal, selectedRole, hasPermission]);

        useEffect(() => {
            checkPermission();
        }, [checkPermission]);

        if (shouldRedirect) {
            redirect('/unauthorized');
        }

        return <WrappedComponent {...props} />;
    }

    ProtectedComponent.displayName = `withPermission(${
        WrappedComponent.displayName || WrappedComponent.name || 'Component'
    })`;

    return ProtectedComponent;
}
