'use client'
import Link from "next/link"
import { usePathname } from "next/navigation"
import { AiFillDashboard, AiFillHome, AiFillSetting } from "react-icons/ai";
import { FaRegChartBar, FaUsers, FaProductHunt, FaMoneyBillWave, FaFileInvoiceDollar, FaUserTie, FaUserPlus } from "react-icons/fa";
import { MdAnalytics, MdOutlineAttachMoney } from "react-icons/md";
import { Accordion, AccordionItem } from '@heroui/react';
import { FaRegCircle } from "react-icons/fa6";
import { IoIosList } from "react-icons/io";
import { useSession } from "next-auth/react";
import { useUIStore } from "@/store/ui/ui-store";
import { useWindowSize } from "@/hooks/useWindowSize";

export const SidebarDashboardMenu = () => {
    const closeMenu = useUIStore((state) => state.closeSideMenu)
    const { data: session } = useSession()
    const isAdmin = ( session?.user?.role === "admin" )

    const { width } = useWindowSize();

    const router = usePathname();

    const handleClick = () => {
        if (width !== undefined && width <= 1023) { // Ajusta este valor según tu definición de LG
            closeMenu();
        }
    };
    return (
        <>
            <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
                <div className="flex-1 px-3 bg-white dark:bg-[#282c34] text-slate-600 dark:text-white divide-y space-y-1">
                    <ul className="flex-1 space-y-2">
                        <li className="text-[#757575] dark:text-[#f6f7cf] mb-6">Home</li>
                        <li className={`px-2 py-1
                            ${router === "/dashboard" 
                            ? "bg-[#03c9d7] dark:bg-[#03c9d7] rounded-lg text-white " 
                            : "hover:text-[#03c9d7] hover:bg-[#ebf9fa] dark:hover:bg-[#082e45] "}
                        `}>
                            <Link href="/dashboard" className={`font-normal rounded-lg flex items-center p-2 group`}>
                                <AiFillDashboard />
                                <span className="ml-3">Dashboard</span>
                            </Link>
                        </li>

                        <li className={`px-2 py-1
                            ${router === "/" 
                            ? "bg-[#03c9d7] dark:bg-[#03c9d7] rounded-lg " 
                            : "hover:text-[#03c9d7] hover:bg-[#ebf9fa] dark:hover:bg-[#082e45] "}
                        `}>
                            <Link href="/" className="font-normal rounded-lg flex items-center p-2 group justify-between">
                                <div className="flex items-center">
                                    <AiFillHome />
                                    <span className="ml-3">Inicio</span>
                                </div>
                                <span className="bg-[#fb9678] dark:bg-[#fb9678] text-white rounded-full w-5 h-5 flex justify-center items-center text-xs">
                                    3
                                </span>
                            </Link>
                        </li>

                        <li className={`px-2 py-1
                            ${router === "/reports" 
                            ? "bg-[#03c9d7] dark:bg-[#03c9d7] rounded-lg " 
                            : "hover:text-[#03c9d7] hover:bg-[#ebf9fa] dark:hover:bg-[#082e45] "}
                        `}>
                            <div className="font-normal rounded-lg flex items-center p-2 group justify-between">
                                <div className="flex items-center">
                                    <FaRegChartBar />
                                    <span className="ml-3">Reportes</span>
                                </div>
                                <span className="bg-[#fb9678] dark:bg-[#fb9678] text-white rounded-full w-5 h-5 flex justify-center items-center text-xs">
                                    3
                                </span>
                            </div>
                        </li>

                        {
                            isAdmin &&(
                                <>
                                    <li className={`px-2 py-1
                                        ${router === "/register" 
                                        ? "bg-[#03c9d7] dark:bg-[#03c9d7] rounded-lg " 
                                        : "hover:text-[#03c9d7] hover:bg-[#ebf9fa] dark:hover:bg-[#082e45] "}
                                    `}>
                                        <Link href="/register" className="font-normal rounded-lg flex items-center p-2 group justify-between">
                                            <div className="flex items-center">
                                                <FaUserPlus />
                                                <span className="ml-3">Nuevo Usuario</span>
                                            </div>
                                        </Link>
                                    </li>

                                    <li className={`px-2 py-1
                                        ${router === "/dashboard/admin" 
                                        ? "bg-[#03c9d7] dark:bg-[#03c9d7] rounded-lg " 
                                        : "hover:text-[#03c9d7] hover:bg-[#ebf9fa] dark:hover:bg-[#082e45] "}
                                    `}>
                                        <Link 
                                        href="/dashboard/admin" 
                                        className="font-normal rounded-lg flex items-center p-2 group justify-between"
                                        onClick={handleClick}
                                        >
                                            <div className="flex items-center">
                                                <FaUserPlus />
                                                <span className="ml-3">Pagina Administrador</span>
                                            </div>
                                        </Link>
                                    </li>
                                </>
                            )
                        }
                        <Accordion>
                            <AccordionItem className="px-2  hover:text-[#03c9d7] dark:hover:bg-[#082e45] hover:bg-[#ebf9fa] dark:bg-[#282c34] text-slate-800 dark:text-white" key="1" startContent={<IoIosList/>} aria-label="Dashboard" title="Accordions Title">
                                <ul className="pl-2">
                                    <li className={`px-2 py-1
                                        ${router === "/subpage1" 
                                        ? "bg-[#03c9d7] dark:bg-[#03c9d7] rounded-lg " 
                                        : "hover:text-[#03c9d7] hover:bg-[#ebf9fa] dark:hover:bg-[#082e45] "}
                                    `}>
                                        <Link href="/subpage1" className="font-normal rounded-lg flex items-center p-2 group">
                                            <FaRegCircle className="text-[6px]" />
                                            <span className="ml-3">Subpage 1</span>
                                        </Link>
                                    </li>
                                    <li className={`px-2 py-1
                                        ${router === "/subpage2" 
                                        ? "bg-[#03c9d7] dark:bg-[#03c9d7] rounded-lg " 
                                        : "hover:text-[#03c9d7] hover:bg-[#ebf9fa] dark:hover:bg-[#082e45] "}
                                    `}>
                                        <Link href="/subpage2" className="font-normal rounded-lg flex items-center p-2 group">
                                            <FaRegCircle className="text-[6px]" />
                                            <span className="ml-3">Subpage 2</span>
                                        </Link>
                                    </li>
                                    <li className={`px-2 py-1
                                        ${router === "/subpage3" 
                                        ? "bg-[#03c9d7] dark:bg-[#03c9d7] rounded-lg " 
                                        : "hover:text-[#03c9d7] hover:bg-[#ebf9fa] dark:hover:bg-[#082e45] "}
                                    `}>
                                        <Link href="/subpage3" className="font-normal rounded-lg flex items-center p-2 group">
                                            <FaRegCircle className="text-[6px]" />
                                            <span className="ml-3">Subpage 3</span>
                                        </Link>
                                    </li>
                                </ul>
                            </AccordionItem>
                        </Accordion>

                        <li className="text-[#757575] dark:text-[#f6f7cf] mb-6">Estadísticas</li>
                        <li className={`px-2 py-1
                            ${router === "/analytics" 
                            ? "bg-[#03c9d7] dark:bg-[#03c9d7] rounded-lg " 
                            : "hover:text-[#03c9d7] hover:bg-[#ebf9fa] dark:hover:bg-[#082e45] "}
                        `}>
                            <Link href="/analytics" className={`font-normal rounded-lg flex items-center p-2 group`}>
                                <MdAnalytics />
                                <span className="ml-3">Análisis</span>
                            </Link>
                        </li>
                        <li className={`px-2 py-1
                            ${router === "/sales" 
                            ? "bg-[#03c9d7] dark:bg-[#03c9d7] rounded-lg " 
                            : "hover:text-[#03c9d7] hover:bg-[#ebf9fa] dark:hover:bg-[#082e45] "}
                        `}>
                            <Link href="/sales" className={`font-normal rounded-lg flex items-center p-2 group`}>
                                <FaMoneyBillWave />
                                <span className="ml-3">Ventas</span>
                            </Link>
                        </li>
                        <li className={`px-2 py-1
                            ${router === "/customers" 
                            ? "bg-[#03c9d7] dark:bg-[#03c9d7] rounded-lg " 
                            : "hover:text-[#03c9d7] hover:bg-[#ebf9fa] dark:hover:bg-[#082e45] "}
                        `}>
                            <Link href="/customers" className={`font-normal rounded-lg flex items-center p-2 group`}>
                                <FaUsers />
                                <span className="ml-3">Clientes</span>
                            </Link>
                        </li>
                        <li className={`px-2 py-1
                            ${router === "/products" 
                            ? "bg-[#03c9d7] dark:bg-[#03c9d7] rounded-lg " 
                            : "hover:text-[#03c9d7] hover:bg-[#ebf9fa] dark:hover:bg-[#082e45] "}
                        `}>
                            <Link href="/products" className={`font-normal rounded-lg flex items-center p-2 group`}>
                                <FaProductHunt />
                                <span className="ml-3">Productos</span>
                            </Link>
                        </li>
                        <li className={`px-2 py-1
                            ${router === "/settings" 
                            ? "bg-[#03c9d7] dark:bg-[#03c9d7] rounded-lg " 
                            : "hover:text-[#03c9d7] hover:bg-[#ebf9fa] dark:hover:bg-[#082e45] "}
                        `}>
                            <Link href="/settings" className={`font-normal rounded-lg flex items-center p-2 group`}>
                                <AiFillSetting />
                                <span className="ml-3">Configuraciones</span>
                            </Link>
                        </li>

                        <li className="text-[#757575] dark:text-[#f6f7cf] mb-6">Finanzas</li>
                        <li className={`px-2 py-1
                            ${router === "/budget" 
                            ? "bg-[#03c9d7] dark:bg-[#03c9d7] rounded-lg " 
                            : "hover:text-[#03c9d7] hover:bg-[#ebf9fa] dark:hover:bg-[#082e45] "}
                        `}>
                            <Link href="/budget" className={`font-normal rounded-lg flex items-center p-2 group`}>
                                <FaFileInvoiceDollar />
                                <span className="ml-3">Presupuesto</span>
                            </Link>
                        </li>
                        <li className={`px-2 py-1
                            ${router === "/expenses" 
                            ? "bg-[#03c9d7] dark:bg-[#03c9d7] rounded-lg " 
                            : "hover:text-[#03c9d7] hover:bg-[#ebf9fa] dark:hover:bg-[#082e45] "}
                        `}>
                            <Link href="/expenses" className={`font-normal rounded-lg flex items-center p-2 group`}>
                                <MdOutlineAttachMoney />
                                <span className="ml-3">Gastos</span>
                            </Link>
                        </li>
                        <li className={`px-2 py-1
                            ${router === "/revenue" 
                            ? "bg-[#03c9d7] dark:bg-[#03c9d7] rounded-lg " 
                            : "hover:text-[#03c9d7] hover:bg-[#ebf9fa] dark:hover:bg-[#082e45] "}
                        `}>
                            <Link href="/revenue" className={`font-normal rounded-lg flex items-center p-2 group`}>
                                <FaMoneyBillWave />
                                <span className="ml-3">Ingresos</span>
                            </Link>
                        </li>

                        <li className="text-[#757575] dark:text-[#f6f7cf] mb-6">Recursos Humanos</li>
                        <li className={`px-2 py-1
                            ${router === "/employees" 
                            ? "bg-[#03c9d7] dark:bg-[#03c9d7] rounded-lg " 
                            : "hover:text-[#03c9d7] hover:bg-[#ebf9fa] dark:hover:bg-[#082e45] "}
                        `}>
                            <Link href="/employees" className={`font-normal rounded-lg flex items-center p-2 group`}>
                                <FaUserTie />
                                <span className="ml-3">Empleados</span>
                            </Link>
                        </li>
                        <li className={`px-2 py-1
                            ${router === "/payroll" 
                            ? "bg-[#03c9d7] dark:bg-[#03c9d7] rounded-lg " 
                            : "hover:text-[#03c9d7] hover:bg-[#ebf9fa] dark:hover:bg-[#082e45] "}
                        `}>
                            <Link href="/payroll" className={`font-normal rounded-lg flex items-center p-2 group`}>
                                <FaFileInvoiceDollar />
                                <span className="ml-3">Nómina</span>
                            </Link>
                        </li>
                        <li className={`px-2 py-1
                            ${router === "/recruitment" 
                            ? "bg-[#03c9d7] dark:bg-[#03c9d7] rounded-lg " 
                            : "hover:text-[#03c9d7] hover:bg-[#ebf9fa] dark:hover:bg-[#082e45] "}
                        `}>
                            <Link href="/recruitment" className={`font-normal rounded-lg flex items-center p-2 group`}>
                                <FaUserTie />
                                <span className="ml-3">Reclutamiento</span>
                            </Link>
                        </li>
                    </ul>
                </div>
            </div>
        </>
    )
}
