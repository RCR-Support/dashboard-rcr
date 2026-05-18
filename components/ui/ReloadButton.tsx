'use client';

import { useRouter } from 'next/navigation';

export function ReloadButton({ label = 'Reintentar' }: { label?: string }) {
  const router = useRouter();
  return (
    <button
      onClick={() => router.refresh()}
      className="px-4 py-2 text-sm rounded-lg border border-[#03c9d7] text-[#03c9d7] hover:bg-[#03c9d7] hover:text-white transition-colors whitespace-nowrap"
    >
      {label}
    </button>
  );
}

export default ReloadButton;
