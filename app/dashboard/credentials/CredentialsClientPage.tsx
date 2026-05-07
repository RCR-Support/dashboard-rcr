'use client';

import { useState } from 'react';
import { Card, CardBody, CardHeader, Chip, Input, Button, Avatar, Tooltip } from '@heroui/react';
import { Search, Printer, CreditCard, Building2, Calendar, User, FileCheck } from 'lucide-react';
import { FaAddressCard } from 'react-icons/fa6';
import { PiUserListFill } from 'react-icons/pi';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import Link from 'next/link';
import CredentialsTable from './CredentialsTable';

interface Application {
  id: string;
  workerName: string;
  workerPaternal: string;
  workerMaternal: string;
  workerRun: string;
  displayWorkerName: string;
  status: string;
  license: string | null;
  licenseExpiration: Date | null;
  createdAt: Date;
  updatedAt: Date;
  company?: { name: string | null; rut: string } | null;
  contract: { contractNumber: string; contractName: string; initialDate: Date; finalDate: Date } | null;
  activities: Array<{ name: string }>;
  zones: Array<{ name: string }>;
  documentationFiles: Array<{ url: string; type: string; documentationId: string | null }>;
  qr?: { token: string; isActive: boolean } | null;
}

interface Props {
  applications: Application[];
  userRole?: string;
}

export default function CredentialsClientPage({ applications }: Props) {
  const [searchTerm, setSearchTerm] = useState('');
  const [view, setView] = useState<'cards' | 'table'>('table');

  const filtered = applications.filter(app =>
    app.displayWorkerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.workerRun.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.company?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.contract?.contractName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getWorkerPhoto = (app: Application) =>
    app.documentationFiles.find(doc => doc.type === 'IMG' && !doc.documentationId)?.url;

  const isExpired = (app: Application) => {
    if (!app.licenseExpiration) return false;
    return new Date(app.licenseExpiration) < new Date();
  };

  return (
    <div className="grid grid-cols-12 gap-4 w-full mx-auto">
      {/* Header */}
      <div className="col-span-12 card-box">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <CreditCard className="h-6 w-6" />
              Credenciales para Imprimir
            </h1>
            <p className="text-sm text-default-500 mt-1">
              Solicitudes aprobadas listas para generar credenciales
            </p>
          </div>
          <div className="flex gap-4 items-center text-3xl dark:text-gray-400">
            <Tooltip content="Vista Cards">
              <button
                onClick={() => setView('cards')}
                className={`hover:text-blue-400 ${view === 'cards' ? 'text-[#03c9d7]' : ''}`}
              >
                <FaAddressCard size={32} />
              </button>
            </Tooltip>
            <Tooltip content="Vista Tabla">
              <button
                onClick={() => setView('table')}
                className={`hover:text-blue-400 ${view === 'table' ? 'text-[#03c9d7]' : ''}`}
              >
                <PiUserListFill size={32} />
              </button>
            </Tooltip>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="col-span-12 md:col-span-4">
        <Card>
          <CardBody className="flex flex-row items-center gap-4">
            <div className="p-3 bg-success/10 rounded-lg">
              <FileCheck className="h-6 w-6 text-success" />
            </div>
            <div>
              <p className="text-sm text-default-500">Total Aprobadas</p>
              <p className="text-2xl font-bold">{applications.length}</p>
            </div>
          </CardBody>
        </Card>
      </div>

      <div className="col-span-12 md:col-span-4">
        <Card>
          <CardBody className="flex flex-row items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Printer className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-default-500">Pendientes de Impresión</p>
              <p className="text-2xl font-bold">{applications.filter(a => !a.qr).length}</p>
            </div>
          </CardBody>
        </Card>
      </div>

      <div className="col-span-12 md:col-span-4">
        <Card>
          <CardBody className="flex flex-row items-center gap-4">
            <div className="p-3 bg-danger/10 rounded-lg">
              <Calendar className="h-6 w-6 text-danger" />
            </div>
            <div>
              <p className="text-sm text-default-500">Vencidas</p>
              <p className="text-2xl font-bold">{applications.filter(isExpired).length}</p>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Search */}
      <div className="col-span-12 card-box">
        <Input
          isClearable
          classNames={{ inputWrapper: 'border-1' }}
          placeholder="Buscar por nombre, RUN, empresa o contrato..."
          startContent={<Search className="text-default-300" />}
          value={searchTerm}
          variant="bordered"
          onClear={() => setSearchTerm('')}
          onValueChange={setSearchTerm}
        />
      </div>

      {/* List */}
      <div className="col-span-12">
        {view === 'table' ? (
          <CredentialsTable applications={applications} searchTerm={searchTerm} />
        ) : filtered.length === 0 ? (
          <Card>
            <CardBody className="text-center py-10">
              <CreditCard className="h-12 w-12 text-default-300 mx-auto mb-4" />
              <p className="text-default-500">
                {searchTerm ? 'No se encontraron resultados' : 'No hay solicitudes aprobadas para generar credenciales'}
              </p>
            </CardBody>
          </Card>
        ) : (
          <div className="grid grid-cols-12 gap-4">
            {filtered.map((app) => {
              const photo = getWorkerPhoto(app);
              const expired = isExpired(app);

              return (
                <Card key={app.id} className="col-span-12 md:col-span-6 lg:col-span-4">
                  <CardHeader className="flex gap-3">
                    <Avatar
                      src={photo}
                      name={app.displayWorkerName.charAt(0)}
                      size="lg"
                      className="flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold truncate">{app.displayWorkerName}</h3>
                      <p className="text-sm text-default-500">RUN: {app.workerRun}</p>
                    </div>
                    <Chip
                      color={expired ? 'danger' : 'success'}
                      variant="flat"
                      size="sm"
                    >
                      {expired ? 'VENCIDA' : 'VIGENTE'}
                    </Chip>
                  </CardHeader>
                  <CardBody>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Building2 className="h-4 w-4 text-default-400 flex-shrink-0" />
                        <span className="truncate">{app.company?.name || 'Sin empresa'}</span>
                      </div>

                      {app.contract && (
                        <div className="flex items-center gap-2 text-sm">
                          <FileCheck className="h-4 w-4 text-default-400 flex-shrink-0" />
                          <span className="truncate">{app.contract.contractName} (N° {app.contract.contractNumber})</span>
                        </div>
                      )}

                      {app.activities.length > 0 && (
                        <div className="flex items-center gap-2 text-sm">
                          <User className="h-4 w-4 text-default-400 flex-shrink-0" />
                          <span className="truncate">{app.activities.map(a => a.name).join(', ')}</span>
                        </div>
                      )}

                      {app.licenseExpiration && (
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4 text-default-400 flex-shrink-0" />
                          <span>Vence: {format(new Date(app.licenseExpiration), 'dd MMM yyyy', { locale: es })}</span>
                        </div>
                      )}

                      <div className="flex gap-2 mt-4">
                        <Button
                          as={Link}
                          href={`/dashboard/credentials/${app.id}`}
                          size="sm"
                          color="primary"
                          startContent={<Printer className="h-4 w-4" />}
                        >
                          Ver / Imprimir
                        </Button>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
