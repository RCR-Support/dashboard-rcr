'use client'
import { SidebarDashboardMenu } from "./SidebarDashboardMenu"
import { FaRegCopyright } from "react-icons/fa6"
import { ImageDarkmode } from "./ImageDarkmode"

import { SessionProvider } from "next-auth/react"
import { IoCloseOutline } from "react-icons/io5";

import { useUIStore } from "@/store/ui/ui-store";
import clsx from "clsx";
import { useEffect } from "react"
import Link from "next/link"
import Image from "next/image"

import { useTheme } from "next-themes";
export const SidebarDashboard = () => {

    const isSideMenuOpen = useUIStore((state) => state.isSideMenuOpen);
    const closeMenu = useUIStore((state) => state.closeSideMenu);
    const openMenu = useUIStore((state) => state.openSideMenu);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 1024) { // Ajusta este valor según tu definición de LG
                openMenu();
            } else {
                closeMenu();
            }
        };

        window.addEventListener('resize', handleResize);
        handleResize(); // Llamar a handleResize inicialmente para establecer el estado correcto
        return () => window.removeEventListener('resize', handleResize);
    }, [openMenu, closeMenu]);

    useEffect(() => {
        if (window.innerWidth >= 1024) { // Ajusta este valor según tu definición de LG
            openMenu();
        }
    }, [openMenu]);

    const { theme } = useTheme();

    return (
        <SessionProvider>

        {/* Background black */}
        {isSideMenuOpen && (
            <div className="lg:hidden fixed top-0 left-0 w-screen h-screen z-10 bg-black opacity-30" />
        )}

        {/* Blur */}
        {isSideMenuOpen && (
            <div
                onClick={closeMenu}
                className="lg:hidden fade-in fixed top-0 left-0 w-screen h-screen z-10 backdrop-filter backdrop-blur-sm"
            />
        )}
        <div className={
            clsx(
                "lg:w-64",
                isSideMenuOpen ? "" : "lg:-ml-64"
            )
        }>
        <aside
            className={clsx(
                "fixed z-20 h-full top-0 left-0 flex flex-shrink-0 flex-col w-64 transition-transform duration-300 ease-in-out",
                isSideMenuOpen ? "translate-x-0" : "-translate-x-full"
            )}
        >
            <div className="relative flex-1 flex flex-col min-h-0 bg-white dark:bg-[#282c34] text-slate-800 dark:text-white ">

                <div className="px-3 w-full flex h-24 items-center justify-center">
                    <Link href="/">
                        <Image
                            src={theme === 'light' ? "/images/logoInv.svg" : "/images/logo.svg"}
                            alt="logo"
                            width={136}
                            height={50}
                            quality={100}
                        />
                    </Link>
                </div>

                <div className="absolute top-24 right-4 cursor-pointer lg:hidden">
                    <IoCloseOutline onClick={closeMenu} className="w-6 h-6 text-gray-800 dark:text-white border-1 border-gray-300 dark:border-gray-500" />
                </div>
                <SidebarDashboardMenu />

                <div className="flex flex-col items-center justify-center gap-2 pb-2 pt-4
                border-t-1 border-gray-200 dark:border-gray-600">
                    <div className="flex gap-3 items-center">
                        <span className="text-xs flex items-center gap-2"><FaRegCopyright />  2024   </span>
                        <div className="w-[95px] h-[40px]">
                            <ImageDarkmode/>
                        </div>
                    </div>
                    <span className="text-[10px]">Todos los derechos reservados</span>
                </div>
            </div>
        </aside>
        </div>
        </SessionProvider>
    )
}
