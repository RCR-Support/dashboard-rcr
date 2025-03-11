import { fetchUserData } from "@/actions";
import { redirect } from "next/navigation";
import UsersView from "./UsersView";
import { User } from "@/interfaces";

export default async function UsersPage() {
  const { ok, users = [] } = await fetchUserData();

  if (!ok) {
    redirect('/login');
  }

  // Mapear los datos de los usuarios para incluir todos los roles
  const mappedUsers: User[] = users.map((user) => ({
    ...user,
    roles: user.roles.map((role) => role.role.name), // Asignar todos los roles
  }));

  return <UsersView users={mappedUsers} />;
}
