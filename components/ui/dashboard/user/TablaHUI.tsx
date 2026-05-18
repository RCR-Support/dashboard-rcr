import React, { useCallback, useMemo, useState } from 'react';
import Swal from 'sweetalert2';
import { Users, Crown, Shield, Building2, Mail, Phone, Clock, UserCheck, UserX, Edit3, ToggleLeft, ToggleRight, Trash2, Link2 } from 'lucide-react';
// Utilidad para actualizar usuario
async function updateUserField(
  id: string,
  field: 'isActive' | 'deletedLogic',
  value: boolean
) {
  const res = await fetch('/api/users', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, [field]: value }),
  });
  if (!res.ok) throw new Error('Error al actualizar usuario');
  return res.json();
}
async function permanentDeleteUser(id: string) {
  const res = await fetch('/api/users', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id }),
  });
  const data = await res.json();
  if (!res.ok) throw data;
  return data;
}
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Input,
  Button,
  DropdownTrigger,
  Dropdown,
  DropdownMenu,
  DropdownItem,
  Chip,
  Pagination,
  Selection,
  ChipProps,
  SortDescriptor,
} from '@heroui/react';
import { Avatar } from '@mui/material';
import { HiOutlinePlus, HiDotsVertical } from 'react-icons/hi';
import { CiSearch } from 'react-icons/ci';
import { HiMiniChevronDown } from 'react-icons/hi2';
import { User } from '@/interfaces';
import { formatRun } from '@/lib/validations';
import { formatPhoneNumber } from '@/lib/formatPhoneNumber';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import UserModal from './UserModal';
import { CompanyModal } from '@/components/ui/dashboard/company/company-modal';
import { getCompanyUsers } from '@/actions/company/userCompany-actions';
import { CompanySelect } from '@/interfaces/company.interface';
interface Props {
  users: User[];
}
export const columns = [
  { name: 'ID', uid: 'id', sortable: true },
  { name: 'NOMBRE', uid: 'name', sortable: true },
  { name: 'RUN', uid: 'run', sortable: true },
  { name: 'CONTACTO', uid: 'contact', sortable: false },
  { name: 'ROLES', uid: 'roles', sortable: false },
  { name: 'EMPRESA', uid: 'companyName', sortable: true },
  { name: 'Última ACTIVIDAD', uid: 'lastActivity', sortable: true },
  { name: 'ESTADO', uid: 'status' },
  { name: 'ACTIVO', uid: 'isActiveStatus' },
  { name: 'ACCIONES', uid: 'actions' },
];

export const deletedLogicOptions = [
  { name: 'Activo', uid: false },
  { name: 'Eliminado', uid: true },
];

export const isActiveOptions = [
  { name: 'Habilitado', uid: true },
  { name: 'Pendiente', uid: false },
];

export function capitalize(s: string) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : '';
}

// Configuración mejorada de roles con iconos
const roleConfig = {
  admin: { name: 'Administrador', icon: Crown, color: 'danger' },
  sheq: { name: 'SHEQ', icon: Shield, color: 'primary' },
  adminContractor: { name: 'Admin Contrato', icon: Building2, color: 'secondary' },
  credential: { name: 'Credencial', icon: UserCheck, color: 'success' },
  user: { name: 'Usuario', icon: Users, color: 'default' },
};

const stringToColor = (string: string) => {
  let hash = 0;
  let i;

  for (i = 0; i < string.length; i += 1) {
    hash = string.charCodeAt(i) + ((hash << 5) - hash);
  }

  let color = '#';

  for (i = 0; i < 3; i += 1) {
    const value = (hash >> (i * 8)) & 0xff;
    color += `00${value.toString(16)}`.slice(-2);
  }

  return color;
};

const stringAvatar = (name: string) => {
  return {
    sx: {
      bgcolor: stringToColor(name),
    },
    children: `${name.split(' ')[0][0]}${name.split(' ')[1] ? name.split(' ')[1][0] : ''}`,
  };
};

const statusColorMap: Record<string, ChipProps['color']> = {
  active: 'success',
  paused: 'danger',
  vacation: 'warning',
};

const INITIAL_VISIBLE_COLUMNS = [
  'name',
  'run', 
  'contact',
  'roles',
  'companyName',
  'lastActivity',
  'status',
  'isActiveStatus',
  'actions',
];

