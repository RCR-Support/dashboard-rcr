import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { getProfileUserData, ProfileUserResponse } from "@/actions/user/get-profile-user-data";
import { roleMapping } from "@/lib/roleMapping";
import { useRoleStore } from "@/store/ui/roleStore";
import { FaBell } from "react-icons/fa";
import UserInfoProfile from "./UserInfoProfile";

const UserProfile = () => {
    const { data: session } = useSession();
    const selectedRole = useRoleStore((state) => state.selectedRole);
    const [profileData, setProfileData] = useState<ProfileUserResponse['user']>();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadProfileData = async () => {
            try {
                const response = await getProfileUserData();
                if (response.ok && response.user) {
                    setProfileData(response.user);
                    console.log("Datos del perfil cargados:", response.user);
                } else {
                    console.error("Error:", response.message);
                }
            } catch (error) {
                console.error("Error al cargar datos del perfil:", error);
            } finally {
                setLoading(false);
            }
        };

        if (session?.user) {
            loadProfileData();
        }
    }, [session?.user]);

    if (!session) {
        return <div>No autenticado</div>;
    }

    if (loading) {
        return (
            <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
                <span>Cargando...</span>
            </div>
        );
    }

    return (
        <div className="flex items-center space-x-4 max-w-80">
            <div className="relative">
                <div className="rounded-full p-4 cursor-pointer">
                    <FaBell />
                </div>
                <span className="absolute top-0 right-0 inline-flex items-center justify-center h-5 w-5 text-xs font-bold leading-none text-red-100 bg-[#fb9678] rounded-full">
                    3
                </span>
            </div>
            <UserInfoProfile
                name={profileData?.displayName || 'No Name'}
                userName={profileData?.userName || ''}
                email={profileData?.email || ''}
                role={roleMapping[selectedRole as keyof typeof roleMapping]}
                // availableRoles={session?.user?.roles || []}
            />
        </div>
    );
};

export default UserProfile;
