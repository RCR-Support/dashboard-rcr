// scripts/reminder.mjs

/**
 * Script para mostrar recordatorios al iniciar el proyecto
 */

import chalk from 'chalk';
import boxen from 'boxen';

console.log(
  boxen(
    `${chalk.bold('🔒 RECORDATORIO: CONTROL DE ACCESO Y PERMISOS 🔒\n\n')}` +
    `${chalk.cyan('Al crear nuevos componentes recuerda:\n')}` +
    `- Usar ${chalk.yellow('withPermission')} para proteger páginas\n` +
    `- Definir permisos en ${chalk.yellow('config/permissions.ts')}\n` +
    `- Documentar los roles permitidos con ${chalk.yellow('@permissions')}\n` +
    `- Verificar acceso desde URL directa\n\n` +
    `${chalk.green('📚 Consulta GUIA-DESARROLLO.md para más detalles')}`,
    {
      padding: 1,
      margin: 1,
      borderStyle: 'round',
      borderColor: 'yellow'
    }
  )
);
