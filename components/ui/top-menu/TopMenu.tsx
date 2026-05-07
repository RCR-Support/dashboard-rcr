'use client';
import { secundaryFont } from '@/config/fonts';
import Link from 'next/link';
import MenuIcon from './MenuIcon';
import { usePathname } from 'next/navigation';

export const TopMenu = () => {
  const router = usePathname();
  return (
    <nav className="bg-gray-200 dark:bg-[#282c34]  w-full h-[94px] ">
      <div className="container mx-auto px-4 py-6 flex justify-center md:justify-between items-center w-full h-[94px]">
        {/**Logo */}
        <MenuIcon />
        <div>
          <Link href="/">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/logoInv.svg"
              alt="logo"
              style={{ width: '136px', height: 'auto' }}
              className="block dark:hidden"
            />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/logo.svg"
              alt="logo"
              style={{ width: '136px', height: 'auto' }}
              className="hidden dark:block"
            />
          </Link>
        </div>

        {/**Menu */}

        <div
          className={`${secundaryFont.className} font-extralight gap-3 lg:gap-9 text-slate-800 dark:text-white lg:text-lg hidden md:flex`}
        >
          <Link
            href="/"
            className={`hover:text-blue-400 hover:border-b-[0.5px] hover:border-blue-400 ${router === '/' ? 'border-b-[0.5px] border-slate-800 dark:border-white' : ''}`}
          >
            <span>Inicio</span>
          </Link>
          <Link
            href="/dashboard"
            className={`hover:text-blue-400 hover:border-b-[0.5px] hover:border-blue-400 ${router === '/dashboard' ? 'border-b-[0.5px] border-slate-800 dark:border-white' : ''}`}
          >
            <span>DashBoard</span>
          </Link>
          <Link
            href="/login"
            className={`hover:text-blue-400 hover:border-b-[0.5px] hover:border-blue-400 ${router === '/auth/new-account' ? 'border-b-[0.5px] border-white' : ''}`}
          >
            <span>login</span>
          </Link>
        </div>
      </div>
    </nav>
  );
};
