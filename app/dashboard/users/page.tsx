import { fetchUserData } from '@/actions';
import { User } from '@/interfaces';
import UsersClientPage from './UsersClientPage';
import { Suspense } from 'react';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';

export default async function UsersPage() {
  const session = await auth();
  if (!session?.user) redirect('/login');
  if (!session.user.roles?.includes('admin')) redirect('/unauthorized');

  const { ok, users = [] } = await fetchUserData();

  if (!ok) {
    throw new Error('Error al cargar usuarios');
  }

  const mappedUsers: User[] = users.map(user => ({
    ...user,
    roles: user.roles,
  }));

  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <UsersClientPage key={`users-${Date.now()}`} initialUsers={mappedUsers} />
    </Suspense>
  );
}
