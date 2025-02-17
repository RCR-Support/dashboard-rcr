import Image from "next/image"
import { SidebarDashboardMenu } from "./SidebarDashboardMenu"
import { FaRegCopyright } from "react-icons/fa6"
import { ImageDarkmode } from "./ImageDarkmode"

import { SessionProvider } from "next-auth/react"

export const SidebarDashboard = () => {
    return (
        <SessionProvider>
        <aside className="fixed  z-20 h-full top-0 left-0  flex lg:flex flex-shrink-0 flex-col w-64 transition-width duration-75 ">
            <div className="relative flex-1 flex flex-col min-h-0 bg-white dark:bg-[#282c34] text-slate-800 dark:text-white ">

                <div className="px-3 w-full flex h-24 items-center justify-center">
                    <span className="w-full py-4 text-2xl font-semibold text-center whitespace-nowrap border-1 border-gray-200 dark:border-gray-600 ">LOGO</span>
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
        </SessionProvider>
    )
}
