"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { FaAddressCard } from "react-icons/fa6";
import { PiUserListFill } from "react-icons/pi";
import { Tooltip } from "@heroui/tooltip";
import { CardUser } from "@/components/ui/dashboard/user/CardUser";
import { TablaUser } from "@/components/ui/dashboard/user/TablaUser";

import type { User } from "@/interfaces";
interface Props {
    users: User[];
}
export default function UsersView({ users }: Props) {
    const searchParams = useSearchParams();
    const view = searchParams.get("view") || "cards"; // cards por defecto
    const router = useRouter();

    const toggleView = (newView: "cards" | "table") => {
        const params = new URLSearchParams(searchParams);
        params.set("view", newView);
        router.push(`?${params.toString()}`, { scroll: false });
    };

    return (
        <div className={`
            grid grid-cols-12 grid-rows-auto gap-4 w-full mx-auto
            ${view === "cards" ? "lg:max-w-[1280px]" : "lg:max-w-[100%]"}
        `}>
        <div className="col-span-12 text-xl font-normal card-box flex justify-between">

            <h1>{view === "cards" ? "Cards de usuario" : "Lista de usuarios"}</h1>
            <div className="flex gap-4 items-center text-3xl dark:text-gray-400">
                <Tooltip content="Cards de usuario">
                    <button onClick={() => toggleView("cards")}
                    className={`hover:text-blue-400 ${view === "cards" ? "text-[#03c9d7]" : ""}`}>
                        <FaAddressCard size={32} />
                    </button>
                </Tooltip>
                <Tooltip content="Lista de usuarios">
                    <button onClick={() => toggleView("table")}
                    className={`hover:text-blue-400 ${view === "table" ? "text-[#03c9d7]" : ""}`}>
                        <PiUserListFill size={32} />
                    </button>
                </Tooltip>
            </div>
        </div>

        {view === "cards" ? <CardUser users={users} /> : <TablaUser users={users} />}
        </div>
    );
}
