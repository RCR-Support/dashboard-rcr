import { auth } from '@/auth';
import LogoutButton from '@/components/ui/auth/logout-button';
import BackButton from '@/components/ui/button-back';

const AdminPage = async () => {
    const session = await auth();

    console.log('session XD');
    console.log(session?.user?.roles);

    if (!session?.user?.roles?.includes('admin')) {
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
    )
}

export default AdminPage;
