'use client';

import { useCallback, useEffect, useRef, useState, useTransition } from 'react';
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
import { Building2, Phone, Globe, MapPin, PlusCircle, ImageIcon, X } from 'lucide-react';
import { CompanySelectEdit } from '@/interfaces/CompanySelectEdit';
import { ContractModal } from './contract-modal';
import { ContractList } from './contract-list';
import Image from 'next/image';

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
  const [logoPreview, setLogoPreview] = useState<string | null>(
    initialData?.logoUrl || null
  );
  const [selectedLogoFile, setSelectedLogoFile] = useState<File | null>(null);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const initialLogoUrl = initialData?.logoUrl || '';

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
      logoUrl: initialData?.logoUrl || '',
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
  const isFormComplete =
    (formValues.name?.trim() ?? '') !== '' &&
    (formValues.rut?.trim() ?? '') !== '' &&
    (formValues.phone?.trim() ?? '') !== '';
  const hasFieldChanges =
    isEditing &&
    (Object.keys(formValues) as Array<keyof typeof formValues>).some(
      key => (formValues[key] ?? '') !== (form.formState.defaultValues?.[key] ?? '')
    );
  const hasLogoChanges =
    isEditing && (Boolean(selectedLogoFile) || (logoPreview || '') !== initialLogoUrl);
  const hasChanges = !isEditing || Boolean(hasFieldChanges || hasLogoChanges);
  const isButtonDisabled = isEditing
    ? !hasChanges || !isFormComplete || hasErrors
    : !isFormComplete || hasErrors;

  const normalizeWebsiteUrl = (url?: string) => {
    if (!url || !url.trim()) return undefined;
    const value = url.trim();
    return /^https?:\/\//i.test(value) ? value : `https://${value}`;
  };

  // Manejadores de logo
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      addToast({
        title: 'Error',
        description: 'El logo no debe superar los 5MB',
        timeout: 3000,
        icon: '❌',
        color: 'danger',
      });
      return;
    }
    setSelectedLogoFile(file);
    const reader = new FileReader();
    reader.onload = () => setLogoPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    setLogoPreview(null);
    setSelectedLogoFile(null);
    form.setValue('logoUrl', '');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Manejadores
  const handleEditContract = (contract: Contract) => {
    // TODO: Implementar edición de contratos
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
        let logoUrl = values.logoUrl || '';
        const normalizedUrl = normalizeWebsiteUrl(values.url);
        const logoFormData = new FormData();

        if (selectedLogoFile) {
          logoFormData.append('logo', selectedLogoFile);
        } else if (!logoPreview) {
          // El usuario eliminó el logo
          logoUrl = '';
        }

        setIsUploadingLogo(Boolean(selectedLogoFile));

        const response = isEditing
          ? await updateCompany({
              ...values,
              url: normalizedUrl,
              logoUrl,
              id: initialData!.value,
            }, logoFormData)
          : await createCompany({ ...values, url: normalizedUrl, logoUrl }, logoFormData);

        setIsUploadingLogo(false);

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
          setLogoPreview(null);
          setSelectedLogoFile(null);
        }

        router.push('/dashboard/companies');
        router.refresh();
      } catch (error) {
        setIsUploadingLogo(false);
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

          {/* Logo de la empresa */}
          <div className="col-span-12 mt-6">
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Logo de la Empresa
            </p>
            <div className="flex items-start gap-6">
              {/* Preview */}
              <div className="relative w-40 h-20 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-600 flex items-center justify-center overflow-hidden bg-slate-50 dark:bg-slate-800 flex-shrink-0">
                {logoPreview ? (
                  <>
                    <Image
                      src={logoPreview}
                      alt="Logo empresa"
                      fill
                      className="object-contain p-1"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveLogo}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600"
                    >
                      <X size={12} />
                    </button>
                  </>
                ) : (
                  <div className="flex flex-col items-center gap-1 text-slate-400">
                    <ImageIcon size={24} />
                    <span className="text-xs">Sin logo</span>
                  </div>
                )}
              </div>

              {/* Controles */}
              <div className="flex flex-col gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/svg+xml"
                  className="hidden"
                  onChange={handleLogoChange}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 border-cyan-500 text-cyan-500 hover:bg-cyan-500 hover:text-white dark:border-cyan-500 dark:text-cyan-500 dark:hover:bg-cyan-500 dark:hover:text-white"
                >
                  <ImageIcon size={14} />
                  {logoPreview ? 'Cambiar logo' : 'Subir logo'}
                </Button>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  PNG, JPG, SVG o WEBP · Máx. 5MB
                  <br />
                  Tamaño recomendado: 400×200px
                </p>
              </div>
            </div>
          </div>

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
            {isEditing && !hasErrors && !hasChanges && (
              <p className="text-amber-600 dark:text-amber-400 text-sm">
                No hay cambios para guardar.
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
              disabled={isButtonDisabled || isUploadingLogo}
              className={`${isButtonDisabled || isUploadingLogo ? 'opacity-50 bg-slate-500 cursor-not-allowed' : ''}`}
            >
              {isUploadingLogo
                ? 'Subiendo logo...'
                : isPending
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
