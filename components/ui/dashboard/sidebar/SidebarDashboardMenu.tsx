'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AiFillDashboard, AiFillHome } from 'react-icons/ai';
import { FaRegChartBar, FaUsers, FaUserPlus, FaUserTie } from 'react-icons/fa';
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
          <li
            className={`px-2 py-1 ${
              router === '/'
                ? 'bg-[#03c9d7] dark:bg-[#03c9d7] rounded-lg'
                : 'hover:text-[#03c9d7] hover:bg-[#ebf9fa] dark:hover:bg-[#082e45]'
            }`}
          >
            <Link
              href="/"
              onClick={handleClick}
              className="font-normal rounded-lg flex items-center p-2 group justify-between"
            >
              <div className="flex items-center">
                <AiFillHome className="text-[18px]" />
                <span className="ml-3">Inicio</span>
              </div>
              <span className="bg-[#fb9678] dark:bg-[#fb9678] text-white rounded-full w-5 h-5 flex justify-center items-center text-xs">
                3
              </span>
            </Link>
          </li>
          <li
            className={`px-2 py-1 ${
              router === '/'
                ? 'bg-[#03c9d7] dark:bg-[#03c9d7] rounded-lg'
                : 'hover:text-[#03c9d7] hover:bg-[#ebf9fa] dark:hover:bg-[#082e45]'
            }`}
          >
            <div className="font-normal rounded-lg flex items-center p-2 group justify-between">
              <div className="flex items-center">
                <FaRegChartBar className="text-[18px]" />
                <span className="ml-3">Reportes</span>
              </div>
              <span className="bg-[#fb9678] dark:bg-[#fb9678] text-white rounded-full w-5 h-5 flex justify-center items-center text-xs">
                3
              </span>
            </div>
          </li>

          {isAdmin && (
            <>
              {/* Menú exclusivo para admin */}
              <Accordion defaultExpandedKeys={isUsersRoute ? ['users'] : []}>
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
                  </ul>
                </AccordionItem>
              </Accordion>

              <Accordion
                defaultExpandedKeys={isUsersRoute ? ['companies'] : []}
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
                        <span className="ml-3">Listado </span>
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

              {/* Este bloque de código se mueve fuera del isAdmin para estar disponible para todos los roles */}

              <Accordion
                defaultExpandedKeys={
                  router.includes('dashboard/documentations')
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

          {isAdminContractor && (
            <>
              <li className="text-[#757575] dark:text-[#f6f7cf] mb-6">
                Contratistas
              </li>
              <li
                className={`px-2 py-1 ${
                  router === '/dashboard/contractors'
                    ? 'bg-[#03c9d7] dark:bg-[#03c9d7] rounded-lg'
                    : 'hover:text-[#03c9d7] hover:bg-[#ebf9fa] dark:hover:bg-[#082e45]'
                }`}
              >
                <Link
                  href="/dashboard/contractors"
                  onClick={handleClick}
                  className="font-normal rounded-lg flex items-center p-2 group"
                >
                  <IoIosList className="text-[20px]" />
                  <span className="ml-3">Listado</span>
                </Link>
              </li>
            </>
          )}

          {isUser && (
            <>
              <li className="text-[#757575] dark:text-[#f6f7cf] mb-6">
                Mi Cuenta
              </li>
              <li
                className={`px-2 py-1 ${
                  router === '/dashboard/profile'
                    ? 'bg-[#03c9d7] dark:bg-[#03c9d7] rounded-lg'
                    : 'hover:text-[#03c9d7] hover:bg-[#ebf9fa] dark:hover:bg-[#082e45]'
                }`}
              >
                <Link
                  href="/dashboard"
                  onClick={handleClick}
                  className="font-normal rounded-lg flex items-center p-2 group"
                >
                  <FaUserTie className="text-[18px]" />
                  <span className="ml-3">Perfil</span>
                </Link>
              </li>
            </>
          )}

          {isCredential && (
            <>
              <li className="text-[#757575] dark:text-[#f6f7cf] mb-6">
                ¿Que imprime?
              </li>
              <li
                className={`px-2 py-1 ${
                  router === '/dashboard/credential'
                    ? 'bg-[#03c9d7] dark:bg-[#03c9d7] rounded-lg'
                    : 'hover:text-[#03c9d7] hover:bg-[#ebf9fa] dark:hover:bg-[#082e45]'
                }`}
              >
                <Link
                  href="/dashboard/credential"
                  onClick={handleClick}
                  className="font-normal rounded-lg flex items-center p-2 group"
                >
                  <FaUserTie className="text-[18px]" />
                  <span className="ml-3">Perfil del que imprime</span>
                </Link>
              </li>
            </>
          )}

          {/* Menú de Actividades visible para todos los roles excepto credential */}
          {(isAdmin || isSheq || isAdminContractor || isUser) &&
            !isCredential && (
              <Accordion
                defaultExpandedKeys={
                  router.includes('dashboard/activities') ? ['activities'] : []
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
