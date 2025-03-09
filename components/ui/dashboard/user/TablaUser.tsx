'use client'
import type { User } from "@/interfaces";
import App from "./TablaHUI";


interface Props {
    users: User[];
}

export const TablaUser = ({ users }: Props)  => {
    return ( <App users={users} /> );
}
