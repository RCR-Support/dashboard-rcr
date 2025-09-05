'use client';

import { useUIStore } from '@/store/ui/ui-store';

export const MenuButton = () => {
  const toggleSideMenu = useUIStore(state => state.toggleSideMenu);
  const isSideMenuOpen = useUIStore(state => state.isSideMenuOpen);

  return (
    <button
      onClick={toggleSideMenu}
      className="mr-2 text-gray-600 hover:text-gray-900 cursor-pointer p-2 hover:bg-[#6b6b6c] rounded"
    >
      {isSideMenuOpen ? (
        <svg
          id="toggleSidebarMobileHamburger"
          className="w-6 h-6 text-[#03c9d7]"
          fill="currentColor"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h6a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
            clipRule="evenodd"
          ></path>
        </svg>
      ) : (
        <svg
          id="toggleSidebarMobileHamburger"
          className="w-6 h-6 text-gray-600"
          fill="currentColor"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h6a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
            clipRule="evenodd"
          ></path>
        </svg>
      )}
    </button>
  );
};
