import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Input,
  Selection,
} from '@heroui/react';
import { CiSearch } from 'react-icons/ci';
import { HiOutlinePlus } from 'react-icons/hi';
import { HiMiniChevronDown } from 'react-icons/hi2';

interface TableColumn {
  name: string;
  uid: string;
}

interface FilterOption {
  name: string;
  uid: boolean;
}

interface CompanyOption {
  id: string;
  name: string;
}

interface UserTableToolbarProps {
  columns: TableColumn[];
  deletedLogicOptions: FilterOption[];
  isActiveOptions: FilterOption[];
  filterValue: string;
  statusFilter: Selection;
  isActiveFilter: Selection;
  visibleColumns: Selection;
  companyFilter: string;
  companyOptions: CompanyOption[];
  userCount: number;
  rowsPerPage: number;
  onFilterValueChange: (value?: string) => void;
  onFilterClear: () => void;
  onStatusFilterChange: (keys: Selection) => void;
  onIsActiveFilterChange: (keys: Selection) => void;
  onCompanyFilterChange: (companyId: string) => void;
  onVisibleColumnsChange: (keys: Selection) => void;
  onRowsPerPageChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
}

function capitalize(value: string) {
  return value ? value.charAt(0).toUpperCase() + value.slice(1).toLowerCase() : '';
}

export function UserTableToolbar({
  columns,
  deletedLogicOptions,
  isActiveOptions,
  filterValue,
  statusFilter,
  isActiveFilter,
  visibleColumns,
  companyFilter,
  companyOptions,
  userCount,
  rowsPerPage,
  onFilterValueChange,
  onFilterClear,
  onStatusFilterChange,
  onIsActiveFilterChange,
  onCompanyFilterChange,
  onVisibleColumnsChange,
  onRowsPerPageChange,
}: UserTableToolbarProps) {
  return (
    <div className="w-full col-span-12">
      <div className="flex flex-col gap-4">
        <div className="flex justify-between gap-3 items-end">
          <Input
            isClearable
            classNames={{ inputWrapper: 'border-1' }}
            placeholder="Buscar por nombre o RUN..."
            size="sm"
            startContent={<CiSearch className="text-default-300" />}
            value={filterValue}
            variant="bordered"
            onClear={onFilterClear}
            onValueChange={onFilterValueChange}
          />
          <div className="flex gap-3">
            <Dropdown>
              <DropdownTrigger className="hidden sm:flex">
                <Button endContent={<HiMiniChevronDown className="text-small" />} size="sm" variant="flat">
                  Status
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                disallowEmptySelection
                aria-label="Status"
                closeOnSelect={false}
                selectedKeys={statusFilter}
                selectionMode="multiple"
                onSelectionChange={onStatusFilterChange}
              >
                {deletedLogicOptions.map((status) => (
                  <DropdownItem key={String(status.uid)} className="capitalize">
                    {capitalize(status.name)}
                  </DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>
            <Dropdown>
              <DropdownTrigger className="hidden sm:flex">
                <Button endContent={<HiMiniChevronDown className="text-small" />} size="sm" variant="flat">
                  Activo
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                disallowEmptySelection
                aria-label="Activo"
                closeOnSelect={false}
                selectedKeys={isActiveFilter}
                selectionMode="multiple"
                onSelectionChange={onIsActiveFilterChange}
              >
                {isActiveOptions.map((status) => (
                  <DropdownItem key={String(status.uid)} className="capitalize">
                    {capitalize(status.name)}
                  </DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>
            <div className="hidden sm:flex items-center">
              <label className="text-default-500 mr-2 text-sm">Empresa:</label>
              <select
                value={companyFilter}
                onChange={(event) => onCompanyFilterChange(event.target.value)}
                className="bg-transparent outline-none text-sm"
              >
                <option value="all">Todas</option>
                {companyOptions.map((company) => (
                  <option key={company.id} value={company.id}>
                    {company.name}
                  </option>
                ))}
              </select>
            </div>
            <Dropdown>
              <DropdownTrigger>
                <Button endContent={<HiMiniChevronDown className="text-small" />} size="sm" variant="flat">
                  Columnas
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                disallowEmptySelection
                aria-label="Columnas de tabla"
                closeOnSelect={false}
                selectedKeys={visibleColumns}
                selectionMode="multiple"
                onSelectionChange={onVisibleColumnsChange}
              >
                {columns.map((column) => (
                  <DropdownItem key={column.uid} className="capitalize">
                    {capitalize(column.name)}
                  </DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>
            <Button className="bg-foreground text-background hidden sm:flex" endContent={<HiOutlinePlus />} size="sm">
              Crear nuevo usuario
            </Button>
          </div>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-default-400 text-small">
            Total {userCount} {userCount === 1 ? 'usuario' : 'usuarios'}
          </span>
          <label className="flex items-center text-default-400 text-small">
            Filas por página:
            <select value={rowsPerPage} onChange={onRowsPerPageChange} className="bg-transparent outline-none">
              {[5, 15, 30, 40, 50].map((rows) => (
                <option key={rows} value={rows} className="text-default-400 p-2">
                  {rows}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>
    </div>
  );
}