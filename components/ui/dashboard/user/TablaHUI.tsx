import React, { useCallback, useMemo, useState, ReactNode } from "react";
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
} from "@heroui/react";
import { Avatar } from "@mui/material";
import { HiOutlinePlus, HiDotsVertical, HiEye } from "react-icons/hi";
import { CiSearch } from "react-icons/ci";
import { HiMiniChevronDown } from "react-icons/hi2";
import { RiDeleteBin2Fill } from "react-icons/ri";
import { TbUserEdit } from "react-icons/tb";
import { User } from "@/interfaces";

interface Props {
  users: User[];
}
interface Company {
  name: string;
  rut: string;
}
export const columns = [
  { name: "ID", uid: "id", sortable: true },
  { name: "NOMBRE", uid: "name", sortable: true },
  { name: "RUN", uid: "run", sortable: true },
  { name: "ROL", uid: "role", sortable: true },
  { name: "EMPRESA", uid: "companyName", sortable: true },
  { name: "Fono", uid: "phoneNumber" },
  { name: "CORREO", uid: "email" },
  { name: "ESTADO", uid: "status"},
  { name: "ACCIONES", uid: "actions" },
];

export const deletedLogicOptions = [
  { name: "Activo", uid: false },
  { name: "Eleminado", uid: true },
];

export function capitalize(s: string) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : "";
}

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

const statusColorMap: Record<string, ChipProps["color"]> = {
  active: "success",
  paused: "danger",
  vacation: "warning",
};

