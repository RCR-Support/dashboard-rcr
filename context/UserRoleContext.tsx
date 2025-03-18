"use client";
import React, { createContext, useContext } from "react";
import { useRoleStore } from "@/store/ui/roleStore";

interface IUserRoleContext {
    role: string | null;
}

const UserRoleContext = createContext<IUserRoleContext>({ role: null });

export const UserRoleProvider = ({ children }: { children: React.ReactNode }) => {
    const role = useRoleStore((state) => state.selectedRole);
    return (
        <UserRoleContext.Provider value={{ role }}>
            {children}
        </UserRoleContext.Provider>
    );
};

export const useUserRoleContext = () => useContext(UserRoleContext);
