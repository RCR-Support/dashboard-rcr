// context/UserRoleContext.tsx
"use client";
import React, { createContext, useContext, useState } from "react";
import { useRoleStore } from "@/store/ui/roleStore";

interface IUserRoleContext {
  role: string | null;
  showRoleModal: boolean;
  setShowRoleModal: (show: boolean) => void;
}

const UserRoleContext = createContext<IUserRoleContext>({
  role: null,
  showRoleModal: false,
  setShowRoleModal: () => {},
});

export const UserRoleProvider = ({ children }: { children: React.ReactNode }) => {
  const role = useRoleStore((state) => state.selectedRole);
  const [showRoleModal, setShowRoleModal] = useState(false);

  return (
    <UserRoleContext.Provider value={{ role, showRoleModal, setShowRoleModal }}>
      {children}
    </UserRoleContext.Provider>
  );
};

export const useUserRoleContext = () => useContext(UserRoleContext);
