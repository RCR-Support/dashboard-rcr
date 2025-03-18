// app/providers.tsx
"use client";
import { SessionProvider } from "next-auth/react";
import { HeroUIProvider } from '@heroui/react';
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { ToastProvider } from "@heroui/toast";

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <SessionProvider>
            <HeroUIProvider>
                <NextThemesProvider attribute="class" defaultTheme="system" enableSystem={true}>
                    <ToastProvider placement="top-center" />
                    {children}
                </NextThemesProvider>
            </HeroUIProvider>
        </SessionProvider>
    );
}
