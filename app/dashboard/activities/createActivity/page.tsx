"use client";
import ActivityForm from "../ActivityForm";
import { useRouter } from "next/navigation";
import { withPermission } from '@/components/ui/auth/withPermission';

function CreateActivityPage() {
  const router = useRouter();

  // Opcional: función para manejar el éxito y redirigir
  const handleSuccess = () => {
    router.push("/dashboard/activities");
  };

  return (
    <div className="max-w-2xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Nueva Actividad</h1>
      <ActivityForm onSuccess={handleSuccess} />
    </div>
  );
}

const ProtectedCreateActivity = withPermission(CreateActivityPage, '/dashboard/activities/createActivity');
export default ProtectedCreateActivity;
