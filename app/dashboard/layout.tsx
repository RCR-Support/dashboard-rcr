import { NavDashboard } from "../../components/ui/dashboard/nav/NavDashboard";
import { SidebarDashboard } from "../../components/ui/dashboard/sidebar/SidebarDashboard";


export default function DashboardLayout({ children }: { children: React.ReactNode;}) {
    return (
        <main className="bg-[#f0f0f0] dark:bg-[#1a202c] flex ">

            <SidebarDashboard />

            <div className="flex flex-col min-h-screen flex-1 gap-4 p-4">
                <NavDashboard/>
                <div className="container mx-auto mt-6">
                    {children}
                </div>
            </div>

        </main>
    );
}