function formatShortDate(dateString: string | Date | undefined) {
  if (!dateString) return '-';
  const date =
    typeof dateString === 'string' ? new Date(dateString) : dateString;
  if (isNaN(date.getTime())) return '-';
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = String(date.getFullYear()).slice(-2);
  return `${day}-${month}-${year}`;
}

// Función para calcular tiempo relativo
function getRelativeTime(date: string | Date | undefined) {
  if (!date) return 'Sin fecha';
  
  const now = new Date();
  const targetDate = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(targetDate.getTime())) return 'Fecha inválida';
  
  const diffInDays = Math.floor((now.getTime() - targetDate.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffInDays === 0) return 'Hoy';
  if (diffInDays === 1) return 'Ayer';
  if (diffInDays < 7) return `Hace ${diffInDays} día${diffInDays > 1 ? 's' : ''}`;
  if (diffInDays < 30) return `Hace ${Math.floor(diffInDays / 7)} semana${Math.floor(diffInDays / 7) > 1 ? 's' : ''}`;
  if (diffInDays < 365) return `Hace ${Math.floor(diffInDays / 30)} mes${Math.floor(diffInDays / 30) > 1 ? 'es' : ''}`;
  return `Hace ${Math.floor(diffInDays / 365)} año${Math.floor(diffInDays / 365) > 1 ? 's' : ''}`;
}

interface RoleMapping {
  [key: string]: string;
}

const roleMapping: RoleMapping = {
  admin: 'Administrador',
  sheq: 'Sheq',
  adminContractor: 'Administrador de Contrato', 
  user: 'Usuario',
  credential: 'Credenciales',
};

