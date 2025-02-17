'use client'
import { ChangeEvent, useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { ThemeSwitch } from "./ThemeSwitch";

export const SwitcherMini = () => {
const [mounted, setMounted] = useState(false)
const { theme, setTheme } = useTheme()

    useEffect(() => {
        setMounted(true)
    }, [])

    const handleSwitch = (event: ChangeEvent<HTMLInputElement>) => {
        const isSelected = event.target.checked;
        if (isSelected) {
        setTheme('light')
        } else {
        setTheme('dark')
        }
    }

    if(!mounted) return null;

    return (
        <div className="fixed right-4 top-1/2  transform  -translate-y-1/2 opacity-40 hover:opacity-100 z-30 transition-all duration-500">
        <ThemeSwitch
            defaultSelected={theme === 'light' ? true : false}
            onChange={handleSwitch}
        />
        </div>
    );
};
