import { fetchUserData } from "@/actions";
import { User } from "@/interfaces";
import UsersClientPage from "./UsersClientPage";
import { Suspense } from "react";

export default async function UsersPage() {
    const { ok, users = [] } = await fetchUserData();

    if (!ok) {
        throw new Error("Error al cargar usuarios");
    }

    const mappedUsers: User[] = users.map((user) => ({
        ...user,
        roles: user.roles
    }));

    return (
        <Suspense fallback={<div>Cargando...</div>}>
            <UsersClientPage initialUsers={mappedUsers} />
        </Suspense>
    );
}
