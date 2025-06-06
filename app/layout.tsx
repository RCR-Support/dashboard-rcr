import type { Metadata } from 'next';
import './globals.css';
import { roboto } from '@/config/fonts';

import { Providers } from '@/app/providers';
import { SwitcherMini } from "@/components/ui/themeswitch/Switchermini";

export const metadata: Metadata = {
  title: 'New Dashboard RCRSupport',
  description: 'Generated by create next app',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html suppressHydrationWarning={true} lang="es">
      <body
        className={`${roboto.className} dark:bg-[#171c23] text-gray-900 dark:text-gray-100 transition-all duration-300`}
      >
        <Providers>
          <SwitcherMini />
          {children}
        </Providers>
      </body>
    </html>
  );
}
