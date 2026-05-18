'use client';

import { useState, useTransition } from 'react';
import {
  Card,
  CardBody,
  CardHeader,
  Chip,
  Button,
  Input,
} from '@heroui/react';
import { Building2, Search, CheckCircle, XCircle, Clock } from 'lucide-react';
import { SubcontractStatus } from '@prisma/client';
import { useRouter } from 'next/navigation';

interface SubcontractItem {
  id: string;
  status: SubcontractStatus;
  isActive: boolean;
  createdAt: Date;
  subCompany: { id: string; name: string | null; rut: string; city: string | null };
  contract: {
    id: string;
    contractName: string;
    contractNumber: string;
    Company: { id: string; name: string | null; rut: string };
  };
}

interface Props {
  subcontracts: SubcontractItem[];
}

const statusConfig: Record<SubcontractStatus, { label: string; color: 'warning' | 'success' | 'default' }> = {
  pendiente: { label: 'Pendiente', color: 'warning' },
  activo: { label: 'Activo', color: 'success' },
  inactivo: { label: 'Inactivo', color: 'default' },
};

export default function SubcontractsAdminClient({ subcontracts }: Props) {
  const [search, setSearch] = useState('');
  const [isPending, startTransition] = useTransition();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const router = useRouter();

  const filtered = subcontracts.filter(s =>
    s.subCompany.name?.toLowerCase().includes(search.toLowerCase()) ||
    s.subCompany.rut.includes(search) ||
    s.contract.contractNumber.includes(search) ||
    s.contract.contractName.toLowerCase().includes(search.toLowerCase())
  );

  const pendientes = filtered.filter(s => s.status === 'pendiente');
  const activos = filtered.filter(s => s.status === 'activo');
  const inactivos = filtered.filter(s => s.status === 'inactivo');

  const patchSubcontract = async (id: string, body: { status?: SubcontractStatus; isActive?: boolean }) => {
    setLoadingId(id);
    setErrors(prev => ({ ...prev, [id]: '' }));
    try {
      const res = await fetch(`/api/subcontracts/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const text = await res.text();
        setErrors(prev => ({ ...prev, [id]: text }));
        return;
      }
      startTransition(() => router.refresh());
    } catch {
      setErrors(prev => ({ ...prev, [id]: 'Error al actualizar' }));
    } finally {
      setLoadingId(null);
    }
  };

  const renderCard = (s: SubcontractItem) => {
    const cfg = statusConfig[s.status];
    const isLoading = loadingId === s.id && isPending;
    return (
      <Card key={s.id} className="col-span-12 md:col-span-6 lg:col-span-4">
        <CardHeader className="flex justify-between items-start gap-2">
          <div>
            <p className="font-semibold">{s.subCompany.name ?? 'Sin nombre'}</p>
            <p className="text-xs text-default-500">{s.subCompany.rut}</p>
            {s.subCompany.city && <p className="text-xs text-default-400">{s.subCompany.city}</p>}
          </div>
          <Chip color={cfg.color} variant="flat" size="sm">{cfg.label}</Chip>
        </CardHeader>
        <CardBody className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <Building2 className="h-4 w-4 text-default-400 shrink-0" />
            <div>
              <p className="text-xs text-default-400">Mandante</p>
              <p>{s.contract.Company.name ?? s.contract.Company.rut}</p>
            </div>
          </div>
          <div className="text-sm">
            <p className="text-xs text-default-400">Contrato</p>
            <p>{s.contract.contractName}</p>
            <p className="text-default-500">N° {s.contract.contractNumber}</p>
          </div>

          {errors[s.id] && (
            <p className="text-xs text-danger-600 mt-1">{errors[s.id]}</p>
          )}

          <div className="flex gap-2 pt-2">
            {s.status === 'pendiente' && (
              <>
                <Button
                  size="sm"
                  color="success"
                  variant="flat"
                  startContent={<CheckCircle className="h-3.5 w-3.5" />}
                  isLoading={isLoading}
                  onPress={() => patchSubcontract(s.id, { status: 'activo', isActive: true })}
                >
                  Aprobar
                </Button>
                <Button
                  size="sm"
                  color="danger"
                  variant="flat"
                  startContent={<XCircle className="h-3.5 w-3.5" />}
                  isLoading={isLoading}
                  onPress={() => patchSubcontract(s.id, { status: 'inactivo', isActive: false })}
                >
                  Rechazar
                </Button>
              </>
            )}
            {s.status === 'activo' && (
              <Button
                size="sm"
                color="warning"
                variant="flat"
                isLoading={isLoading}
                onPress={() => patchSubcontract(s.id, { status: 'inactivo', isActive: false })}
              >
                Desactivar
              </Button>
            )}
            {s.status === 'inactivo' && (
              <Button
                size="sm"
                color="success"
                variant="flat"
                isLoading={isLoading}
                onPress={() => patchSubcontract(s.id, { status: 'activo', isActive: true })}
              >
                Reactivar
              </Button>
            )}
          </div>
        </CardBody>
      </Card>
    );
  };

  return (
    <div className="grid grid-cols-12 gap-4 w-full">
      {/* Header */}
      <div className="col-span-12 card-box">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Building2 className="h-6 w-6" />
          Gestión de Sub-empresas
        </h1>
        <p className="text-sm text-default-500 mt-1">
          Aprueba, rechaza o administra vinculaciones de sub-empresas a contratos
        </p>
      </div>

      {/* Stats */}
      <div className="col-span-12 md:col-span-4">
        <Card>
          <CardBody className="flex items-center gap-3 flex-row">
            <div className="p-3 bg-warning/10 rounded-lg">
              <Clock className="h-5 w-5 text-warning" />
            </div>
            <div>
              <p className="text-xs text-default-500">Pendientes</p>
              <p className="text-2xl font-bold">{subcontracts.filter(s => s.status === 'pendiente').length}</p>
            </div>
          </CardBody>
        </Card>
      </div>
      <div className="col-span-12 md:col-span-4">
        <Card>
          <CardBody className="flex items-center gap-3 flex-row">
            <div className="p-3 bg-success/10 rounded-lg">
              <CheckCircle className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-xs text-default-500">Activos</p>
              <p className="text-2xl font-bold">{subcontracts.filter(s => s.status === 'activo').length}</p>
            </div>
          </CardBody>
        </Card>
      </div>
      <div className="col-span-12 md:col-span-4">
        <Card>
          <CardBody className="flex items-center gap-3 flex-row">
            <div className="p-3 bg-default/10 rounded-lg">
              <XCircle className="h-5 w-5 text-default-400" />
            </div>
            <div>
              <p className="text-xs text-default-500">Inactivos</p>
              <p className="text-2xl font-bold">{subcontracts.filter(s => s.status === 'inactivo').length}</p>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Search */}
      <div className="col-span-12 card-box">
        <Input
          isClearable
          classNames={{ inputWrapper: 'border-1' }}
          placeholder="Buscar por empresa, RUT o contrato..."
          startContent={<Search className="text-default-300" />}
          value={search}
          variant="bordered"
          onClear={() => setSearch('')}
          onValueChange={setSearch}
        />
      </div>

      {/* Pendientes */}
      {pendientes.length > 0 && (
        <>
          <div className="col-span-12">
            <h2 className="text-lg font-semibold flex items-center gap-2 text-warning">
              <Clock className="h-5 w-5" />
              Pendientes de aprobación ({pendientes.length})
            </h2>
          </div>
          {pendientes.map(renderCard)}
        </>
      )}

      {/* Activos */}
      {activos.length > 0 && (
        <>
          <div className="col-span-12">
            <h2 className="text-lg font-semibold flex items-center gap-2 text-success">
              <CheckCircle className="h-5 w-5" />
              Activos ({activos.length})
            </h2>
          </div>
          {activos.map(renderCard)}
        </>
      )}

      {/* Inactivos */}
      {inactivos.length > 0 && (
        <>
          <div className="col-span-12">
            <h2 className="text-lg font-semibold flex items-center gap-2 text-default-400">
              <XCircle className="h-5 w-5" />
              Inactivos ({inactivos.length})
            </h2>
          </div>
          {inactivos.map(renderCard)}
        </>
      )}

      {filtered.length === 0 && (
        <div className="col-span-12">
          <Card>
            <CardBody className="text-center py-10">
              <Building2 className="h-12 w-12 text-default-300 mx-auto mb-4" />
              <p className="text-default-500">No hay sub-empresas registradas</p>
            </CardBody>
          </Card>
        </div>
      )}
    </div>
  );
}
