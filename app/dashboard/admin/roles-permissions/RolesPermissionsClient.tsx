'use client';

import { useState } from 'react';
import { Card, CardBody, CardHeader, Chip, Tabs, Tab } from '@heroui/react';
import { actionPermissions } from '@/config/action-permissions';
import { permissions as routePermissions } from '@/config/permissions';
import { RoleEnum } from '@prisma/client';
import { CheckCircle2, XCircle, Shield, Route, Activity, Building2 } from 'lucide-react';

export default function RolesPermissionsClient() {
  const [selectedTab, setSelectedTab] = useState('actions');

  // Obtener todos los roles únicos
  const allRoles = Object.values(RoleEnum);

  // Agrupar permisos por módulo
  const groupedActionPermissions = Object.entries(actionPermissions).reduce((acc, [action, config]) => {
    const moduleName = action.split(':')[0]; // Extraer módulo (ej: 'applications', 'documents')
    if (!acc[moduleName]) {
      acc[moduleName] = [];
    }
    acc[moduleName].push({ action, ...config });
    return acc;
  }, {} as Record<string, Array<{ action: string; roles: RoleEnum[]; description: string }>>);

  // Íconos por módulo
  const moduleIcons: Record<string, React.ComponentType<{ className?: string }>> = {
    applications: Activity,
    documents: Shield,
    companies: Building2,
    activities: Activity,
    audit: Shield,
  };

  // Colores por rol
  const roleColors: Record<string, 'success' | 'primary' | 'secondary' | 'warning' | 'default'> = {
    admin: 'success',
    adminContractor: 'primary',
    sheq: 'secondary',
    user: 'warning',
    credential: 'default',
  };

  // Nombres legibles de roles
  const roleNames: Record<string, string> = {
    admin: 'Administrador',
    adminContractor: 'Admin Contratista',
    sheq: 'SHEQ',
    user: 'Usuario',
    credential: 'Credencial',
  };

  return (
    <div className="grid grid-cols-12 gap-4 w-full mx-auto">
      {/* Header */}
      <div className="col-span-12 card-box">
        <div className="flex items-center gap-4">
          <Shield className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">Gestión de Roles y Permisos</h1>
            <p className="text-sm text-default-500">
              Visualiza y gestiona los permisos de cada rol en el sistema
            </p>
          </div>
        </div>
      </div>

      {/* Nota informativa */}
      <div className="col-span-12 card-box bg-blue-50 dark:bg-blue-950/20">
        <div className="flex gap-4">
          <Shield className="h-6 w-6 text-blue-500 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
              ℹ️ Información del Sistema de Permisos
            </h3>
            <ul className="text-sm space-y-1 text-blue-800 dark:text-blue-200">
              <li>• Los permisos de <strong>acciones</strong> controlan qué operaciones puede realizar cada rol (crear, editar, eliminar, etc.)</li>
              <li>• Los permisos de <strong>rutas</strong> controlan qué páginas puede ver cada rol en el menú</li>
              <li>• Los cambios en permisos requieren actualizar el archivo de configuración y reiniciar el servidor</li>
              <li>• En futuras versiones se podrá gestionar permisos dinámicamente desde esta interfaz</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="col-span-12">
        <Tabs 
          selectedKey={selectedTab}
          onSelectionChange={(key) => setSelectedTab(key as string)}
          color="primary"
          variant="bordered"
        >
          <Tab key="actions" title="Permisos de Acciones">
            {/* Matriz de permisos de acciones */}
            <div className="grid grid-cols-12 gap-4 mt-4">
              {Object.entries(groupedActionPermissions).map(([module, perms]) => {
                const Icon = moduleIcons[module] || Activity;
                
                return (
                  <Card key={module} className="col-span-12">
                    <CardHeader className="flex items-center gap-2 bg-default-100">
                      <Icon className="h-5 w-5" />
                      <h3 className="text-lg font-semibold capitalize">{module}</h3>
                      <Chip size="sm" variant="flat">{perms.length} permisos</Chip>
                    </CardHeader>
                    <CardBody>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-default-200">
                              <th className="text-left p-3 font-semibold min-w-[300px]">Acción</th>
                              {allRoles.map(role => (
                                <th key={role} className="text-center p-3 min-w-[120px]">
                                  <Chip 
                                    color={roleColors[role]}
                                    variant="flat"
                                    size="sm"
                                  >
                                    {roleNames[role] || role}
                                  </Chip>
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {perms.map(({ action, roles, description }) => (
                              <tr key={action} className="border-b border-default-100 hover:bg-default-50">
                                <td className="p-3">
                                  <div>
                                    <code className="text-sm font-mono bg-default-100 px-2 py-1 rounded">
                                      {action}
                                    </code>
                                    <p className="text-xs text-default-500 mt-1">{description}</p>
                                  </div>
                                </td>
                                {allRoles.map(role => {
                                  const hasPermission = roles.includes(role);
                                  return (
                                    <td key={role} className="text-center p-3">
                                      {hasPermission ? (
                                        <CheckCircle2 className="h-5 w-5 text-success mx-auto" />
                                      ) : (
                                        <XCircle className="h-5 w-5 text-default-300 mx-auto" />
                                      )}
                                    </td>
                                  );
                                })}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </CardBody>
                  </Card>
                );
              })}
            </div>
          </Tab>

          <Tab key="routes" title="Permisos de Rutas">
            {/* Matriz de permisos de rutas */}
            <Card className="mt-4">
              <CardHeader className="flex items-center gap-2 bg-default-100">
                <Route className="h-5 w-5" />
                <h3 className="text-lg font-semibold">Rutas del Sistema</h3>
                <Chip size="sm" variant="flat">{Object.keys(routePermissions).length} rutas</Chip>
              </CardHeader>
              <CardBody>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-default-200">
                        <th className="text-left p-3 font-semibold min-w-[300px]">Ruta</th>
                        {allRoles.map(role => (
                          <th key={role} className="text-center p-3 min-w-[120px]">
                            <Chip 
                              color={roleColors[role]}
                              variant="flat"
                              size="sm"
                            >
                              {roleNames[role] || role}
                            </Chip>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(routePermissions).map(([route, config]) => (
                        <tr key={route} className="border-b border-default-100 hover:bg-default-50">
                          <td className="p-3">
                            <div>
                              <code className="text-sm font-mono bg-default-100 px-2 py-1 rounded">
                                {route}
                              </code>
                              <p className="text-xs text-default-500 mt-1">{config.description}</p>
                            </div>
                          </td>
                          {allRoles.map(role => {
                            const hasPermission = config.roles.includes(role);
                            return (
                              <td key={role} className="text-center p-3">
                                {hasPermission ? (
                                  <CheckCircle2 className="h-5 w-5 text-success mx-auto" />
                                ) : (
                                  <XCircle className="h-5 w-5 text-default-300 mx-auto" />
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardBody>
            </Card>
          </Tab>

          <Tab key="summary" title="Resumen por Rol">
            {/* Resumen de cada rol */}
            <div className="grid grid-cols-12 gap-4 mt-4">
              {allRoles.map(role => {
                // Contar permisos de acciones
                const actionCount = Object.values(actionPermissions).filter(
                  p => p.roles.includes(role)
                ).length;

                // Contar permisos de rutas
                const routeCount = Object.values(routePermissions).filter(
                  p => p.roles.includes(role)
                ).length;

                // Obtener permisos de acciones
                const roleActions = Object.entries(actionPermissions)
                  .filter(([_, config]) => config.roles.includes(role))
                  .map(([action, config]) => ({ action, description: config.description }));

                // Obtener rutas
                const roleRoutes = Object.entries(routePermissions)
                  .filter(([_, config]) => config.roles.includes(role))
                  .map(([route, config]) => ({ route, description: config.description }));

                return (
                  <Card key={role} className="col-span-12 md:col-span-6 lg:col-span-4">
                    <CardHeader className="flex-col items-start gap-2">
                      <Chip color={roleColors[role]} variant="solid" size="lg">
                        {roleNames[role] || role}
                      </Chip>
                      <div className="flex gap-4 text-sm">
                        <div>
                          <span className="text-default-500">Acciones:</span>
                          <span className="ml-2 font-semibold">{actionCount}</span>
                        </div>
                        <div>
                          <span className="text-default-500">Rutas:</span>
                          <span className="ml-2 font-semibold">{routeCount}</span>
                        </div>
                      </div>
                    </CardHeader>
                    <CardBody>
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-semibold mb-2 flex items-center gap-2">
                            <Activity className="h-4 w-4" />
                            Acciones Permitidas
                          </h4>
                          <div className="space-y-1 max-h-[200px] overflow-y-auto">
                            {roleActions.map(({ action, description }) => (
                              <div key={action} className="text-xs p-2 bg-default-100 rounded">
                                <code className="font-mono">{action}</code>
                                <p className="text-default-500 mt-1">{description}</p>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h4 className="font-semibold mb-2 flex items-center gap-2">
                            <Route className="h-4 w-4" />
                            Rutas Accesibles
                          </h4>
                          <div className="space-y-1 max-h-[150px] overflow-y-auto">
                            {roleRoutes.map(({ route, description }) => (
                              <div key={route} className="text-xs p-2 bg-default-100 rounded">
                                <code className="font-mono">{route}</code>
                                <p className="text-default-500 mt-1">{description}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                );
              })}
            </div>
          </Tab>
        </Tabs>
      </div>
    </div>
  );
}
