import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface RoleState {
  selectedRole: string | null;
  setRole: (role: string) => void;
  resetRole: () => void;
}

export const useRoleStore = create<RoleState>()(
  persist(
    (set) => ({
      selectedRole: null,
      setRole: (role) => {
        // console.log('Guardando rol en store:', role);
        set({ selectedRole: role });
      },
      resetRole: () => set({ selectedRole: null }),
    }),
    {
      name: 'role-storage',
      storage: createJSONStorage(() => {
        return {
          setItem: (name, value) => {
            document.cookie = `${name}=${value}; path=/; max-age=2592000; SameSite=Strict`;
          },
          getItem: (name) => {
            const value = document.cookie
              .split('; ')
              .find((row) => row.startsWith(`${name}=`))
              ?.split('=')[1];
            return value || null;
          },
          removeItem: (name) => {
            document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
          },
        };
      }),
    }
  )
);
