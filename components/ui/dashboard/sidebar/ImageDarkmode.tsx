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
      fill
      sizes="95px"
      unoptimized
      className="object-contain"
      priority
    />
  );
};
