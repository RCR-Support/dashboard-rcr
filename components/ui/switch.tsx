'use client';

import * as React from 'react';
import * as SwitchPrimitives from '@radix-ui/react-switch';

import { cn } from '@/lib/utils';

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>
>(({ className, ...props }, ref) => (
  <SwitchPrimitives.Root
    className={cn(
      'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium',
      'data-[state=checked]:bg-blue-50 data-[state=checked]:text-blue-700 data-[state=checked]:ring-1 data-[state=checked]:ring-inset data-[state=checked]:ring-blue-700/10',
      'data-[state=checked]:dark:bg-blue-500/5 data-[state=checked]:dark:text-blue-400 data-[state=checked]:dark:ring-blue-500/20',
      'data-[state=unchecked]:bg-orange-50 data-[state=unchecked]:text-orange-700 data-[state=unchecked]:ring-1 data-[state=unchecked]:ring-inset data-[state=unchecked]:ring-orange-700/10',
      'data-[state=unchecked]:dark:bg-orange-500/5 data-[state=unchecked]:dark:text-orange-400 data-[state=unchecked]:dark:ring-orange-500/20',
      'hover:data-[state=checked]:bg-blue-100 hover:data-[state=unchecked]:bg-orange-100',
      'dark:hover:data-[state=checked]:bg-blue-500/10 dark:hover:data-[state=unchecked]:bg-orange-500/10',
      className
    )}
    {...props}
    ref={ref}
  >
    {props.checked ? (
      <>
        <svg
          className="h-3.5 w-3.5"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418"
          />
        </svg>
        <span>Global</span>
      </>
    ) : (
      <>
        <svg
          className="h-3.5 w-3.5"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z"
          />
        </svg>
        <span>Específico</span>
      </>
    )}
  </SwitchPrimitives.Root>
));
Switch.displayName = SwitchPrimitives.Root.displayName;

export { Switch };
