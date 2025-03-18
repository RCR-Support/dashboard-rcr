"use client";
import { signOut } from "next-auth/react";
import { useRoleStore } from "@/store/ui/roleStore";
import { Button } from "@/components/ui/button";

const LogoutButton = () => {
    const resetRole = useRoleStore((state) => state.resetRole);

    const handleLogout = async () => {
        // Reiniciamos el rol para limpiar datos de la sesión anterior
        resetRole();

        // Llamamos a signOut sin redirección automática para capturar la respuesta
        const result = await signOut({ redirect: false, callbackUrl: "/login" });
        console.log("Resultado de signOut:", result);

        // Puedes manejar si result.url no viene o se produce algún error
        if (result.url) {
        window.location.href = result.url;
        } else {
        // Si no hay URL, forzamos la redirección manual
        window.location.href = "/login";
        }
    };

    return (
        <Button onClick={handleLogout}>
        Logout
        </Button>
    );
};

export default LogoutButton;