const INITIAL_VISIBLE_COLUMNS = ["name","run","role", "status", "actions"];

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

  const [filterValue, setFilterValue] = useState("");
  const [visibleColumns, setVisibleColumns] = useState<Selection>(
    new Set(INITIAL_VISIBLE_COLUMNS),
  );
  const [statusFilter, setStatusFilter] = useState<Selection>("all");
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
    column: "run",
    direction: "ascending",
  });
  const [page, setPage] = useState(1);

  const pages = Math.ceil(users.length / rowsPerPage);

  const hasSearchFilter = Boolean(filterValue);

  const headerColumns = useMemo(() => {
    if (visibleColumns === "all") return columns;

    return columns.filter((column) => Array.from(visibleColumns).includes(column.uid));
  }, [visibleColumns]);

  const filteredItems = useMemo(() => {
    let filteredUsers = [...users ];
    const normalizeText = (text: string) =>
      text.normalize("NFD").replace(/[\u0300-\u036f]/g, ""); // Elimina tildes

    if (hasSearchFilter) {
      const normalizedFilter = normalizeText(filterValue.toLowerCase());
      filteredUsers = filteredUsers.filter((user) =>
        normalizeText(`${user.name} ${user.lastName} ${user.secondLastName}`).toLowerCase().includes(normalizedFilter) ||
        user.run?.toLowerCase().includes(filterValue.toLowerCase())
      );
    }
    if (statusFilter !== "all" && Array.from(statusFilter).length !== deletedLogicOptions.length) {
      filteredUsers = filteredUsers.filter((user) =>
        Array.from(statusFilter).includes(String(user.deletedLogic)),
      );
    }

    return filteredUsers;
  }, [users, filterValue, statusFilter, hasSearchFilter]);

  const items = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;

    return filteredItems.slice(start, end);
  }, [page, filteredItems, rowsPerPage]);

  const sortedItems = useMemo(() => {
    return [...items].sort((a: User, b: User) => {
      const first = a[sortDescriptor.column as keyof User];
      const second = b[sortDescriptor.column as keyof User];
      // Convertimos los valores a cadenas para evitar errores de comparación
      const firstValue = first === undefined || first === null ? "" : String(first);
      const secondValue = second === undefined || second === null ? "" : String(second);
      const cmp = firstValue < secondValue ? -1 : firstValue > secondValue ? 1 : 0;

      return sortDescriptor.direction === "descending" ? -cmp : cmp;
    });
  }, [sortDescriptor, items]);

  const renderCell: (user: User, columnKey: React.Key) => React.ReactNode = useCallback((user, columnKey) => {
  if (!user) return null;
  const cellValue = user[columnKey as keyof User];

  switch (columnKey) {
    case "name":
      return (
        <div className="flex items-center py-2 gap-2">
          <Avatar
            {...stringAvatar(user.displayName.toUpperCase())}
            className="bg-[#03c9d7] dark:bg-[#327f84]"
            sx={{ width: 36, height: 36 }} // Ajusta el tamaño según sea necesario
          />
          <div className="ml-2">
            <div className="font-bold">{user.name} {user.lastName}</div>
            <div className="text-default-500 text-xs">{user.email}</div>
          </div>
        </div>
      );
    case "run":
      return (
        <div className="flex flex-col min-w-24">
          <p className="text-bold text-small capitalize">{user.run ?? "N/A"}</p>
        </div>
      );
    case "role":
      return (
        <div className="flex flex-col  min-w-48 ">
          <p className="text-bold text-small capitalize">{user.roles.map((role) => roleMapping[role]).join(', ')}</p>
          <p className="text-bold text-tiny capitalize text-default-500 truncate text-ellipsis max-w-48">{user.userName ?? "N/A"}</p>
        </div>
      );
    case "companyName":
        return (
          <div className="flex flex-col w-56 ">
            <p className="text-bold text-small capitalize truncate text-ellipsis max-w-56">{user?.company?.name}</p>
            <p className="text-bold text-tiny capitalize text-default-500">{user?.company?.rut}</p>
          </div>
        );
    case "status":
      const statusText = user.deletedLogic ? "Eliminado" : "Activo"; // Ajusta los textos según necesidad
      const chipColor = user.deletedLogic ? "danger" : "success";
      return (
        <Chip className="capitalize" color={chipColor} size="sm" variant="flat">
          {statusText}
        </Chip>
      );
    case "actions":
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
              startContent={<HiEye size={16} className="text-primary" />}
              >Ver más</DropdownItem>
              <DropdownItem
              key="edit"
              startContent={<TbUserEdit size={16} className="text-primary" />}
              >Editar</DropdownItem>
              <DropdownItem
              key="delete"
              startContent={<RiDeleteBin2Fill size={16} className="text-danger" />}
              >Eliminar</DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </div>
      );
    default:
      if (typeof cellValue === 'string' || typeof cellValue === 'number' || typeof cellValue === 'boolean') {
        return <div>{cellValue.toString()}</div>;
      } else {
        return null;
      }
  }
}, []);

  const onRowsPerPageChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setRowsPerPage(Number(e.target.value));
    setPage(1);
  }, []);

  const onSearchChange = useCallback((value?: string) => {
    if (value) {
      setFilterValue(value);
      setPage(1);
    } else {
      setFilterValue("");
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
                inputWrapper: "border-1",
              }}
              placeholder="Buscar por nombre o RUN..."
              size="sm"
              startContent={<CiSearch className="text-default-300" />}
              value={filterValue}
              variant="bordered"
              onClear={() => setFilterValue("")}
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
                  aria-label="Table Columns"
                  closeOnSelect={false}
                  selectedKeys={statusFilter}
                  selectionMode="multiple"
                  onSelectionChange={setStatusFilter}
                >
                  {deletedLogicOptions.map((status) => (
                    <DropdownItem key={String(status.uid)} className="capitalize">
                      {capitalize(status.name)}
                    </DropdownItem>
                  ))}
                </DropdownMenu>
              </Dropdown>
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
              Total {users.length} {users.length === 1 ? "usuario" : "usuarios"}
            </span>
            <label className="flex items-center text-default-400 text-small">
              Filas por página:
              <select
                value={rowsPerPage}
                onChange={onRowsPerPageChange}
                className="bg-transparent outline-none"
              >
                {[5, 15,30, 40, 50].map((rows) => (
                  <option key={rows} value={rows} className="text-default-400 p-2 ">
                    {rows}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>
      </div>
    );
  }, [filterValue, statusFilter, visibleColumns, onSearchChange, onRowsPerPageChange, rowsPerPage, users.length]);


  const bottomContent = useMemo(() => {
    return (
      <div className="py-2 px-2 flex justify-between items-center">
        <Pagination
          showControls
          classNames={{
            cursor: "bg-foreground text-background",
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
      wrapper: ["bg-transparent", "max-w-[100%]"],
      th: ["", "text-default-500", "border-b", "border-divider"],
      tr: ["", "text-default-600", "border-b", "border-divider", "border-gray-200","dark:border-gray-700"],
      td: [
        // changing the rows border radius
        // first
        "group-data-[first=true]/tr:first:before:rounded-none",
        "group-data-[first=true]/tr:last:before:rounded-none",
        // middle
        "group-data-[middle=true]/tr:before:rounded-none",
        // last
        "group-data-[last=true]/tr:first:before:rounded-none",
        "group-data-[last=true]/tr:last:before:rounded-none",
      ],
    }),
    [],
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
          {(column) => (
            <TableColumn
              key={column.uid}
              align={column.uid === "actions" ? "center" : "start"}
              allowsSorting={column.sortable}
            >
              {column.name}
            </TableColumn>
          )}
        </TableHeader>
        <TableBody emptyContent={"NO SE ENCONTRARON RESULTADOS"} items={sortedItems}>
          {(item) => (
            <TableRow key={item.id}>
              {(columnKey) => <TableCell>{renderCell(item, columnKey)}</TableCell>}
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
