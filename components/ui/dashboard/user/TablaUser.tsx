'use client'
import type { User } from "@/interfaces";
// import {Table, TableHeader, TableColumn, TableBody, TableRow, TableCell} from "@heroui/react";
// import { Avatar } from "@mui/material";
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
