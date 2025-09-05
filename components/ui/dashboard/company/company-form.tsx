'use client';

import { useCallback, useEffect, useState, useTransition } from 'react';
import { FormInput } from '@/components/ui/form/FormInput';
import { useRouter } from 'next/navigation';
import { companySchema } from '@/lib/validation-company';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import {
  createCompany,
  updateCompany,
} from '@/actions/company/company-actions';
import {
  getContracts,
  getAdminContractors,
  createContract,
} from '@/actions/contract/contract-actions';
import { addToast } from '@heroui/toast';
import { Building2, Phone, Globe, MapPin, PlusCircle } from 'lucide-react';
import { CompanySelectEdit } from '@/interfaces/CompanySelectEdit';
import { ContractModal } from './contract-modal';
import { ContractList } from './contract-list';

import { Contract, ContractFormValues } from '@/interfaces/contract.interface';
import { AdminContractor } from '@/interfaces/admin-contractor.interface';

interface CompanyFormProps {
  initialData?: CompanySelectEdit;
  isEditing?: boolean;
}

const CompanyForm = ({ initialData, isEditing = false }: CompanyFormProps) => {
  // Estados
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [hasAttempted, setHasAttempted] = useState(false);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [adminContractors, setAdminContractors] = useState<AdminContractor[]>(
    []
  );
  const [isContractModalOpen, setIsContractModalOpen] = useState(false);

  const router = useRouter();
  // Función para cargar los contratos
  const loadContracts = useCallback(async () => {
    if (isEditing && initialData?.value) {
      try {
        const response = await getContracts(initialData.value);
        if (response.success && response.contracts) {
          setContracts(response.contracts);
        }
      } catch (error) {
        console.error('Error cargando contratos:', error);
      }
    }
  }, [isEditing, initialData]);

  // Cargar datos iniciales
  useEffect(() => {
    if (isEditing && initialData?.value) {
      const loadData = async () => {
        try {
          const [contractsResponse, adminsResponse] = await Promise.all([
            getContracts(initialData.value),
            getAdminContractors(),
          ]);

          if (contractsResponse.success && contractsResponse.contracts) {
            setContracts(contractsResponse.contracts);
          }

          if (adminsResponse.success && adminsResponse.adminContractors) {
            setAdminContractors(adminsResponse.adminContractors);
          }
        } catch (error) {
          console.error('Error cargando datos:', error);
        }
      };

      loadContracts();
      loadData();
    }
  }, [isEditing, initialData, loadContracts]);

  // Configuración del formulario
  const form = useForm<z.infer<typeof companySchema>>({
    resolver: zodResolver(companySchema),
    mode: 'all',
    defaultValues: {
      name: initialData?.name || '',
      phone: initialData?.phone || '',
      rut: initialData?.rut || '',
      url: initialData?.url || '',
      city: initialData?.city || '',
    },
  });

  // Campos del formulario
  const FormInputs = [
    {
      name: 'name',
      label: 'Nombre de la Empresa',
      placeholder: 'ej: Empresa S.A.',
      required: true,
      icon: Building2,
    },
    {
      name: 'rut',
      label: 'RUT',
      placeholder: 'ej: 12.345.678-9',
      required: true,
    },
    {
      name: 'phone',
      label: 'Teléfono',
      placeholder: '12345678',
      required: true,
      icon: Phone,
      small: 'Solo números, sin +56',
    },
    {
      name: 'city',
      label: 'Ciudad',
      placeholder: 'ej: Santiago',
      icon: MapPin,
    },
    {
      name: 'url',
      label: 'Sitio Web',
      placeholder: 'https://ejemplo.com',
      icon: Globe,
    },
  ];

  // Validaciones del formulario
  const formValues = form.watch();
  const hasErrors = Object.keys(form.formState.errors).length > 0;
  const isFormComplete = Object.values(formValues).every(
    value => value !== undefined && value !== ''
  );
  const hasChanges =
    isEditing &&
    (Object.keys(formValues) as Array<keyof typeof formValues>).some(
      key => formValues[key] !== form.formState.defaultValues?.[key]
    );
  const isButtonDisabled = isEditing
    ? !hasChanges || !isFormComplete || hasErrors
    : !isFormComplete || hasErrors;

  // Manejadores
  const handleEditContract = (contract: Contract) => {
    // TODO: Implementar edición
    console.log('Editar contrato:', contract);
  };

  const handleContractSubmit = async (values: ContractFormValues) => {
    try {
      const response = await createContract(values);

      if (response.success) {
        addToast({
          title: 'Contrato creado',
          description: 'El contrato se ha creado correctamente',
          timeout: 2000,
          icon: '✅',
          color: 'success',
          variant: 'flat',
          radius: 'md',
          shouldShowTimeoutProgress: true,
        });
        setIsContractModalOpen(false);
        // Recargar contratos
        await loadContracts();
      } else {
        addToast({
          title: 'Error',
          description: response.error || 'Error al crear el contrato',
          timeout: 2000,
          icon: '❌',
          color: 'danger',
          variant: 'flat',
          radius: 'md',
          shouldShowTimeoutProgress: true,
        });
      }
    } catch (error) {
      console.error('Error:', error);
      addToast({
        title: 'Error',
        description: 'Ocurrió un error inesperado',
        timeout: 2000,
        icon: '❌',
        color: 'danger',
        variant: 'flat',
        radius: 'md',
        shouldShowTimeoutProgress: true,
      });
    }
  };

  const onSubmit = async (values: z.infer<typeof companySchema>) => {
    if (!hasAttempted) {
      setHasAttempted(true);
      const isValid = await form.trigger();
      if (!isValid) return;
    }

    if (hasErrors) return;

    setError(null);
    startTransition(async () => {
      try {
        const response = isEditing
          ? await updateCompany({ ...values, id: initialData!.value })
          : await createCompany(values);

        if (response.error) {
          setError(response.error);
          return;
        }

        addToast({
          title: `Empresa ${isEditing ? 'actualizada' : 'creada'} correctamente`,
          description: `La empresa ha sido ${isEditing ? 'actualizada' : 'registrada'} en el sistema`,
          timeout: 2000,
          icon: '✅',
          color: 'success',
          variant: 'flat',
          radius: 'md',
          shouldShowTimeoutProgress: true,
        });

        if (!isEditing) {
          form.reset();
          setHasAttempted(false);
        }

        router.push('/dashboard/companies');
        router.refresh();
      } catch (error) {
        setError('Ocurrió un error inesperado. Por favor, intente nuevamente.');
      }
    });
  };

  return (
    <>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="grid grid-cols-12 col-span-12 gap-x-6"
        >
          {FormInputs.map(field => (
            <FormInput key={field.name} {...field} form={form} />
          ))}

          <div className="col-span-12 border-t border-b border-slate-200 dark:border-slate-700 mt-8 pt-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-200">
                Lista de Contratos
              </h2>
              {isEditing && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsContractModalOpen(true)}
                  className="flex  items-center gap-2 border-cyan-500 dark:border-cyan-500 text-cyan-500 dark:text-cyan-500 hover:bg-cyan-500 hover:text-white dark:hover:bg-cyan-500 dark:hover:text-white"
                >
                  <PlusCircle size={16} />
                  Agregar nuevo Contrato
                </Button>
              )}
            </div>
            <ContractList
              contracts={contracts}
              onEditContract={handleEditContract}
              onAddContract={() => setIsContractModalOpen(true)}
              isEditing={isEditing}
            />
          </div>

          <div className="col-span-7 mt-8">
            {error && <p className="text-red-500">{error}</p>}
            {hasErrors && (
              <p className="text-red-600 dark:text-red-400 text-sm fade-in flex gap-2">
                Revisa los <strong>campos marcados</strong>
                <span className="hidden md:block">
                  antes de enviar el formulario.
                </span>
              </p>
            )}
          </div>

          <div className="col-span-5 flex justify-end mt-8">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/dashboard/companies')}
              className="mr-4"
            >
              Cancelar
            </Button>

            <Button
              type="submit"
              variant="default"
              disabled={isButtonDisabled}
              className={`${isButtonDisabled ? 'opacity-50 bg-slate-500 cursor-not-allowed' : ''}`}
            >
              {isPending
                ? isEditing
                  ? 'Actualizando...'
                  : 'Creando...'
                : isEditing
                  ? 'Actualizar Empresa'
                  : 'Crear Empresa'}
            </Button>
          </div>
        </form>
      </Form>

      <ContractModal
        isOpen={isContractModalOpen}
        onClose={() => setIsContractModalOpen(false)}
        companyId={initialData?.value || ''}
        onSubmit={handleContractSubmit}
        adminContractors={adminContractors}
      />
    </>
  );
};

export default CompanyForm;
