'use client'
import { useUIStore } from "@/store/ui/ui-store";
import { IoMenu } from "react-icons/io5";

export default function MenuIcon() {
    const openSideMenu = useUIStore((state) => state.openSideMenu);
    return (
        <button
        className="md:hidden absolute left-4 "
        onClick={openSideMenu}
        >
            <IoMenu size={40} className="text-gray-100" />
        </button>
    )
}
