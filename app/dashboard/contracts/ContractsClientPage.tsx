'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardBody, CardHeader, Chip, Input, Button } from '@heroui/react';
import { FileText, Search, Calendar, Building2, User, FileCheck, Link2 } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import Link from 'next/link';
import { Contract } from '@/interfaces/contract.interface';
import { Tooltip } from '@heroui/react';
import { SubcontractModal } from '@/components/ui/dashboard/company/subcontract-modal';

interface Props {
  contracts: Contract[];
  canCreate: boolean;
  isAdmin: boolean;
  canLinkSubcontract?: boolean;
}

export default function ContractsClientPage({ contracts, canCreate, isAdmin, canLinkSubcontract }: Props) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [subcontractContract, setSubcontractContract] = useState<Contract | null>(null);

  const filteredContracts = contracts.filter(contract => 
    contract.contractName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contract.contractNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contract.company?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (contract: Contract) => {
    if (contract.deletedAt) return 'danger';
    
    const now = new Date();
    const endDate = new Date(contract.finalDate);
    const startDate = new Date(contract.initialDate);
    
    if (now < startDate) return 'warning';
    if (now > endDate) return 'danger';
    return 'success';
  };

  const getStatusLabel = (contract: Contract) => {
    if (contract.deletedAt) return 'ELIMINADO';
    
    const now = new Date();
    const endDate = new Date(contract.finalDate);
    const startDate = new Date(contract.initialDate);
    
    if (now < startDate) return 'POR INICIAR';
    if (now > endDate) return 'FINALIZADO';
    return 'ACTIVO';
  };

  return (
    <div className="grid grid-cols-12 gap-4 w-full mx-auto">
      {/* Header */}
      <div className="col-span-12 card-box">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <FileText className="h-6 w-6" />
              {isAdmin ? 'Todos los Contratos' : 'Mis Contratos'}
            </h1>
            <p className="text-sm text-default-500 mt-1">
              {isAdmin 
                ? 'Gestión completa de contratos del sistema' 
                : 'Contratos donde eres administrador'}
            </p>
          </div>
          {canCreate && (
            <Button
              as={Link}
              href="/dashboard/companies"
              color="primary"
              variant="flat"
            >
              Gestionar desde Empresas
            </Button>
          )}
        </div>
      </div>

      {/* Search */}
      <div className="col-span-12 card-box">
        <Input
          isClearable
          classNames={{
            inputWrapper: 'border-1',
          }}
          placeholder="Buscar por nombre, número o empresa..."
          startContent={<Search className="text-default-300" />}
          value={searchTerm}
          variant="bordered"
          onClear={() => setSearchTerm('')}
          onValueChange={setSearchTerm}
        />
      </div>

      {/* Stats */}
      <div className="col-span-12 md:col-span-4">
        <Card>
          <CardBody className="flex flex-row items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-default-500">Total Contratos</p>
              <p className="text-2xl font-bold">{contracts.length}</p>
            </div>
          </CardBody>
        </Card>
      </div>

      <div className="col-span-12 md:col-span-4">
        <Card>
          <CardBody className="flex flex-row items-center gap-4">
            <div className="p-3 bg-success/10 rounded-lg">
              <FileCheck className="h-6 w-6 text-success" />
            </div>
            <div>
              <p className="text-sm text-default-500">Activos</p>
              <p className="text-2xl font-bold">
                {contracts.filter(c => {
                  if (c.deletedAt) return false;
                  const now = new Date();
                  const endDate = new Date(c.finalDate);
                  const startDate = new Date(c.initialDate);
                  return now >= startDate && now <= endDate;
                }).length}
              </p>
            </div>
          </CardBody>
        </Card>
      </div>

      <div className="col-span-12 md:col-span-4">
        <Card>
          <CardBody className="flex flex-row items-center gap-4">
            <div className="p-3 bg-secondary/10 rounded-lg">
              <Building2 className="h-6 w-6 text-secondary" />
            </div>
            <div>
              <p className="text-sm text-default-500">Total Solicitudes</p>
              <p className="text-2xl font-bold">
                {contracts.reduce((acc, c) => acc + (c._count?.application || 0), 0)}
              </p>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Contracts List */}
      <div className="col-span-12">
        {filteredContracts.length === 0 ? (
          <Card>
            <CardBody className="text-center py-10">
              <FileText className="h-12 w-12 text-default-300 mx-auto mb-4" />
              <p className="text-default-500">
                {searchTerm ? 'No se encontraron contratos' : 'No hay contratos disponibles'}
              </p>
            </CardBody>
          </Card>
        ) : (
          <div className="grid grid-cols-12 gap-4">
            {filteredContracts.map((contract) => (
              <Card key={contract.id} className="col-span-12 md:col-span-6 lg:col-span-4">
                <CardHeader className="flex justify-between items-start">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-lg font-semibold">{contract.contractName}</h3>
                      {contract.isSubcontract && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-cyan-100 dark:bg-cyan-900/40 text-cyan-700 dark:text-cyan-300">
                          <Link2 className="h-3 w-3" />
                          Subcontratista
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-default-500">N° {contract.contractNumber}</p>
                    {contract.isSubcontract && contract.mandanteName && (
                      <p className="text-xs text-cyan-600 dark:text-cyan-400 mt-0.5 flex items-center gap-1">
                        <Building2 className="h-3 w-3" />
                        Mandante: <span className="font-semibold">{contract.mandanteName}</span>
                      </p>
                    )}
                  </div>
                  <Chip 
                    color={getStatusColor(contract)}
                    variant="flat"
                    size="sm"
                  >
                    {getStatusLabel(contract)}
                  </Chip>
                </CardHeader>
                <CardBody>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Building2 className="h-4 w-4 text-default-400" />
                      <span className="font-medium">{contract.company?.name || 'Sin nombre'}</span>
                      <span className="text-default-400">({contract.company?.rut})</span>
                    </div>

                    {contract.userAc && (
                      <div className="flex items-center gap-2 text-sm">
                        <User className="h-4 w-4 text-default-400" />
                        <span>Admin: {contract.userAc.displayName}</span>
                      </div>
                    )}

                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-default-400" />
                      <span>
                        {format(new Date(contract.initialDate), 'dd MMM yyyy', { locale: es })}
                        {' - '}
                        {format(new Date(contract.finalDate), 'dd MMM yyyy', { locale: es })}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                      <FileCheck className="h-4 w-4 text-default-400" />
                      <span>{contract._count?.application || 0} solicitudes</span>
                    </div>

                    {/* Sub-empresas vinculadas a este contrato */}
                    {contract.subcontracts && contract.subcontracts.length > 0 && (
                      <div className="mt-1 pl-2 border-l-2 border-cyan-300 dark:border-cyan-700">
                        <p className="text-xs font-semibold text-cyan-600 dark:text-cyan-400 mb-1 flex items-center gap-1">
                          <Link2 className="h-3 w-3" />
                          Sub-empresas ({contract.subcontracts.length})
                        </p>
                        {contract.subcontracts.map(sub => (
                          <div key={sub.id} className="flex flex-col text-xs text-default-500 py-0.5 gap-0.5">
                            <div className="flex items-center justify-between">
                              <span className="flex items-center gap-1">
                                <Building2 className="h-3 w-3 text-cyan-500" />
                                {sub.subCompany.name ?? sub.subCompany.rut}
                              </span>
                              <span className="px-1.5 py-0.5 rounded-full bg-cyan-100 dark:bg-cyan-900/40 text-cyan-700 dark:text-cyan-300">
                                {sub.status}
                              </span>
                            </div>
                            <span className="text-[10px] text-default-400 pl-4">
                              Rep: {sub.representativeName ?? <span className="italic">Sin representante asignado</span>}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex gap-2 mt-4">
                      {canLinkSubcontract && !contract.deletedAt && (
                        <Button
                          size="sm"
                          variant="flat"
                          color="primary"
                          startContent={<Link2 className="h-3.5 w-3.5" />}
                          onPress={() => setSubcontractContract(contract)}
                        >
                          Sub-empresa
                        </Button>
                      )}
                      {isAdmin && contract.company?.id && (
                        <Button
                          as={Link}
                          href={`/dashboard/companies/edit/${contract.company.id}`}
                          size="sm"
                          variant="flat"
                          color="primary"
                        >
                          Ver Empresa
                        </Button>
                      )}
                      {(contract._count?.application || 0) > 0 ? (
                        <Button
                          as={Link}
                          href={`/dashboard/applications?contract=${contract.id}`}
                          size="sm"
                          variant="flat"
                        >
                          Ver Solicitudes ({contract._count?.application})
                        </Button>
                      ) : (
                        <Tooltip content="Este contrato no tiene solicitudes registradas">
                          <Button
                            size="sm"
                            variant="flat"
                            isDisabled
                          >
                            Sin Solicitudes
                          </Button>
                        </Tooltip>
                      )}
                    </div>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        )}
      </div>

      {subcontractContract && (
        <SubcontractModal
          isOpen={!!subcontractContract}
          onClose={() => setSubcontractContract(null)}
          contract={subcontractContract}
          onSuccess={() => { setSubcontractContract(null); router.refresh(); }}
        />
      )}
    </div>
  );
}
