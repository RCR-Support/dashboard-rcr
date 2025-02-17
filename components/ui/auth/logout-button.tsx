'use client';
import { signOut } from "next-auth/react";
import { Button } from "../button"


const LogoutButton = () => {

    const handleClick = async () => {
        await signOut({
            callbackUrl: "/login",
        });
    }

    return (
        <Button onClick={handleClick}>
        Logout
        </Button>
    )
}

export default LogoutButton
