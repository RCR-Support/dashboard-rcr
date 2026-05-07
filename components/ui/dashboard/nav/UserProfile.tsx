'use client';
import { useSession } from 'next-auth/react';
import { useRoleStore } from '@/store/ui/roleStore';
import { roleMapping } from '@/lib/roleMapping';
import UserInfoProfile from './UserInfoProfile';
import NotificationsPanel from './NotificationsPanel';

const UserProfile = () => {
  const { data: session } = useSession();
  const selectedRole = useRoleStore(state => state.selectedRole);

  if (!session?.user) return null;

  const { displayName, email, image } = session.user as {
    displayName?: string;
    email?: string;
    image?: string;
  };

  return (
    <div className="flex items-center space-x-2">
      <NotificationsPanel />
      <UserInfoProfile
        name={displayName || session.user.name || 'Usuario'}
        email={email || session.user.email || ''}
        role={roleMapping[selectedRole as keyof typeof roleMapping] || selectedRole || ''}
        image={image}
      />
    </div>
  );
};

export default UserProfile;
