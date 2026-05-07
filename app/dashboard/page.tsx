import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { getAdminStats } from '@/actions/dashboard/get-admin-stats';
import { getUserStats } from '@/actions/dashboard/get-user-stats';
import { getSheqStats } from '@/actions/dashboard/get-sheq-stats';
import { getAdminContractorStats } from '@/actions/dashboard/get-admin-contractor-stats';
import { getCredentialStats } from '@/actions/dashboard/get-credential-stats';
import DashboardAdmin from './_components/DashboardAdmin';
import DashboardUser from './_components/DashboardUser';
import DashboardSheq from './_components/DashboardSheq';
import DashboardAdminContractor from './_components/DashboardAdminContractor';
import DashboardCredential from './_components/DashboardCredential';
import DashboardConnectionError from './_components/DashboardConnectionError';
import { RoleEnum } from '@prisma/client';

export default async function Dashboard() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  const user = session.user;
  const userRoles = user.roles || [];

  // Determinar el rol principal del usuario
  const isAdmin = userRoles.includes(RoleEnum.admin);
  const isSheq = userRoles.includes(RoleEnum.sheq);
  const isAdminContractor = userRoles.includes(RoleEnum.adminContractor);
  const isUser = userRoles.includes(RoleEnum.user);
  const isCredential = userRoles.includes(RoleEnum.credential);

  // Cargar estadísticas según el rol
  if (isAdmin) {
    const result = await getAdminStats();
    if (!result.ok || !result.stats) return <DashboardConnectionError />;
    return <DashboardAdmin stats={result.stats} />;
  }

  if (isSheq) {
    const result = await getSheqStats();
    if (!result.ok || !result.stats) return <DashboardConnectionError />;
    return (
      <DashboardSheq 
        stats={result.stats} 
        userName={user.displayName || user.name || 'Usuario'}
      />
    );
  }

  if (isAdminContractor) {
    const result = await getAdminContractorStats();
    if (!result.ok || !result.stats) return <DashboardConnectionError />;
    return (
      <DashboardAdminContractor 
        stats={result.stats} 
        userName={user.displayName || user.name || 'Usuario'}
      />
    );
  }

  if (isUser) {
    const result = await getUserStats();
    if (!result.ok || !result.stats) return <DashboardConnectionError />;
    return (
      <DashboardUser 
        stats={result.stats} 
        userName={user.displayName || user.name || 'Usuario'}
      />
    );
  }

  if (isCredential) {
    const result = await getCredentialStats();
    if (!result.ok || !result.stats) return <DashboardConnectionError />;
    return (
      <DashboardCredential
        stats={result.stats}
        userName={user.displayName || user.name || 'Usuario'}
      />
    );
  }

  // Fallback: usuario sin rol conocido
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <p className="text-lg font-semibold">Bienvenido, {user.displayName || user.name || 'Usuario'}</p>
        <p className="text-default-400 mt-2">
          No tienes un rol asignado. Contacta al administrador.
        </p>
      </div>
    </div>
  );
}
