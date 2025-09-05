/**
 * @name ComponentName
 * @description Breve descripción de la funcionalidad del componente
 *
 * @permissions - Lista de roles que pueden acceder a este componente
 * @dependencies - Dependencias importantes (Redux, Context, etc.)
 * @related - Componentes relacionados
 *
 * @example
 * // Ejemplo de uso
 * <ComponentName prop1="value" />
 *
 * @changelog
 * - Fecha: Autor - Cambio realizado
 */

'use client';

import { FC } from 'react';
import { withPermission } from '@/components/ui/auth/withPermission';

interface Props {
  // Definir propiedades
}

const ComponentName: FC<Props> = props => {
  return <div>{/* Contenido del componente */}</div>;
};

const ProtectedComponent = withPermission(ComponentName, '/ruta/protegida');
export default ProtectedComponent;
