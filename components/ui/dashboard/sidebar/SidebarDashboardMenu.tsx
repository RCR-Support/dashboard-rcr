'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AiFillDashboard } from 'react-icons/ai';
import { FaUsers, FaUserPlus, FaUserTie, FaFileContract } from 'react-icons/fa';
import { MdAnalytics, MdWork } from 'react-icons/md';
import { Accordion, AccordionItem } from '@heroui/react';
import { useSession } from 'next-auth/react';
import { useUIStore } from '@/store/ui/ui-store';
import { useWindowSize } from '@/hooks/useWindowSize';
import { useRoleStore } from '@/store/ui/roleStore';
import { IoIosList } from 'react-icons/io';
import { IoBusinessSharp } from 'react-icons/io5';
import { MdOutlineAddBusiness } from 'react-icons/md';
import { GiMineTruck } from 'react-icons/gi';
export const SidebarDashboardMenu = () => {
  const closeMenu = useUIStore(state => state.closeSideMenu);
  const { data: session } = useSession();
  const { width } = useWindowSize();
  const router = usePathname() ?? '';

  // Obtenemos el rol seleccionado desde el store
  const selectedRole = useRoleStore(state => state.selectedRole);

  // Ahora usamos el selectedRole para determinar qué menú mostrar
  const isAdmin = selectedRole === 'admin';
  const isSheq = selectedRole === 'sheq';
  const isAdminContractor = selectedRole === 'adminContractor';
  const isUser = selectedRole === 'user';
  const isCredential = selectedRole === 'credential';

  const handleClick = () => {
    if (width !== undefined && width <= 1023) {
      // Se añade un pequeño retraso para permitir el desplazamiento antes de cerrar el menú
      setTimeout(closeMenu, 300);
    }
  };

  const isUsersRoute = router.includes('dashboard/users');
  const isCompaniesRoute = router.includes('dashboard/companies');
  const isContractsRoute = router.includes('/dashboard/contracts');
  const isDocumentationsRoute = router.includes('dashboard/documentations');
  const isApplicationsRoute = router.includes('dashboard/applications');
  const isActivitiesRoute = router.includes('dashboard/activities');

  return (
    <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto pointer-events-auto">
      <div className="flex-1 px-3 bg-white dark:bg-[#282c34] text-slate-600 dark:text-white divide-y space-y-1">
        <ul className="flex-1 space-y-2">
          <li className="text-[#757575] dark:text-[#f6f7cf] mb-6">Home</li>
          <li
            className={`px-2 py-1 ${
              router === '/dashboard'
                ? 'bg-[#03c9d7] dark:bg-[#03c9d7] rounded-lg text-white'
                : 'hover:text-[#03c9d7] hover:bg-[#ebf9fa] dark:hover:bg-[#082e45]'
            }`}
          >
            <Link
              href="/dashboard"
              onClick={handleClick}
              className="font-normal rounded-lg flex items-center p-2 group"
            >
              <AiFillDashboard className="text-[18px]" />
              <span className="ml-3">Dashboard</span>
            </Link>
          </li>

          {isAdmin && (
            <>
              {/* Menú exclusivo para admin */}
              <Accordion key={`users-${isUsersRoute}`} defaultExpandedKeys={isUsersRoute ? ['users'] : []}>
                <AccordionItem
                  className="px-2 hover:text-[#03c9d7] dark:hover:bg-[#082e45] hover:bg-[#ebf9fa] dark:bg-[#282c34] text-slate-800 dark:text-white"
                  key="users"
                  startContent={<FaUsers className="text-[18px]" />}
                  aria-label="Usuarios del Sistema"
                  title="Usuarios Sistema"
                >
                  <ul className="pl-2">
                    <li
                      className={`px-2 py-1 ${
                        router === '/dashboard/users'
                          ? 'bg-[#03c9d7] dark:bg-[#03c9d7] rounded-lg text-white'
                          : 'hover:text-[#03c9d7] hover:bg-[#ebf9fa] dark:hover:bg-[#082e45]'
                      }`}
                    >
                      <Link
                        href="/dashboard/users"
                        onClick={handleClick}
                        className="font-normal rounded-lg flex items-center p-2 group"
                      >
                        <IoIosList className="text-[20px]" />
                        <span className="ml-3">Listado</span>
                      </Link>
                    </li>
                    <li
                      className={`px-2 py-1 ${
                        router === '/dashboard/users/createUser'
                          ? 'bg-[#03c9d7] dark:bg-[#03c9d7] rounded-lg text-white'
                          : 'hover:text-[#03c9d7] hover:bg-[#ebf9fa] dark:hover:bg-[#082e45]'
                      }`}
                    >
                      <Link
                        href="/dashboard/users/createUser"
                        onClick={handleClick}
                        className="font-normal rounded-lg flex items-center p-2 group"
                      >
                        <FaUserPlus className="text-[18px]" />
                        <span className="ml-3">Crear Usuario</span>
                      </Link>
                    </li>
                    <li
                      className={`px-2 py-1 ${
                        router === '/dashboard/admin/roles-permissions'
                          ? 'bg-[#03c9d7] dark:bg-[#03c9d7] rounded-lg text-white'
                          : 'hover:text-[#03c9d7] hover:bg-[#ebf9fa] dark:hover:bg-[#082e45]'
                      }`}
                    >
                      <Link
                        href="/dashboard/admin/roles-permissions"
                        onClick={handleClick}
                        className="font-normal rounded-lg flex items-center p-2 group"
                      >
                        <FaUserTie className="text-[18px]" />
                        <span className="ml-3">Roles y Permisos</span>
                      </Link>
                    </li>
                  </ul>
                </AccordionItem>
              </Accordion>
            </>
          )}

          {/* Menú de empresas solo para admin (adminContractor no gestiona empresas) */}
          {isAdmin && (
            <Accordion
              key={`companies-${isCompaniesRoute}`}
              defaultExpandedKeys={isCompaniesRoute ? ['companies'] : []}
            >
              <AccordionItem
                className="px-2 hover:text-[#03c9d7] dark:hover:bg-[#082e45] hover:bg-[#ebf9fa] dark:bg-[#282c34] text-slate-800 dark:text-white"
                key="companies"
                startContent={<IoBusinessSharp className="text-[18px]" />}
                aria-label="Empresas del Sistema"
                title="Empresas Sistema"
              >
                <ul className="pl-2">
                  <li
                    className={`px-2 py-1 ${
                      router === '/dashboard/companies'
                        ? 'bg-[#03c9d7] dark:bg-[#03c9d7] rounded-lg text-white'
                        : 'hover:text-[#03c9d7] hover:bg-[#ebf9fa] dark:hover:bg-[#082e45]'
                    }`}
                  >
                    <Link
                      href="/dashboard/companies"
                      onClick={handleClick}
                      className="font-normal rounded-lg flex items-center p-2 group"
                    >
                      <IoIosList className="text-[20px]" />
                      <span className="ml-3">Listado</span>
                    </Link>
                  </li>
                  <li
                    className={`px-2 py-1 ${
                      router === '/dashboard/companies/createCompany'
                        ? 'bg-[#03c9d7] dark:bg-[#03c9d7] rounded-lg text-white'
                        : 'hover:text-[#03c9d7] hover:bg-[#ebf9fa] dark:hover:bg-[#082e45]'
                    }`}
                  >
                    <Link
                      href="/dashboard/companies/createCompany"
                      onClick={handleClick}
                      className="font-normal rounded-lg flex items-center p-2 group"
                    >
                      <MdOutlineAddBusiness className="text-[18px]" />
                      <span className="ml-3">Crear Empresa</span>
                    </Link>
                  </li>
                </ul>
              </AccordionItem>
            </Accordion>
          )}

          {/* Menú de contratos para admin y adminContractor */}
          {(isAdmin || isAdminContractor) && (
            <Accordion
              key={`contracts-${isContractsRoute}`}
              defaultExpandedKeys={isContractsRoute ? ['contracts'] : []}
            >
              <AccordionItem
                className="px-2 hover:text-[#03c9d7] dark:hover:bg-[#082e45] hover:bg-[#ebf9fa] dark:bg-[#282c34] text-slate-800 dark:text-white"
                key="contracts"
                startContent={<FaFileContract className="text-[18px]" />}
                aria-label="Contratos"
                title={isAdmin ? 'Contratos' : 'Mis Contratos'}
              >
                <ul className="pl-2">
                  <li
                    className={`px-2 py-1 ${
                      router === '/dashboard/contracts'
                        ? 'bg-[#03c9d7] dark:bg-[#03c9d7] rounded-lg text-white'
                        : 'hover:text-[#03c9d7] hover:bg-[#ebf9fa] dark:hover:bg-[#082e45]'
                    }`}
                  >
                    <Link
                      href="/dashboard/contracts"
                      onClick={handleClick}
                      className="font-normal rounded-lg flex items-center p-2 group"
                    >
                      <IoIosList className="text-[20px]" />
                      <span className="ml-3">Listado</span>
                    </Link>
                  </li>
                  {isAdmin && (
                    <li
                      className={`px-2 py-1 ${
                        router === '/dashboard/contracts/create'
                          ? 'bg-[#03c9d7] dark:bg-[#03c9d7] rounded-lg text-white'
                          : 'hover:text-[#03c9d7] hover:bg-[#ebf9fa] dark:hover:bg-[#082e45]'
                      }`}
                    >
                      <Link
                        href="/dashboard/contracts/create"
                        onClick={handleClick}
                        className="font-normal rounded-lg flex items-center p-2 group"
                      >
                        <FaFileContract className="text-[18px]" />
                        <span className="ml-3">Crear Contrato</span>
                      </Link>
                    </li>
                  )}
                </ul>
              </AccordionItem>
            </Accordion>
          )}

          {isAdmin && (
            <>
              {/* Este bloque de código se mueve fuera del isAdmin para estar disponible para todos los roles */}

              <Accordion
                key={`docs-${isDocumentationsRoute}`}
                defaultExpandedKeys={
                  isDocumentationsRoute
                    ? ['documentations']
                    : []
                }
              >
                <AccordionItem
                  className="px-2 hover:text-[#03c9d7] dark:hover:bg-[#082e45] hover:bg-[#ebf9fa] dark:bg-[#282c34] text-slate-800 dark:text-white"
                  key="documentations"
                  startContent={<MdWork className="text-[18px]" />}
                  aria-label="Documentaciones"
                  title="Documentaciones"
                >
                  <ul className="pl-2">
                    <li
                      className={`px-2 py-1 ${
                        router === '/dashboard/documentations'
                          ? 'bg-[#03c9d7] dark:bg-[#03c9d7] rounded-lg text-white'
                          : 'hover:text-[#03c9d7] hover:bg-[#ebf9fa] dark:hover:bg-[#082e45]'
                      }`}
                    >
                      <Link
                        href="/dashboard/documentations"
                        onClick={handleClick}
                        className="font-normal rounded-lg flex items-center p-2 group"
                      >
                        <IoIosList className="text-[20px]" />
                        <span className="ml-3">Listado</span>
                      </Link>
                    </li>
                  </ul>
                </AccordionItem>
              </Accordion>
            </>
          )}

          {isSheq && (
            <>
              <li className="text-[#757575] dark:text-[#f6f7cf] mb-6">Sheq</li>
              <li
                className={`px-2 py-1 ${
                  router === '/dashboard/sheq'
                    ? 'bg-[#03c9d7] dark:bg-[#03c9d7] rounded-lg'
                    : 'hover:text-[#03c9d7] hover:bg-[#ebf9fa] dark:hover:bg-[#082e45]'
                }`}
              >
                <Link
                  href="/dashboard/sheq"
                  onClick={handleClick}
                  className="font-normal rounded-lg flex items-center p-2 group"
                >
                  <MdAnalytics className="text-[18px]" />
                  <span className="ml-3">Sitio Sheq</span>
                </Link>
              </li>
            </>
          )}

          {isCredential && (
            <>
              <li className="text-[#757575] dark:text-[#f6f7cf] mb-6">
                Credenciales
              </li>
              <li
                className={`px-2 py-1 ${
                  router.includes('/dashboard/credentials')
                    ? 'bg-[#03c9d7] dark:bg-[#03c9d7] rounded-lg text-white'
                    : 'hover:text-[#03c9d7] hover:bg-[#ebf9fa] dark:hover:bg-[#082e45]'
                }`}
              >
                <Link
                  href="/dashboard/credentials"
                  onClick={handleClick}
                  className="font-normal rounded-lg flex items-center p-2 group"
                >
                  <FaUserTie className="text-[18px]" />
                  <span className="ml-3">Imprimir Credenciales</span>
                </Link>
              </li>
            </>
          )}

          {/* Menú de Solicitudes para usuarios, sheq, adminContractor y administradores */}
          {(isAdmin || isUser || isSheq || isAdminContractor) && !isCredential && (
            <Accordion
              key={`apps-${isApplicationsRoute}`}
              defaultExpandedKeys={
                isApplicationsRoute ? ['applications'] : []
              }
            >
              <AccordionItem
                className="px-2 hover:text-[#03c9d7] dark:hover:bg-[#082e45] hover:bg-[#ebf9fa] dark:bg-[#282c34] text-slate-800 dark:text-white"
                key="applications"
                startContent={<FaUserPlus className="text-[18px]" />}
                aria-label="Solicitudes"
                title="Solicitudes"
              >
                <ul className="pl-2">
                  <li
                    className={`px-2 py-1 ${
                      router === '/dashboard/applications'
                        ? 'bg-[#03c9d7] dark:bg-[#03c9d7] rounded-lg text-white'
                        : 'hover:text-[#03c9d7] hover:bg-[#ebf9fa] dark:hover:bg-[#082e45]'
                    }`}
                  >
                    <Link
                      href="/dashboard/applications"
                      onClick={handleClick}
                      className="font-normal rounded-lg flex items-center p-2 group"
                    >
                      <IoIosList className="text-[20px]" />
                      <span className="ml-3">Listado</span>
                    </Link>
                  </li>
                  {/* User y Admin pueden crear solicitudes */}
                  {(isUser || isAdmin) && (
                    <li
                      className={`px-2 py-1 ${
                        router === '/dashboard/applications/create'
                          ? 'bg-[#03c9d7] dark:bg-[#03c9d7] rounded-lg text-white'
                          : 'hover:text-[#03c9d7] hover:bg-[#ebf9fa] dark:hover:bg-[#082e45]'
                      }`}
                    >
                      <Link
                        href="/dashboard/applications/create"
                        onClick={handleClick}
                        className="font-normal rounded-lg flex items-center p-2 group"
                      >
                        <FaUserPlus className="text-[18px]" />
                        <span className="ml-3">Crear nueva</span>
                      </Link>
                    </li>
                  )}
                </ul>
              </AccordionItem>
            </Accordion>
          )}

          {/* Menú de Actividades visible para todos los roles excepto credential */}
          {(isAdmin || isSheq || isAdminContractor || isUser) &&
            !isCredential && (
              <Accordion
                key={`activities-${isActivitiesRoute}`}
                defaultExpandedKeys={
                  isActivitiesRoute ? ['activities'] : []
                }
              >
                <AccordionItem
                  className="px-2 hover:text-[#03c9d7] dark:hover:bg-[#082e45] hover:bg-[#ebf9fa] dark:bg-[#282c34] text-slate-800 dark:text-white"
                  key="activities"
                  startContent={<GiMineTruck className="text-[24px]" />}
                  aria-label="Actividades"
                  title="Actividades"
                >
                  <ul className="pl-2">
                    <li
                      className={`px-2 py-1 ${
                        router === '/dashboard/activities'
                          ? 'bg-[#03c9d7] dark:bg-[#03c9d7] rounded-lg text-white'
                          : 'hover:text-[#03c9d7] hover:bg-[#ebf9fa] dark:hover:bg-[#082e45]'
                      }`}
                    >
                      <Link
                        href="/dashboard/activities"
                        onClick={handleClick}
                        className="font-normal rounded-lg flex items-center p-2 group"
                      >
                        <IoIosList className="text-[20px]" />
                        <span className="ml-3">Listado</span>
                      </Link>
                    </li>
                    {/* Solo los administradores pueden crear actividades */}
                    {isAdmin && (
                      <li
                        className={`px-2 py-1 ${
                          router === '/dashboard/activities/createActivity'
                            ? 'bg-[#03c9d7] dark:bg-[#03c9d7] rounded-lg text-white'
                            : 'hover:text-[#03c9d7] hover:bg-[#ebf9fa] dark:hover:bg-[#082e45]'
                        }`}
                      >
                        <Link
                          href="/dashboard/activities/createActivity"
                          onClick={handleClick}
                          className="font-normal rounded-lg flex items-center p-2 group"
                        >
                          <FaUserPlus className="text-[18px]" />
                          <span className="ml-3">Nueva Actividad</span>
                        </Link>
                      </li>
                    )}
                  </ul>
                </AccordionItem>
              </Accordion>
            )}
        </ul>
      </div>
    </div>
  );
};
