'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect, useRef } from 'react';
import { useRoleStore } from '@/store/ui/roleStore';
import RoleSelectionModal from '@/components/ui/dashboard/RoleSelectionModal';
import RoleCapturer from '@/components/ui/dashboard/RoleCapturer';
import { SidebarDashboard } from '@/components/ui/dashboard/sidebar/SidebarDashboard';
import { NavDashboard } from '@/components/ui/dashboard/nav/NavDashboard';
import { RoleModalContext } from '@/context/role-modal-context';
import { RoleEnum } from '@prisma/client';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      window.location.href = '/login';
    },
  });

  const { selectedRole, resetRole } = useRoleStore();
  const [showRoleModal, setShowRoleModal] = useState(false);
  const initialized = useRef(false);

  useEffect(() => {
    if (status !== 'authenticated' || !session?.user?.roles) return;

    // Safety: si el rol guardado no pertenece al usuario actual (sesión cruzada), limpiarlo
    if (selectedRole && !session.user.roles.includes(selectedRole as RoleEnum)) {
      resetRole();
      return;
    }

    if (!initialized.current) {
      initialized.current = true;

      if (session.user.roles.length > 1 && !selectedRole) {
        setShowRoleModal(true);
      }
    }
  }, [status, session, selectedRole, resetRole]);

  if (status === 'loading') {
    return (
      <div className="flex h-screen items-center justify-center bg-[#f0f0f0] dark:bg-[#1a202c] text-gray-500 dark:text-white">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500 dark:border-white"></div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <RoleModalContext.Provider value={{ showRoleModal, setShowRoleModal }}>
      <RoleCapturer />
      <main className="bg-[#f0f0f0] dark:bg-[#1a202c] text-gray-500 dark:text-white flex">
        <SidebarDashboard />
        <div className="flex flex-col min-h-screen flex-1 gap-4 p-4">
          <NavDashboard />
          <div className="container mx-auto mt-6">{children}</div>
        </div>
        {showRoleModal && session?.user?.roles && (
          <RoleSelectionModal
            isOpen={showRoleModal}
            availableRoles={session.user.roles}
            onRoleSelected={() => {
              setShowRoleModal(false);
            }}
          />
        )}
      </main>
    </RoleModalContext.Provider>
  );
}
