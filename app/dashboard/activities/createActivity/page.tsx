'use client';
import ActivityForm from '../ActivityForm';
import { useRouter } from 'next/navigation';
import { withPermission } from '@/components/ui/auth/withPermission';
import { Breadcrumbs, BreadcrumbItem, Card, CardBody, CardHeader } from '@heroui/react';
import { ArrowLeft, Plus } from 'lucide-react';

function CreateActivityPage() {
  const router = useRouter();

  // Opcional: función para manejar el éxito y redirigir
  const handleSuccess = () => {
    router.push('/dashboard/activities');
  };

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Breadcrumbs */}
      <Breadcrumbs className="mb-6">
        <BreadcrumbItem
          onClick={() => router.push('/dashboard/activities')}
          className="cursor-pointer hover:text-primary"
        >
          Actividades
        </BreadcrumbItem>
        <BreadcrumbItem>
          Nueva Actividad
        </BreadcrumbItem>
      </Breadcrumbs>

      {/* Header con navegación */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-foreground-500 hover:text-foreground transition-colors"
        >
          <ArrowLeft size={20} />
          Volver
        </button>
      </div>

      {/* Card contenedor principal */}
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="flex flex-row items-center gap-3">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
            <Plus className="text-primary" size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Nueva Actividad</h1>
            <p className="text-foreground-500">Complete los campos para crear una nueva actividad</p>
          </div>
        </CardHeader>
        <CardBody>
          <ActivityForm onSuccess={handleSuccess} />
        </CardBody>
      </Card>
    </div>
  );
}

const ProtectedCreateActivity = withPermission(
  CreateActivityPage,
  '/dashboard/activities/createActivity'
);
export default ProtectedCreateActivity;
