'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useRef } from 'react';
import { useRoleStore } from '@/store/ui/roleStore';

export default function RoleCapturer() {
  const { data: session, status } = useSession();
  const { setRole, selectedRole } = useRoleStore();
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (
      status === 'authenticated' &&
      !hasInitialized.current &&
      session?.user?.roles?.length === 1 &&
      !selectedRole
    ) {
      hasInitialized.current = true;
      setRole(session.user.roles[0]);
    }
  }, [session, status, selectedRole, setRole]);

  return null;
}
