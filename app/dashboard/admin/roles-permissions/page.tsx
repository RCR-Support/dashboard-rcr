import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import RolesPermissionsClient from './RolesPermissionsClient';

export default async function RolesPermissionsPage() {
  const session = await auth();
  
  if (!session?.user) {
    redirect('/auth/login');
  }

  const userRoles = session.user.roles || [];
  
  // Solo admin puede acceder
  if (!userRoles.includes('admin')) {
    redirect('/unauthorized');
  }

  return <RolesPermissionsClient />;
}
