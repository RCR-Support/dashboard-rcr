"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect, useRef, createContext, useContext } from "react";
import { UserRoleProvider } from "@/context/UserRoleContext";
import { useRoleStore } from "@/store/ui/roleStore";
import RoleSelectionModal from "@/components/ui/dashboard/RoleSelectionModal";
import RoleCapturer from "@/components/ui/dashboard/RoleCapturer";
import { SidebarDashboard } from "@/components/ui/dashboard/sidebar/SidebarDashboard";
import { NavDashboard } from "@/components/ui/dashboard/nav/NavDashboard";

// Contexto para el modal de roles
interface RoleModalContextType {
  showRoleModal: boolean;
  setShowRoleModal: (show: boolean) => void;
}

export const RoleModalContext = createContext<RoleModalContextType>({
  showRoleModal: false,
  setShowRoleModal: () => {},
});

export const useRoleModal = () => useContext(RoleModalContext);

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      window.location.href = "/login";
    },
  });

  const { selectedRole } = useRoleStore();
  const [showRoleModal, setShowRoleModal] = useState(false);
  const initialized = useRef(false);

  const previousRole = useRef(selectedRole);

  useEffect(() => {
    if (status === "authenticated" && !initialized.current) {
      initialized.current = true;
      console.log("Layout: Sesión autenticada", {
        roles: session?.user?.roles,
        selectedRole
      });

      if (session?.user?.roles?.length > 1 && !selectedRole) {
        setShowRoleModal(true);
      }
    }
  }, [status, session, selectedRole]);

  if (status === "loading") {
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
      <UserRoleProvider>
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
                console.log("Rol seleccionado, cerrando modal");
                setShowRoleModal(false);
              }}
            />
          )}
        </main>
      </UserRoleProvider>
    </RoleModalContext.Provider>
  );
}
