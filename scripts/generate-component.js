// generate-component.js
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Preguntas para generar la documentación
const questions = [
  { name: 'componentName', question: 'Nombre del componente: ' },
  { name: 'description', question: 'Descripción breve: ' },
  { name: 'permissions', question: 'Roles con permiso (separados por coma): ' },
  { name: 'route', question: 'Ruta protegida: ' },
  { name: 'dependencies', question: 'Dependencias: ' },
  { name: 'related', question: 'Componentes relacionados: ' },
];

const answers = {};

// Función para hacer preguntas secuencialmente
function askQuestions(index = 0) {
  if (index >= questions.length) {
    generateComponent(answers);
    rl.close();
    return;
  }

  rl.question(questions[index].question, (answer) => {
    answers[questions[index].name] = answer;
    askQuestions(index + 1);
  });
}

// Función para generar el componente
function generateComponent(data) {
  const today = new Date().toLocaleDateString('es-ES');
  const username = require('os').userInfo().username;
  
  const componentContent = `/**
 * @name ${data.componentName}
 * @description ${data.description}
 * 
 * @permissions ${data.permissions}
 * @dependencies ${data.dependencies}
 * @related ${data.related}
 * 
 * @example
 * // Ejemplo de uso
 * <${data.componentName} />
 * 
 * @changelog
 * - ${today}: ${username} - Creación inicial del componente
 */

'use client';

import { FC } from 'react';
import { withPermission } from '@/components/ui/auth/withPermission';

interface Props {
  // Definir propiedades
}

const ${data.componentName}: FC<Props> = (props) => {
  return (
    <div>
      {/* Contenido del componente */}
    </div>
  );
};

const Protected${data.componentName} = withPermission(${data.componentName}, '${data.route}');
export default Protected${data.componentName};
`;

  // Crear la estructura de carpetas si no existe
  const componentDir = path.join(process.cwd(), 'src', 'components', data.componentName.toLowerCase());
  if (!fs.existsSync(componentDir)) {
    fs.mkdirSync(componentDir, { recursive: true });
  }
  
  // Escribir el archivo del componente
  fs.writeFileSync(
    path.join(componentDir, `${data.componentName}.tsx`),
    componentContent
  );

  console.log(`Componente ${data.componentName} creado con éxito!`);
}

console.log('Generador de Componentes con Documentación\n');
askQuestions();
