 'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Contract } from '@/interfaces/contract.interface';
import { useApplicationFormStore } from '@/store/application-form-store';
import { useRoleStore } from '@/store/ui/roleStore';
import { SearchSelect } from '@/components/ui/search-select';
import { fetchCompanies } from '@/actions';
import { getCompanyContracts } from '@/actions/contract/get-company-contracts';
import { getCompanyById } from '@/actions/company/company-actions';
import Link from 'next/link';

interface ContractStepProps {
  initialData: Contract | null;
  availableContracts: Contract[];
  onNext: (contract: Contract) => void;
  onCancel?: () => void;
}

export function ContractStep({
  initialData,
  availableContracts,
  onNext,
  onCancel,
}: ContractStepProps) {
  const storedContract = useApplicationFormStore(state => state.contract);

  const selectedRole = useRoleStore(state => state.selectedRole);
  const isAdmin = selectedRole === 'admin';

  const [companiesOptions, setCompaniesOptions] = useState<{
    value: string;
    label: string;
    description?: string;
  }[]>([]);
  const [loadingCompanies, setLoadingCompanies] = useState(false);

  useEffect(() => {
    const store = useApplicationFormStore.getState();
    
    // Si ya hay un contrato en el store, no hacer nada
    if (store.contract) return;
    
    // Si hay initialData, usarlo
    if (initialData) {
      store.setContract(initialData);
      return;
    }
    
    // Auto-selección si hay un solo contrato
    if (availableContracts.length === 1) {
      store.setContract(availableContracts[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Solo ejecutar una vez al montar

  useEffect(() => {
    // Si el usuario es admin y no hay company en el store, cargar empresas disponibles
    const store = useApplicationFormStore.getState();
    if (!isAdmin || store.company) return;

    const loadCompanies = async () => {
      setLoadingCompanies(true);
      const res = await fetchCompanies(true);
      if (res.ok && res.companies) {
        setCompaniesOptions(res.companies);
      }
      setLoadingCompanies(false);
    };

    loadCompanies();
  }, [isAdmin]);

  const handleSelect = (selectedContract: Contract) => {
    useApplicationFormStore.getState().setContract(selectedContract);
    onNext(selectedContract);
  };

  const handleCompanySelect = async (companyId: string) => {
    if (!companyId) return;

    // Obtener datos completos de la empresa (teléfono, usuarios, etc.)
    const companyResp = await getCompanyById(companyId);
    if (companyResp.error) {
      // Si no se pudo obtener la empresa, caer de vuelta a valores mínimos
      useApplicationFormStore.getState().setCompany({ id: companyId, name: companyId } as any);
    } else if (companyResp.success && companyResp.company) {
      const comp = companyResp.company as any;
      const email = comp.users && comp.users.length > 0 ? comp.users[0].email : undefined;
      useApplicationFormStore.getState().setCompany({
        id: comp.value || companyId,
        name: comp.name || comp.value || companyId,
        phone: comp.phone || undefined,
        email: email || undefined,
      });
    }

    // Cargar contratos para la empresa seleccionada
    const result = await getCompanyContracts(companyId);
    if (result.ok && result.contracts) {
      useApplicationFormStore.getState().setAvailableContracts(result.contracts);
      if (result.contracts.length === 1) {
        useApplicationFormStore.getState().setContract(result.contracts[0]);
      }
    }
  };

  const storeSnapshot = useApplicationFormStore.getState();
  const showAdminCompanySelector = isAdmin && !storeSnapshot.company;

  return (
    <div className="space-y-6">
      {availableContracts.length === 0 ? (
        showAdminCompanySelector ? (
          <div className="text-center py-6">
            <div className="max-w-md mx-auto space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Selecciona la empresa</h3>
              <p className="text-sm text-gray-500">Como administrador, selecciona la empresa para la cual quieres crear la solicitud.</p>
              <div className="pt-4">
                <SearchSelect
                  options={companiesOptions.map(c => ({ label: c.label, value: c.value }))}
                  onValueChange={value => handleCompanySelect(value)}
                  placeholder={loadingCompanies ? 'Cargando empresas...' : 'Selecciona una empresa'}
                />
              </div>
              <div className="mt-3 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg text-left">
                <p className="text-sm text-amber-700 dark:text-amber-300">
                  <strong>Nota:</strong> Solo se muestran empresas que tienen al menos un contrato registrado. 
                  Si no encuentras la empresa, primero debes{' '}
                  <Link href="/dashboard/companies" className="underline font-medium hover:text-amber-900 dark:hover:text-amber-100">
                    crear un contrato desde el módulo de Empresas
                  </Link>.
                </p>
              </div>
              <div className="pt-4">
                <Button type="button" variant="outline" onClick={onCancel}>Volver al inicio</Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12 border-2 border-dashed rounded-lg">
            <div className="max-w-md mx-auto space-y-4">
              <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">No hay contratos activos</h3>
                <p className="text-sm text-gray-500 mt-2">
                  No tienes contratos vigentes para crear solicitudes de acreditación.
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Todos tus contratos han expirado o no tienes contratos asignados.
                </p>
              </div>
              <div className="pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                >
                  Volver al inicio
                </Button>
              </div>
            </div>
          </div>
        )
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {availableContracts.map((contract: Contract) => (
          <Card
            key={contract.id}
            onClick={() => useApplicationFormStore.getState().setContract(contract)}
            className={`relative p-4 cursor-pointer transition-all hover:shadow-md ${
              storedContract?.id === contract.id
                ? 'border-2 border-primary bg-primary/5 shadow-md'
                : 'border border-gray-200 hover:border-primary/50'
            }`}
          >
            {/* Indicador de selección */}
            <div className="absolute top-0 right-0 p-2">
              <div
                className={`flex items-center justify-center h-6 w-6 rounded-full border-2 transition-all ${
                  storedContract?.id === contract.id
                    ? 'border-primary bg-primary text-white'
                    : 'border-muted bg-transparent'
                }`}
              >
                {storedContract?.id === contract.id && (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-medium pr-6">
                Contrato #{contract.contractNumber}
              </h3>
              <p className="text-sm text-muted-foreground">
                {contract.contractName}
              </p>
              <div className="text-sm space-y-2">
                <div>
                  <p>
                    <strong>Inicio:</strong>{' '}
                    {new Date(contract.initialDate).toLocaleDateString()}
                  </p>
                  <p>
                    <strong>Término:</strong>{' '}
                    {new Date(contract.finalDate).toLocaleDateString()}
                  </p>
                </div>
                <div className="pt-2 border-t">
                  <p className="text-xs text-muted-foreground mb-1">
                    Administrador de contrato:
                  </p>
                  <p className="font-medium">
                    {contract.userAc?.displayName || 'No asignado'}
                  </p>
                </div>

                {/* Botón de seleccionar contrato */}
                <div className="pt-4">
                  <Button
                    className="w-full"
                    variant={
                      storedContract?.id === contract.id ? 'default' : 'outline'
                    }
                    onClick={e => {
                      e.stopPropagation(); // Evita que el click se propague a la Card
                      if (storedContract?.id === contract.id) {
                        handleSelect(contract);
                      } else {
                        useApplicationFormStore.getState().setContract(contract);
                      }
                    }}
                  >
                    {storedContract?.id === contract.id
                      ? 'Continuar con este contrato'
                      : 'Seleccionar contrato'}
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
        </div>
      )}
    </div>
  );
}
