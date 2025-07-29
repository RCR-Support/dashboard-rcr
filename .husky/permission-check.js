// .husky/permission-check.js
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

// Ruta al archivo de permisos
const PERMISSIONS_FILE = path.join(process.cwd(), 'config', 'permissions.ts');

// Obtener los archivos modificados (usando la variable de entorno de Husky)
const stagedFiles = process.env.STAGED_FILES 
  ? process.env.STAGED_FILES.split(' ')
  : [];

// Filtrar solo archivos tsx o ts en carpetas relevantes
const relevantFiles = stagedFiles.filter(file => 
  (file.endsWith('.tsx') || file.endsWith('.ts')) && 
  (file.includes('/dashboard/') || file.includes('/app/'))
);

// Buscar componentes que usan withPermission
const checkForPermissions = () => {
  const warnings = [];
  const errors = [];

  relevantFiles.forEach(file => {
    const content = fs.readFileSync(file, 'utf-8');
    
    // Verificar si es una página o componente de cliente
    if (file.includes('page.tsx') || file.includes('ClientPage.tsx')) {
      // Verificar si usa withPermission
      if (!content.includes('withPermission(')) {
        warnings.push(`⚠️  ${file} podría necesitar protección con withPermission`);
      }
      
      // Verificar si tiene documentación de permisos
      if (!content.includes('@permissions')) {
        warnings.push(`⚠️  ${file} no tiene documentación de permisos (@permissions)`);
      }
      
      // Extraer la ruta de protección si existe
      const routeMatch = content.match(/withPermission\([^,]+,\s*['"]([^'"]+)['"]\)/);
      if (routeMatch && routeMatch[1]) {
        const route = routeMatch[1];
        
        // Verificar si la ruta está en permissions.ts
        const permissionsContent = fs.readFileSync(PERMISSIONS_FILE, 'utf-8');
        if (!permissionsContent.includes(`'${route}'`) && !permissionsContent.includes(`"${route}"`)) {
          errors.push(`❌  La ruta '${route}' en ${file} no está definida en permissions.ts`);
        }
      }
    }
  });

  return { warnings, errors };
};

// Ejecutar las verificaciones
const { warnings, errors } = checkForPermissions();

// Mostrar resultados
if (warnings.length > 0) {
  console.log(chalk.yellow('\n⚠️  ADVERTENCIAS DE DOCUMENTACIÓN:'));
  warnings.forEach(warning => console.log(chalk.yellow(warning)));
}

if (errors.length > 0) {
  console.log(chalk.red('\n❌  ERRORES DE PERMISOS:'));
  errors.forEach(error => console.log(chalk.red(error)));
  process.exit(1);  // Fallar el commit si hay errores
}

if (warnings.length > 0) {
  console.log('\n');
  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  });

  readline.question(chalk.yellow('Hay advertencias. ¿Continuar con el commit? (s/n): '), (answer) => {
    readline.close();
    if (answer.toLowerCase() !== 's') {
      process.exit(1);  // Abortar commit
    }
  });
} else if (errors.length === 0 && warnings.length === 0 && relevantFiles.length > 0) {
  console.log(chalk.green('\n✅  Todas las verificaciones de permisos pasaron correctamente.\n'));
}
