'use client'
import type { User } from "@/interfaces";
// import {Table, TableHeader, TableColumn, TableBody, TableRow, TableCell} from "@heroui/react";
// import { Avatar } from "@mui/material";
import App from "./ejemploTablaHUI";


interface Props {
    users: User[];
}

export const TablaUser = ({ users }: Props)  => {
    // function stringAvatar(displayName: string) {
    //     return {
    //         children: `${displayName.split(' ')[0][0]}${displayName.split(' ')[1][0]}`,
    //     };
    // }
    return (
        <div className=" w-full  col-span-12">
            {/* <Table>
                <TableHeader>
                    <TableColumn>
                        Nombre
                    </TableColumn>
                    <TableColumn>
                        Apellido
                    </TableColumn>
                    <TableColumn>
                        Correo
                    </TableColumn>
                    <TableColumn>
                        Rol
                    </TableColumn>
                </TableHeader>
                <TableBody emptyContent={"No rows to display."}>
                    {users.map((user) => (
                    <TableRow key={user.id}>
                        <TableCell>
                            <div className="flex items-center gap-2 cursor-pointer">
                                <Avatar {...stringAvatar(user.displayName)} src="" className="bg-[#03c9d7] dark:bg-[#327f84]" />
                                <div className="flex flex-col">
                                    <p className="font-semibold truncate text-ellipsis max-w-44">{user.userName}</p>
                                    <span className="text-xs text-gray-500 truncate text-ellipsis max-w-44">{user.email}</span>
                                </div>
                            </div>
                        </TableCell>
                        <TableCell>
                            {user.lastName}
                        </TableCell>
                        <TableCell>
                            {user.email}
                        </TableCell>
                        <TableCell>
                            {user.role}
                        </TableCell>
                    </TableRow>
                    ))}
                </TableBody>
            </Table> */}
            <App users={users} />
        </div>
    )
}
