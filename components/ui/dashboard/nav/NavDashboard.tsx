import { MenuButton } from './MenuButton';
import UserProfile from './UserProfile';

export const NavDashboard = () => {
  return (
    <nav className="z-0 lg:z-30 w-full ">
      <div className="bg-white dark:bg-[#282c34] rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center justify-start">
            <MenuButton />
          </div>
          <UserProfile />
        </div>
      </div>
    </nav>
  );
};
