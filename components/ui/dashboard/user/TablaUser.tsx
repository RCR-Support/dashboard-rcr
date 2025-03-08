'use client'
import type { User } from "@/interfaces";
import App from "./TablaHUI";


interface Props {
    users: User[];
}

export const TablaUser = ({ users }: Props)  => {
    return (
        <div className=" w-full  col-span-12">
            <App users={users} />
        </div>
    )
}
