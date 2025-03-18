// UserProfile.tsx
// Este componente es un Server Component, no incluir "use client"
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { FaBell } from "react-icons/fa";
import UserInfoProfile from "./UserInfoProfile";

export default async function UserProfile() {
  // Se ejecuta en el servidor, por lo que puedes usar async/await aquí.
  const session = await auth();
  if (!session) {
    return <div>Not authenticated</div>;
  }
  const user = session.user;

  console.log("session XD", session?.user?.roles);

  const rolesMapping = {
    admin: "Administrador",
    sheq: "Sheq",
    adminContractor: "Administrador de Contrato",
    user: "Usuario",
    credential: "Credenciales",
  };

  // Consulta datos adicionales del usuario a través de Prisma
  const userData = await db.user.findUnique({
    where: {
      email: user?.email as string,
    },
  });

  return (
    <div className="flex items-center space-x-4 max-w-80">
      <div className="relative">
        <div className="rounded-full p-4 cursor-pointer">
          <FaBell />
        </div>
        <span className="absolute top-0 right-0 inline-flex items-center justify-center h-5 w-5 text-xs font-bold leading-none text-red-100 bg-[#fb9678] rounded-full">
          3
        </span>
      </div>
      {/* <UserInfoProfile
        name={userData?.displayName ?? ""}
        userName={userData?.userName ?? ""}
        email={userData?.email ?? ""}
        role={role}
        image={userData?.image ?? ""}
      /> */}
    </div>
  );
}
