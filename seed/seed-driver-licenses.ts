import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// Mapeo de actividades y sus licencias requeridas
const activityLicenses = [
  { activity: 'Alzahombre', license: null }, // No requiere licencia
  { activity: 'Ambulancia', license: 'a1,a2,a3,a4,a5' },
  { activity: 'Armador De Andamio', license: null }, // No requiere licencia
  { activity: 'Autorizado Para Bloquear', license: null }, // No requiere licencia
  { activity: 'Bulldozer CAT D10T', license: 'd' },
  { activity: 'Bulldozer CAT D10T2', license: 'd' },
  { activity: 'Buses', license: 'a1,a3' },
  { activity: 'Camión Aljibe CAT 773E', license: 'd' },
  { activity: 'Camión Aljibe CAT 777D', license: 'd' },
  { activity: 'Camión Aljibe KOM 785 HD-7', license: 'd' },
  { activity: 'Camión Extracción CAT 785C', license: 'd' },
  { activity: 'Camión Extracción KOM 830E-1', license: 'd' },
  { activity: 'Camión Extracción KOM 830E-5', license: 'd' },
  { activity: 'Camión Frontal CAT 966L', license: 'd' },
  { activity: 'Camión Frontal CAT 992G', license: 'd' },
  { activity: 'Camión Frontal CAT 994F', license: 'd' },
  { activity: 'Camión Frontal CAT 994K', license: 'd' },
  { activity: 'Cama Baja Mack', license: 'a1,a2,a3,a4,a5' },
  { activity: 'Camioneta Combustible', license: 'b' },
  { activity: 'Camioneta Polvorinera', license: 'b' },
  { activity: 'Camioneta Rescate/Emergencia', license: 'b' },
  { activity: 'Camioneta Triple Cabina', license: 'b' },
  { activity: 'Camión 3/4', license: 'a1,a2,a3,a4,a5' },
  { activity: 'Camión Aljibe', license: 'a1,a2,a3,a4,a5' },
  { activity: 'Camión Ampliroll', license: 'a1,a2,a3,a4,a5' },
  { activity: 'Camión Articulado Dumper', license: 'd' },
  { activity: 'Camión Aspirador Alto Vacio', license: 'a1,a2,a3,a4,a5' },
  { activity: 'Camión CAEX Komatsu 730', license: 'd' },
  { activity: 'Camión Caex 773', license: 'd' },
  { activity: 'Camión Caex 777', license: 'd' },
  { activity: 'Camión Caex 789', license: 'd' },
  { activity: 'Camión Cama Baja', license: 'a1,a2,a3,a4,a5' },
  { activity: 'Camión Catodos', license: 'a1,a2,a3,a4,a5' },
  { activity: 'Camión Combustible', license: 'a1,a2,a3,a4,a5' },
  { activity: 'Camión Desobstructor', license: 'a1,a2,a3,a4,a5' },
  { activity: 'Camión Fosero', license: 'a1,a2,a3,a4,a5' },
  { activity: 'Camión Fábrica', license: 'a1,a2,a3,a4,a5' },
  { activity: 'Camión Hidrolavador', license: 'a1,a2,a3,a4,a5' },
  { activity: 'Camión Lubricador', license: 'a1,a2,a3,a4,a5' },
  { activity: 'Camión Lubricador/Pluma', license: 'a1,a2,a3,a4,a5' },
  { activity: 'Camión Pluma Solo Camión', license: 'a1,a2,a3,a4,a5' },
  { activity: 'Camión Pluma Y Grua Pluma', license: 'a1,a2,a3,a4,a5' },
  { activity: 'Camión Polvorín', license: 'a1,a2,a3,a4,a5' },
  { activity: 'Camión Rampla (plano)', license: 'a1,a2,a3,a4,a5' },
  { activity: 'Camión Rotainer', license: 'a1,a2,a3,a4,a5' },
  { activity: 'Camión Sonda', license: 'a1,a2,a3,a4,a5' },
  { activity: 'Camión Tolva', license: 'a1,a2,a3,a4,a5' },
  { activity: 'Camión De Sevicio', license: 'a1,a2,a3,a4,a5' },
  { activity: 'Camión De Emergencia', license: 'a1,a2,a3,a4,a5' },
  { activity: 'Camión Ácido', license: 'a1,a2,a3,a4,a5' },
  { activity: 'Cargador Frontal Otras Marcas', license: 'd' },
  { activity: 'Cargador WA900', license: 'd' },
  { activity: 'D-75-KS', license: 'd' },
  { activity: 'Enrolla Cable CAT 980', license: 'd' },
  { activity: 'Enrolla Cable Kom WA 600', license: 'd' },
  { activity: 'Equipo Radiactivo 1era, 2da Y 3era', license: null }, // No requiere licencia
  { activity: 'Espacios Confinados', license: null }, // No requiere licencia
  { activity: 'Excavadora Balde/Pica Roca', license: 'd' },
  { activity: 'Excavadora Liebherr Modelo 984', license: 'd' },
  { activity: 'Excavadoras PC 5500', license: 'd' },
  { activity: 'Furgon', license: 'a1,a2,a3' },
  { activity: 'Grua Portal', license: null }, // No requiere licencia
  { activity: 'Grúa Horquilla', license: 'd' },
  { activity: 'Grúa Móvil', license: 'd' },
  { activity: 'Grúa Pluma Solo Grúa', license: null }, // No requiere licencia
  { activity: 'Grúa Puente', license: 'd' },
  { activity: 'KOMATSU WD600-6R', license: 'd' },
  { activity: 'Lainera', license: null }, // No requiere licencia
  { activity: 'Limpiadora De Vapor "OPTIMA"', license: 'a1,a2,a3,a4,a5,b' },
  { activity: 'Manipulador Telescópico', license: 'd' },
  { activity: 'Manipulador De Neumáticos CF', license: 'd' },
  { activity: 'Manipulador De Neumáticos GH', license: 'd' },
  { activity: 'Martillo Pica Roca', license: null }, // No requiere licencia
  { activity: 'Minibus', license: 'a1,a2,a3' },
  { activity: 'Minicargador', license: 'd' },
  { activity: 'Motoniveladora CAT 16', license: 'd' },
  { activity: 'Motoniveladora CAT 16M', license: 'd' },
  { activity: 'Pala 4100 XPC AC', license: 'd' },
  { activity: 'Perfolodos WS 1400', license: 'a1,a2,a3,a4,a5' },
  { activity: 'Perforadora D755K', license: 'd' },
  { activity: 'Perforadora DM50', license: 'd' },
  { activity: 'Perforadora DMM2', license: 'd' },
  { activity: 'Perforadora MD6240', license: 'd' },
  { activity: 'Perforadora MD6380', license: 'd' },
  { activity: 'Perforadora Roc L8', license: 'd' },
  { activity: 'ROCL8', license: 'd' },
  { activity: 'Retroexcavadoras', license: 'd' },
  { activity: 'Rigger', license: null }, // No requiere licencia
  { activity: 'Rodillo', license: 'd' },
  { activity: 'Rotopala / Spreader', license: null }, // No requiere licencia
  { activity: 'Soldador', license: null }, // No requiere licencia
  { activity: 'Sonda', license: null }, // No requiere licencia
  { activity: 'Tapapozos', license: 'd' },
  { activity: 'Thunderbolt', license: null }, // No requiere licencia
  { activity: 'Trabajo Altura Física', license: null }, // No requiere licencia
  { activity: 'Tracto Camión', license: 'a1,a2,a3,a4,a5' },
  { activity: 'Tractor De Orugas', license: 'd' },
  { activity: 'Tractor De Ruedas', license: 'd' },
  { activity: 'Traslado Palas', license: 'd' },
  { activity: 'Traslado Perforadora', license: 'd' },
  { activity: 'Uso Cuchillo OLFA', license: null }, // No requiere licencia
  { activity: 'Vehículo Liviano', license: 'a1,a2,a3,a4,a5,b' },
  { activity: 'Welldozer WD900', license: 'd' },
  { activity: 'Wheeldozer CAT 834G', license: 'd' },
  { activity: 'Wheeldozer CAT 854K', license: 'd' }
];

async function main() {
  console.log('Actualizando licencias de conducir para actividades...');
  
  for (const item of activityLicenses) {
    const activity = await prisma.activity.findUnique({ 
      where: { name: item.activity } 
    });
    
    if (activity) {
      await prisma.activity.update({
        where: { id: activity.id },
        data: { requiredDriverLicense: item.license }
      });
      console.log(`Actualizada licencia para: ${item.activity}`);
    } else {
      console.log(`No se encontró la actividad: ${item.activity}`);
    }
  }
  
  console.log('Proceso finalizado.');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
