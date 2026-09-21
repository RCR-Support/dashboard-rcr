'use client';
import { secundaryFont } from '@/config/fonts';
import Image from 'next/image';

import { FaRegCopyright } from 'react-icons/fa6';

export default function Footer() {
  return (
    <footer className="bg-slate-300 dark:bg-[#282c34] text-slate-800 dark:text-white border-t border-gray-600">
      <div
        className={
          secundaryFont.className +
          ' text-lg font-bold container mx-auto px-4 pt-6'
        }
      >
        <div className="w-full pb-3">
          <p className="flex justify-center items-center p-2 gap-2 font-light text-xs lg:text-sm">
            Copyright
            <FaRegCopyright />
            <Image
              src="/images/logo.png"
              alt="logo"
              width={136}
              height={100}
              quality={100}
              className="w-fit h-8 dark:hidden"
            />
            <Image
              src="/images/logo-dark.png"
              alt="logo"
              width={136}
              height={100}
              quality={100}
              className="hidden w-fit dark:block dark:h-10"
            />
            2024
          </p>
        </div>
      </div>
    </footer>
  );
}
