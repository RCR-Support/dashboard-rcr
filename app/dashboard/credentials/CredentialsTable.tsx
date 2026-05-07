'use client';

import { useState, useMemo } from 'react';
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  Avatar,
  Button,
  Input,
  Tooltip,
} from '@heroui/react';
import { Printer, Search } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import Link from 'next/link';

interface Application {
  id: string;
  displayWorkerName: string;
  workerRun: string;
  license: string | null;
  licenseExpiration: Date | null;
  updatedAt: Date;
  company?: { name: string | null; rut: string } | null;
  contract: { contractNumber: string; contractName: string } | null;
  activities: Array<{ name: string }>;
  documentationFiles: Array<{ url: string; type: string; documentationId: string | null }>;
}

interface Props {
  applications: Application[];
  searchTerm: string;
}

export default function CredentialsTable({ applications, searchTerm }: Props) {
  const [sortDescriptor, setSortDescriptor] = useState<{ column: string; direction: 'ascending' | 'descending' }>({
    column: 'displayWorkerName',
    direction: 'ascending',
  });

  const getWorkerPhoto = (app: Application) =>
    app.documentationFiles.find(doc => doc.type === 'IMG' && !doc.documentationId)?.url;

  const isExpired = (app: Application) => {
    if (!app.licenseExpiration) return false;
    return new Date(app.licenseExpiration) < new Date();
  };

  const filtered = useMemo(() => {
    let items = [...applications];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      items = items.filter(app =>
        app.displayWorkerName.toLowerCase().includes(term) ||
        app.workerRun.toLowerCase().includes(term) ||
        app.company?.name?.toLowerCase().includes(term) ||
        app.contract?.contractName.toLowerCase().includes(term)
      );
    }

    return items.sort((a, b) => {
      const col = sortDescriptor.column;
      let aVal = '', bVal = '';

      switch (col) {
        case 'displayWorkerName':
          aVal = a.displayWorkerName;
          bVal = b.displayWorkerName;
          break;
        case 'company':
          aVal = a.company?.name || '';
          bVal = b.company?.name || '';
          break;
        case 'contract':
          aVal = a.contract?.contractName || '';
          bVal = b.contract?.contractName || '';
          break;
        case 'licenseExpiration':
          aVal = a.licenseExpiration ? new Date(a.licenseExpiration).toISOString() : '';
          bVal = b.licenseExpiration ? new Date(b.licenseExpiration).toISOString() : '';
          break;
        default:
          return 0;
      }

      const cmp = aVal.localeCompare(bVal);
      return sortDescriptor.direction === 'ascending' ? cmp : -cmp;
    });
  }, [applications, searchTerm, sortDescriptor]);

  const columns = [
    { key: 'displayWorkerName', label: 'Trabajador', sortable: true },
    { key: 'workerRun', label: 'RUN', sortable: false },
    { key: 'company', label: 'Empresa', sortable: true },
    { key: 'contract', label: 'Contrato', sortable: true },
    { key: 'activities', label: 'Actividades', sortable: false },
    { key: 'licenseExpiration', label: 'Vencimiento', sortable: true },
    { key: 'status', label: 'Estado', sortable: false },
    { key: 'actions', label: 'Acciones', sortable: false },
  ];

  return (
    <Table
      aria-label="Tabla de credenciales"
      sortDescriptor={sortDescriptor}
      onSortChange={(desc) => setSortDescriptor(desc as { column: string; direction: 'ascending' | 'descending' })}
      classNames={{
        wrapper: 'min-h-[400px]',
      }}
    >
      <TableHeader columns={columns}>
        {(column) => (
          <TableColumn key={column.key} allowsSorting={column.sortable}>
            {column.label}
          </TableColumn>
        )}
      </TableHeader>
      <TableBody items={filtered} emptyContent="No hay credenciales para mostrar">
        {(app) => {
          const photo = getWorkerPhoto(app);
          const expired = isExpired(app);

          return (
            <TableRow key={app.id}>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Avatar
                    src={photo}
                    name={app.displayWorkerName.charAt(0)}
                    size="sm"
                    className="flex-shrink-0"
                  />
                  <span className="font-medium truncate max-w-[200px]">{app.displayWorkerName}</span>
                </div>
              </TableCell>
              <TableCell>{app.workerRun}</TableCell>
              <TableCell>
                <span className="truncate max-w-[150px] block">{app.company?.name || '-'}</span>
              </TableCell>
              <TableCell>
                <Tooltip content={`N° ${app.contract?.contractNumber || '-'}`}>
                  <span className="truncate max-w-[150px] block">{app.contract?.contractName || '-'}</span>
                </Tooltip>
              </TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1 max-w-[200px]">
                  {app.activities.slice(0, 2).map((act, i) => (
                    <Chip key={i} size="sm" variant="flat">{act.name}</Chip>
                  ))}
                  {app.activities.length > 2 && (
                    <Tooltip content={app.activities.slice(2).map(a => a.name).join(', ')}>
                      <Chip size="sm" variant="flat">+{app.activities.length - 2}</Chip>
                    </Tooltip>
                  )}
                </div>
              </TableCell>
              <TableCell>
                {app.licenseExpiration
                  ? format(new Date(app.licenseExpiration), 'dd MMM yyyy', { locale: es })
                  : '-'}
              </TableCell>
              <TableCell>
                <Chip color={expired ? 'danger' : 'success'} variant="flat" size="sm">
                  {expired ? 'VENCIDA' : 'VIGENTE'}
                </Chip>
              </TableCell>
              <TableCell>
                <Button
                  as={Link}
                  href={`/dashboard/credentials/${app.id}`}
                  size="sm"
                  color="primary"
                  variant="flat"
                  startContent={<Printer className="h-3 w-3" />}
                >
                  Imprimir
                </Button>
              </TableCell>
            </TableRow>
          );
        }}
      </TableBody>
    </Table>
  );
}
