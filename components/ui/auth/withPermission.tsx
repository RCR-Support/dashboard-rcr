'use client';

import { usePermissions } from "@/hooks/usePermissions";
import { redirect } from "next/navigation";
import { ComponentType, useEffect, useState } from "react";
import { useRoleStore } from "@/store/ui/roleStore";
import { useRoleModal } from "@/app/dashboard/layout";
import { usePathname } from 'next/navigation';

export function withPermission<P extends object>(
    WrappedComponent: ComponentType<P>, 
    requiredPath: string
): ComponentType<P> {
    return function ProtectedComponent(props: P) {
        const pathname = usePathname();
        const { hasPermission } = usePermissions();
        const { selectedRole } = useRoleStore();
        const { showRoleModal } = useRoleModal();

        // Verificación inmediata para navegación manual
        if (!showRoleModal && selectedRole && !hasPermission(requiredPath)) {
            console.log('Acceso denegado a:', pathname);
            // Usar window.location para evitar problemas con el router en carga manual
            window.location.href = '/unauthorized';
            return null;
        }

        return <WrappedComponent {...props} />;
    };
}
