'use client';

import { createContext, useContext } from 'react';

interface RoleModalContextType {
  showRoleModal: boolean;
  setShowRoleModal: (show: boolean) => void;
}

export const RoleModalContext = createContext<RoleModalContextType>({
  showRoleModal: false,
  setShowRoleModal: () => {},
});

export const useRoleModal = () => useContext(RoleModalContext);
