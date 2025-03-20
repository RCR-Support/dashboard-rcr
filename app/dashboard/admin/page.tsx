// app/dashboard/admin/page.tsx
import { auth } from '@/auth';
import { cookies } from 'next/headers';
import LogoutButton from '@/components/ui/auth/logout-button';
import BackButton from '@/components/ui/button-back';

const AdminPage = async () => {
    // Obtenemos la sesión
    const session = await auth();

    // Obtenemos la cookie con el rol seleccionado
    const cookieStore = cookies();
    const activeRole = cookieStore.get("role-storage")?.value; // Aquí se asume que se guarda el rol en esta cookie

    console.log('session XD');
    console.log(session?.user?.roles);
    console.log("Active role from cookie:", activeRole);

    // Verificamos el rol activo en lugar del array completo de roles
    if (activeRole !== "admin") {
        return (
        <div className="flex flex-col justify-center items-center gap-4">
            <div className="text-red-400 dark:text-red-300 text-2xl text-center mt-4">
            No tienes permiso de administrador
            </div>
            <BackButton />
        </div>
        );
    }

    return (
        <div>
        <h1>Admin Page</h1>
        <pre>{JSON.stringify(session, null, 2)}</pre>
        <LogoutButton />
        </div>
    );
};

export default AdminPage;
