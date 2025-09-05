'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useTheme } from 'next-themes';

export const ImageDarkmode = () => {
  const { theme } = useTheme();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <Image
      src={theme === 'light' ? '/images/logo.png' : '/images/logo-dark.png'}
      alt="logo"
      width={136}
      height={100}
      quality={100}
      className="w-fit h-8 dark:h-10"
      priority
    />
  );
};