export default function App({ users }: Props) {
  const router = useRouter();

  const [modalUser, setModalUser] = useState<User | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const [companyModalOpen, setCompanyModalOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<CompanySelect | null>(null);
  const [loadingCompanyId, setLoadingCompanyId] = useState<string | null>(null);

  const openCompanyModal = async (companyId: string, companyName: string) => {
    setLoadingCompanyId(companyId);
    try {
      const response = await getCompanyUsers(companyId);
      if (response.success) {
        setSelectedCompany({
          value: companyId,
          label: companyName,
          description: '',
          users: response.users || [],
          contracts: response.contracts || [],
          asSubcontractor: response.asSubcontractor || [],
          summary: {
            totalUsers: response.users?.length || 0,
            totalContracts: response.contracts?.length || 0,
          },
        });
        setCompanyModalOpen(true);
      }
    } catch (error) {
      console.error('Error al cargar empresa:', error);
    } finally {
      setLoadingCompanyId(null);
    }
  };

  const openModal = (user: User) => {
    setModalUser(user);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setModalUser(null);
  };

  const [filterValue, setFilterValue] = useState('');
  const [companyFilter, setCompanyFilter] = useState<'all' | string>('all');
  const [visibleColumns, setVisibleColumns] = useState<Selection>(
    new Set(INITIAL_VISIBLE_COLUMNS)
  );
  const [statusFilter, setStatusFilter] = useState<Selection>('all');

  const [isActiveFilter, setIsActiveFilter] = useState<Selection>('all');
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
    column: 'run',
    direction: 'ascending',
  });
  const [page, setPage] = useState(1);

  const pages = Math.ceil(users.length / rowsPerPage);

  const hasSearchFilter = Boolean(filterValue);

  const headerColumns = useMemo(() => {
    if (visibleColumns === 'all') return columns;

    return columns.filter(column =>
      Array.from(visibleColumns).includes(column.uid)
    );
  }, [visibleColumns]);

  const companyOptions = useMemo(() => {
    const map = new Map<string, string>();
    users.forEach(u => {
      if (u.company?.id) map.set(u.company.id, u.company.name || 'Sin nombre');
    });
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [users]);

  const filteredItems = useMemo(() => {
    let filteredUsers = [...users];
    const normalizeText = (text: string) =>
      text.normalize('NFD').replace(/[\u0300-\u036f]/g, ''); // Elimina tildes

    // Filtrado por empresa (quick filter)
    if (companyFilter !== 'all') {
      filteredUsers = filteredUsers.filter(
        u => u.company?.id && u.company.id === companyFilter
      );
    }
    if (hasSearchFilter) {
      const normalizedFilter = normalizeText(filterValue.toLowerCase());
      filteredUsers = filteredUsers.filter(
        user =>
          normalizeText(`${user.name} ${user.lastName} ${user.secondLastName}`)
            .toLowerCase()
            .includes(normalizedFilter) ||
          user.run?.toLowerCase().includes(filterValue.toLowerCase())
      );
    }
    if (
      statusFilter !== 'all' &&
      Array.from(statusFilter).length !== deletedLogicOptions.length
    ) {
      filteredUsers = filteredUsers.filter(user =>
        Array.from(statusFilter).includes(String(user.deletedLogic))
      );
    }
    if (
      isActiveFilter !== 'all' &&
      Array.from(isActiveFilter).length !== isActiveOptions.length
    ) {
      filteredUsers = filteredUsers.filter(user =>
        Array.from(isActiveFilter).includes(String(user.isActive))
      );
    }

    return filteredUsers;
  }, [users, filterValue, statusFilter, isActiveFilter, hasSearchFilter, companyFilter]);

  const items = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;

    return filteredItems.slice(start, end);
  }, [page, filteredItems, rowsPerPage]);

  const sortedItems = useMemo(() => {
    return [...items].sort((a: User, b: User) => {
      const first = a[sortDescriptor.column as keyof User];
      const second = b[sortDescriptor.column as keyof User];

      // Ordenar por fecha real si la columna es createdAt
      if (sortDescriptor.column === 'createdAt') {
        const dateA = first ? new Date(first as string) : new Date(0);
        const dateB = second ? new Date(second as string) : new Date(0);
        const cmp = dateA.getTime() - dateB.getTime();
        return sortDescriptor.direction === 'descending' ? -cmp : cmp;
      }

      // Convertimos los valores a cadenas para evitar errores de comparación
      const firstValue =
        first === undefined || first === null ? '' : String(first);
      const secondValue =
        second === undefined || second === null ? '' : String(second);
      const cmp =
        firstValue < secondValue ? -1 : firstValue > secondValue ? 1 : 0;
      return sortDescriptor.direction === 'descending' ? -cmp : cmp;
    });
  }, [sortDescriptor, items]);

  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [localUsers, setLocalUsers] = useState<User[]>(users);
  const [loadingField, setLoadingField] = useState<{
    id: string;
    field: string;
  } | null>(null);

  // Sincroniza localUsers si cambia la prop users
  React.useEffect(() => {
    setLocalUsers(users);
  }, [users]);

  const handleChangeField = async (
    user: User,
    field: 'isActive' | 'deletedLogic'
  ) => {
    const currentValue = user[field];
    const label =
      field === 'isActive'
        ? currentValue
          ? 'deshabilitar'
          : 'habilitar'
        : currentValue
          ? 'activar'
          : 'eliminar lógicamente';
    const confirmText = `¿Desea ${label} el usuario?`;
    const result = await Swal.fire({
      title: confirmText,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí',
      cancelButtonText: 'No',
      showLoaderOnConfirm: true,
      allowOutsideClick: () => !Swal.isLoading(),
      preConfirm: async () => {
        try {
          await updateUserField(user.id, field, !currentValue);
          return true;
        } catch {
          Swal.showValidationMessage('No se pudo actualizar el usuario. Intenta nuevamente.');
          return false;
        }
      },
      showClass: {
        popup: 'swal2-show swal2-animate-fade-in',
      },
      hideClass: {
        popup: 'swal2-hide swal2-animate-fade-out',
      },
    });
    if (result.isConfirmed) {
      setLocalUsers(prev =>
        prev.map(u =>
          u.id === user.id ? { ...u, [field]: !currentValue } : u
        )
      );
      Swal.fire({ title: 'Actualizado', text: 'El usuario fue actualizado', icon: 'success', timer: 1500, showConfirmButton: false });
    }
  };

  const handlePermanentDelete = async (user: User) => {
    const result = await Swal.fire({
      title: '¿Eliminar permanentemente?',
      html: `Esta acción <strong>no se puede deshacer</strong>.<br/>El usuario <strong>${user.displayName}</strong> será eliminado de forma definitiva del sistema.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar para siempre',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#dc2626',
      input: 'text',
      inputPlaceholder: 'Escribe ELIMINAR para confirmar',
      inputValidator: (value) => {
        if (value !== 'ELIMINAR') return 'Debes escribir ELIMINAR para confirmar';
      },
    });
    if (!result.isConfirmed) return;
    setUpdatingId(user.id);
    try {
      await permanentDeleteUser(user.id);
      setLocalUsers(prev => prev.filter(u => u.id !== user.id));
      Swal.fire('Eliminado', 'El usuario fue eliminado permanentemente.', 'success');
    } catch (err: unknown) {
      const errData = err as { error?: string; blockers?: string[] };
      const blockerMsg = errData?.blockers?.length
        ? `<br/><ul class="text-left mt-2 list-disc pl-4">${errData.blockers.map(b => `<li>${b}</li>`).join('')}</ul>`
        : '';
      Swal.fire('No se pudo eliminar', (errData?.error ?? 'Error inesperado') + blockerMsg, 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  const renderCell: (user: User, columnKey: React.Key) => React.ReactNode =
    useCallback(
      (user, columnKey) => {
        if (!user) return null;
        const cellValue = user[columnKey as keyof User];

        switch (columnKey) {
          case 'name':
            return (
              <div className="flex items-center py-2 gap-2">
                <Avatar
                  {...stringAvatar(user.displayName.toUpperCase())}
                  className="bg-[#03c9d7] dark:bg-[#327f84]"
                  sx={{ width: 36, height: 36 }} // Ajusta el tamaño según sea necesario
                />
                <div className="ml-2">
                  <div className="font-bold">
                    {user.name} {user.lastName}
                  </div>
                  <div className="text-xs text-teal-600 dark:text-teal-200">
                    {user.email}
                  </div>
                </div>
              </div>
            );
          case 'run':
            return (
              <div className="flex flex-col min-w-24">
                <p className="text-bold text-small capitalize">
                  {user.run ? formatRun(user.run) : 'N/A'}
                </p>
              </div>
            );
          case 'contact':
            return (
              <div className="flex flex-col min-w-36 gap-1">
                <div className="flex items-center gap-1">
                  <Mail size={12} className="text-gray-400" />
                  <p className="text-bold text-small truncate">
                    {user.email || 'N/A'}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <Phone size={12} className="text-gray-400" />
                  <p className="text-xs text-default-500">
                    {user.phoneNumber ? formatPhoneNumber(user.phoneNumber) : '-'}
                  </p>
                </div>
              </div>
            );
          case 'roles':
            return (
              <div className="flex items-center gap-1 flex-wrap min-w-48">
                {Array.isArray(user.roles) && user.roles.length > 0 ? (
                  user.roles.map(r => {
                    const config = roleConfig[r] || { name: r, icon: Users, color: 'default' };
                    const IconComponent = config.icon;
                    return (
                      <Chip 
                        key={r} 
                        size="sm" 
                        variant="flat" 
                        color={(config.color as 'danger' | 'primary' | 'secondary' | 'success' | 'default') || 'default'}
                        startContent={<IconComponent size={12} />}
                        className="capitalize"
                      >
                        {config.name}
                      </Chip>
                    );
                  })
                ) : (
                  <span className="text-default-500">N/A</span>
                )}
              </div>
            );
          case 'companyName':
            return (
              <div className="flex flex-col min-w-32 max-w-56">
                <div className="flex items-center gap-1">
                  <Building2 size={12} className="text-gray-400" />
                  <p className="text-bold text-small capitalize truncate text-ellipsis max-w-52">
                    {user?.company?.id ? (
                      <button
                        onClick={() => openCompanyModal(user.company!.id, user.company!.name ?? '')}
                        disabled={loadingCompanyId === user.company.id}
                        className="text-primary hover:underline disabled:opacity-50 disabled:cursor-wait"
                      >
                        {loadingCompanyId === user.company.id ? 'Cargando...' : user.company.name}
                      </button>
                    ) : (
                      user?.company?.name || 'Sin empresa'
                    )}
                  </p>
                </div>
                <p className="text-bold text-tiny capitalize text-default-500">
                  {user?.company?.rut ? formatRun(user.company.rut) : 'N/A'}
                </p>
                {user?.asSubcontractor && user.asSubcontractor.length > 0 && (
                  <div className="mt-1 flex flex-col gap-0.5">
                    {user.asSubcontractor.map((sc, i) => (
                      <span
                        key={i}
                        title={`Representante subcontrato — Sub de: ${sc.mandanteName ?? 'Empresa mandante'} — Contrato: ${sc.contractName}`}
                        className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full bg-cyan-100 dark:bg-cyan-900/40 text-cyan-700 dark:text-cyan-300 font-medium truncate max-w-full"
                      >
                        <Link2 size={9} className="shrink-0" />
                        Rep. Sub de: {sc.mandanteName ?? '—'}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          case 'lastActivity':
            return (
              <div className="flex flex-col min-w-32">
                <div className="flex items-center gap-1">
                  <Clock size={12} className="text-gray-400" />
                  <p className="text-bold text-small">
                    {getRelativeTime(user.createdAt)}
                  </p>
                </div>
                <p className="text-xs text-default-500">
                  {formatShortDate(user.createdAt)}
                </p>
              </div>
            );
          case 'phoneNumber':
            return (
              <div className="flex flex-col min-w-32">
                <p className="text-bold text-small capitalize">
                  {user.phoneNumber
                    ? formatPhoneNumber(user.phoneNumber)
                    : 'N/A'}
                </p>
              </div>
            );
          case 'createdAt':
            return <span>{formatShortDate(user.createdAt)}</span>;
          case 'status': {
            const statusText = user.deletedLogic ? 'Eliminado' : 'Activo';
            const chipColor = user.deletedLogic ? 'danger' : 'success';
            const statusEmoji = user.deletedLogic ? '❌' : '✅';
            const isLoading =
              loadingField &&
              loadingField.id === user.id &&
              loadingField.field === 'deletedLogic';
            return (
              <button
                className="focus:outline-none"
                disabled={updatingId === user.id}
                onClick={() => handleChangeField(user, 'deletedLogic')}
              >
                <Chip
                  className={`capitalize cursor-pointer flex items-center gap-1`}
                  color={chipColor}
                  size="sm"
                  variant="flat"
                >
                  <span className="mr-1">{statusEmoji}</span>
                  {statusText}
                  {isLoading && (
                    <span className="loader w-3 h-3 border-2 border-t-2 border-t-transparent rounded-full animate-spin inline-block" />
                  )}
                </Chip>
              </button>
            );
          }
          case 'isActiveStatus': {
            const isActiveText = user.isActive ? 'Habilitado' : 'Pendiente';
            const isActiveColor = user.isActive ? 'success' : 'warning';
            const activeEmoji = user.isActive ? '✅' : '⚠️';
            const isLoading =
              loadingField &&
              loadingField.id === user.id &&
              loadingField.field === 'isActive';
            return (
              <button
                className="focus:outline-none"
                disabled={updatingId === user.id}
                onClick={() => handleChangeField(user, 'isActive')}
              >
                <Chip
                  className={`capitalize cursor-pointer flex items-center gap-1`}
                  color={isActiveColor}
                  size="sm"
                  variant="flat"
                >
                  <span className="mr-1">{activeEmoji}</span>
                  {isActiveText}
                  {isLoading && (
                    <span className="loader w-3 h-3 border-2 border-t-2 border-t-transparent rounded-full animate-spin inline-block" />
                  )}
                </Chip>
              </button>
            );
          }
          case 'actions':
            return (
              <div className="relative flex justify-end items-center gap-2">
                <Dropdown className="bg-default-100 border-1 border-default-200 w-[90px]">
                  <DropdownTrigger>
                    <Button isIconOnly radius="full" size="sm" variant="light">
                      <HiDotsVertical size={16} className="text-default-400" />
                    </Button>
                  </DropdownTrigger>
                  <DropdownMenu className="flex gap-6 text-slate-500 dark:text-slate-300">
                    <DropdownItem
                      key="view"
                      startContent={
                        <Users size={16} className="text-primary" />
                      }
                      onPress={() => openModal(user)}
                    >
                      Ver más
                    </DropdownItem>
                    <DropdownItem
                      key="edit"
                      startContent={
                        <Edit3 size={16} className="text-primary" />
                      }
                    >
                      <Link href={`/dashboard/users/edit/${user.id}`} className="block w-full h-full">Editar</Link>
                    </DropdownItem>
                    <DropdownItem
                      key="toggleActive"
                      startContent={
                        user.isActive ? 
                          <ToggleRight size={16} className="text-warning" /> : 
                          <ToggleLeft size={16} className="text-success" />
                      }
                      onPress={() => handleChangeField(user, 'isActive')}
                    >
                      {user.isActive ? 'Deshabilitar' : 'Habilitar'}
                    </DropdownItem>
                    <DropdownItem
                      key="toggleDeleted"
                      startContent={
                        user.deletedLogic ? 
                          <UserCheck size={16} className="text-success" /> : 
                          <UserX size={16} className="text-danger" />
                      }
                      onPress={() => handleChangeField(user, 'deletedLogic')}
                    >
                      {user.deletedLogic ? 'Restaurar' : 'Eliminar'}
                    </DropdownItem>
                    {user.deletedLogic ? (
                      <DropdownItem
                        key="permanentDelete"
                        startContent={<Trash2 size={16} className="text-danger" />}
                        className="text-danger"
                        color="danger"
                        onPress={() => handlePermanentDelete(user)}
                      >
                        Eliminar definitivo
                      </DropdownItem>
                    ) : null}
                  </DropdownMenu>
                </Dropdown>
              </div>
            );
          default:
            if (
              typeof cellValue === 'string' ||
              typeof cellValue === 'number' ||
              typeof cellValue === 'boolean'
            ) {
              return <div>{cellValue.toString()}</div>;
            } else {
              return null;
            }
        }
      },
      [router, loadingField, updatingId]
    );

  const onRowsPerPageChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setRowsPerPage(Number(e.target.value));
      setPage(1);
    },
    []
  );

  const onSearchChange = useCallback((value?: string) => {
    if (value) {
      setFilterValue(value);
      setPage(1);
    } else {
      setFilterValue('');
    }
  }, []);

  const topContent = useMemo(() => {
    return (
      <div className=" w-fullcol-span-12">
        <div className="flex flex-col gap-4">
          <div className="flex justify-between gap-3 items-end">
            <Input
              isClearable
              classNames={{
                inputWrapper: 'border-1',
              }}
              placeholder="Buscar por nombre o RUN..."
              size="sm"
              startContent={<CiSearch className="text-default-300" />}
              value={filterValue}
              variant="bordered"
              onClear={() => setFilterValue('')}
              onValueChange={onSearchChange}
            />
            <div className="flex gap-3">
              <Dropdown>
                <DropdownTrigger className="hidden sm:flex">
                  <Button
                    endContent={<HiMiniChevronDown className="text-small" />}
                    size="sm"
                    variant="flat"
                  >
                    Status
                  </Button>
                </DropdownTrigger>
                <DropdownMenu
                  disallowEmptySelection
                  aria-label="Status"
                  closeOnSelect={false}
                  selectedKeys={statusFilter}
                  selectionMode="multiple"
                  onSelectionChange={setStatusFilter}
                >
                  {deletedLogicOptions.map(status => (
                    <DropdownItem
                      key={String(status.uid)}
                      className="capitalize"
                    >
                      {capitalize(status.name)}
                    </DropdownItem>
                  ))}
                </DropdownMenu>
              </Dropdown>
              <Dropdown>
                <DropdownTrigger className="hidden sm:flex">
                  <Button
                    endContent={<HiMiniChevronDown className="text-small" />}
                    size="sm"
                    variant="flat"
                  >
                    Activo
                  </Button>
                </DropdownTrigger>
                <DropdownMenu
                  disallowEmptySelection
                  aria-label="Activo"
                  closeOnSelect={false}
                  selectedKeys={isActiveFilter}
                  selectionMode="multiple"
                  onSelectionChange={setIsActiveFilter}
                >
                  {isActiveOptions.map(status => (
                    <DropdownItem
                      key={String(status.uid)}
                      className="capitalize"
                    >
                      {capitalize(status.name)}
                    </DropdownItem>
                  ))}
                </DropdownMenu>
              </Dropdown>
              <div className="hidden sm:flex items-center">
                <label className="text-default-500 mr-2 text-sm">Empresa:</label>
                <select
                  value={companyFilter}
                  onChange={e => setCompanyFilter(e.target.value)}
                  className="bg-transparent outline-none text-sm"
                >
                  <option value="all">Todas</option>
                  {companyOptions.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <Dropdown>
                <DropdownTrigger className="">
                  <Button
                    endContent={<HiMiniChevronDown className="text-small" />}
                    size="sm"
                    variant="flat"
                  >
                    Columnas
                  </Button>
                </DropdownTrigger>
                <DropdownMenu
                  disallowEmptySelection
                  aria-label="Table Columns"
                  closeOnSelect={false}
                  selectedKeys={visibleColumns}
                  selectionMode="multiple"
                  onSelectionChange={setVisibleColumns}
                >
                  {columns.map(column => (
                    <DropdownItem key={column.uid} className="capitalize">
                      {capitalize(column.name)}
                    </DropdownItem>
                  ))}
                </DropdownMenu>
              </Dropdown>
              <Button
                className="bg-foreground text-background hidden sm:flex"
                endContent={<HiOutlinePlus />}
                size="sm"
              >
                Crear nuevo usuario
              </Button>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-default-400 text-small">
              Total {users.length} {users.length === 1 ? 'usuario' : 'usuarios'}
            </span>
            <label className="flex items-center text-default-400 text-small">
              Filas por página:
              <select
                value={rowsPerPage}
                onChange={onRowsPerPageChange}
                className="bg-transparent outline-none"
              >
                {[5, 15, 30, 40, 50].map(rows => (
                  <option
                    key={rows}
                    value={rows}
                    className="text-default-400 p-2 "
                  >
                    {rows}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>
      </div>
    );
  }, [
    filterValue,
    statusFilter,
    isActiveFilter,
    visibleColumns,
    onSearchChange,
    onRowsPerPageChange,
    rowsPerPage,
    users.length,
    companyFilter,
    companyOptions,
  ]);

  const bottomContent = useMemo(() => {
    return (
      <div className="py-2 px-2 flex justify-between items-center">
        <Pagination
          showControls
          classNames={{
            cursor: 'bg-foreground text-background',
          }}
          color="default"
          isDisabled={hasSearchFilter}
          page={page}
          total={pages}
          variant="light"
          onChange={setPage}
        />
      </div>
    );
  }, [page, pages, hasSearchFilter]);

  const classNames = useMemo(
    () => ({
      wrapper: ['bg-transparent', 'max-w-[100%]'],
      th: ['', 'text-default-500', 'border-b', 'border-divider'],
      tr: [
        '',
        'text-default-600',
        'border-b',
        'border-divider',
        'border-gray-200',
        'dark:border-gray-700',
      ],
      td: [
        // changing the rows border radius
        // first
        'group-data-[first=true]/tr:first:before:rounded-none',
        'group-data-[first=true]/tr:last:before:rounded-none',
        // middle
        'group-data-[middle=true]/tr:before:rounded-none',
        // last
        'group-data-[last=true]/tr:first:before:rounded-none',
        'group-data-[last=true]/tr:last:before:rounded-none',
      ],
    }),
    []
  );

  return (
    <div className="w-full card-box col-span-12">
      <Table
        aria-label="Tabla de usuarios"
        bottomContent={bottomContent}
        bottomContentPlacement="outside"
        classNames={classNames}
        sortDescriptor={sortDescriptor}
        topContent={topContent}
        topContentPlacement="outside"
        onSortChange={setSortDescriptor}
        selectionMode="single"
      >
        <TableHeader columns={headerColumns}>
          {column => (
            <TableColumn
              key={column.uid}
              align={column.uid === 'actions' ? 'center' : 'start'}
              allowsSorting={column.sortable}
            >
              {column.name}
            </TableColumn>
          )}
        </TableHeader>
        <TableBody
          emptyContent={'NO SE ENCONTRARON RESULTADOS'}
          items={sortedItems.map(
            u => localUsers.find(lu => lu.id === u.id) || u
          )}
        >
          {item => (
            <TableRow key={item.id}>
              {columnKey => (
                <TableCell>{renderCell(item, columnKey)}</TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>
      <UserModal
        user={modalUser}
        isOpen={modalOpen}
        onClose={closeModal}
        onEdit={() => {
          if (modalUser) router.push(`/dashboard/users/edit/${modalUser.id}`);
        }}
        onDelete={() => {
          if (modalUser) handleChangeField(modalUser, 'deletedLogic');
        }}
      />
      <CompanyModal
        isOpen={companyModalOpen}
        onClose={() => { setCompanyModalOpen(false); setSelectedCompany(null); }}
        company={selectedCompany}
      />
    </div>
  );
}
