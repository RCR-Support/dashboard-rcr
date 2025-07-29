import { PrismaClient } from '@prisma/client';
import { activityDocumentationNotes } from './activity-documentation-notes';
const prisma = new PrismaClient();

// Relación actividad-documentación extraída del markdown
const relations = [
  // Licencia Municipal
  { doc: 'Licencia Municipal', acts: [
    'Camión Extracción KOM 830E-1','Buses','Camión Ampliroll','Camión Articulado Dumper','Camión Aspirador Alto Vacio','Camión Fosero','Camión Pluma Y Grua Pluma','Cargador Frontal Otras Marcas','Grúa Horquilla','Grúa Móvil','Manipulador Telescópico','Minicargador','Perforadora MD6240','Perforadora DM50','Perforadora D755K','Perforadora DMM2','Retroexcavadoras','Rodillo','Grúa Puente','Camión Aljibe CAT 773E','Camión Combustible','Excavadora Balde/Pica Roca','Ambulancia','Perfolodos WS 1400','Camión Ácido','Tracto Camión','Camión Catodos','Camión 3/4','Camión Hidrolavador','Camión Pluma Solo Camión','Camión Tolva','Camión Rampla (plano)','Camión Rotainer','Camión Desobstructor','Camioneta Combustible','Camioneta Triple Cabina','Furgon','Minibus','Camión De Sevicio','Cama Baja Mack','Camión Lubricador','Camioneta Polvorinera','Camioneta Rescate/Emergencia','Vehículo Liviano','Camión Caex 773','Camión Caex 777','Traslado Perforadora','Traslado Palas','Camión Extracción CAT 785C','Camión Caex 789','Camión Fábrica','Camión Polvorín','Camión Sonda','Camión Frontal CAT 992G','Camión Frontal CAT 994F','Excavadoras PC 5500','Manipulador De Neumáticos CF','Manipulador De Neumáticos GH','Motoniveladora CAT 16M','Sonda','Tractor De Orugas','Tractor De Ruedas','Tapapozos','Wheeldozer CAT 834G','Cargador WA900','Camión Aljibe KOM 785 HD-7','Welldozer WD900'
  ]},
  // Sicosensotécnico
  { doc: 'Sicosensotécnico', acts: [
    'Lainera','Thunderbolt','Camión Extracción KOM 830E-1','Buses','Camión Ampliroll','Camión Articulado Dumper','Camión Aspirador Alto Vacio','Camión Fosero','Camión Pluma Y Grua Pluma','Cargador Frontal Otras Marcas','Grúa Horquilla','Grúa Móvil','Manipulador Telescópico','Minicargador','Perforadora MD6240','Perforadora DM50','Perforadora D755K','Perforadora DMM2','Retroexcavadoras','Rodillo','Grúa Pluma Solo Grúa','Grúa Puente','Martillo Pica Roca','Rotopala / Spreader','Camión Aljibe CAT 773E','Camión Combustible','Excavadora Balde/Pica Roca','Ambulancia','Perfolodos WS 1400','Camión Ácido','Tracto Camión','Camión Catodos','Camión 3/4','Camión Hidrolavador','Camión Pluma Solo Camión','Camión Tolva','Camión Rampla (plano)','Camión Rotainer','Camión Desobstructor','Camioneta Combustible','Camioneta Triple Cabina','Furgon','Minibus','Camión De Sevicio','Cama Baja Mack','Camión Lubricador','Camioneta Polvorinera','Camioneta Rescate/Emergencia','Vehículo Liviano','Camión Caex 773','Camión Caex 777','Traslado Perforadora','Traslado Palas','Camión Extracción CAT 785C','Camión Caex 789','Camión Fábrica','Camión Polvorín','Camión Sonda','Camión Frontal CAT 992G','Camión Frontal CAT 994F','Excavadora Balde/Pica Roca','Excavadoras PC 5500','Manipulador De Neumáticos CF','Manipulador De Neumáticos GH','Motoniveladora CAT 16M','Sonda','Tractor De Orugas','Tractor De Ruedas','Tapapozos','Wheeldozer CAT 834G','Cargador WA900','Camión Aljibe KOM 785 HD-7','Welldozer WD900'
  ]},
  // Certificado Examen Práctico
  { doc: 'Certificado Examen Práctico', acts: [
    'Camión Extracción KOM 830E-1','Buses','Camión Ampliroll','Camión Articulado Dumper','Camión Aspirador Alto Vacio','Camión Fosero','Camión Pluma Y Grua Pluma','Cargador Frontal Otras Marcas','Grúa Horquilla','Grúa Móvil','Manipulador Telescópico','Minicargador','Perforadora MD6240','Perforadora DM50','Perforadora D755K','Perforadora DMM2','Retroexcavadoras','Rodillo','Grúa Pluma Solo Grúa','Grúa Puente','Martillo Pica Roca','Rotopala / Spreader','Camión Aljibe CAT 773E','Camión Combustible','Excavadora Balde/Pica Roca','Alzahombre','Espacios Confinados','Ambulancia','Perfolodos WS 1400','Camión Ácido','Tracto Camión','Camión Catodos','Camión 3/4','Camión Hidrolavador','Camión Pluma Solo Camión','Camión Tolva','Camión Rampla (plano)','Camión Rotainer','Camión Desobstructor','Camioneta Combustible','Camioneta Triple Cabina','Furgon','Minibus','Camión De Sevicio','Cama Baja Mack','Camión Lubricador','Camioneta Polvorinera','Camioneta Rescate/Emergencia','Vehículo Liviano','Camión Caex 773','Camión Caex 777','Traslado Perforadora','Traslado Palas','Camión Extracción CAT 785C','Camión Caex 789','Camión Fábrica','Camión Polvorín','Camión Sonda','Camión Frontal CAT 992G','Camión Frontal CAT 994F','Excavadora Balde/Pica Roca','Excavadoras PC 5500','Manipulador De Neumáticos CF','Manipulador De Neumáticos GH','Motoniveladora CAT 16M','Sonda','Tractor De Orugas','Tractor De Ruedas','Tapapozos','Wheeldozer CAT 834G','Cargador WA900','Camión Aljibe KOM 785 HD-7','Welldozer WD900'
  ]},
  // Hoja de vida conductor
  { doc: 'Hoja de vida conductor', acts: [
    'Camión Extracción KOM 830E-1','Buses','Camión Ampliroll','Camión Articulado Dumper','Camión Aspirador Alto Vacio','Camión Fosero','Camión Pluma Y Grua Pluma','Cargador Frontal Otras Marcas','Grúa Horquilla','Grúa Móvil','Manipulador Telescópico','Minicargador','Perforadora MD6240','Perforadora DM50','Perforadora D755K','Perforadora DMM2','Retroexcavadoras','Rodillo','Grúa Pluma Solo Grúa','Grúa Puente','Martillo Pica Roca','Rotopala / Spreader','Camión Aljibe CAT 773E','Camión Combustible','Excavadora Balde/Pica Roca','Ambulancia','Perfolodos WS 1400','Camión Ácido','Tracto Camión','Camión Catodos','Camión 3/4','Camión Hidrolavador','Camión Pluma Solo Camión','Camión Tolva','Camión Rampla (plano)','Camión Rotainer','Camión Desobstructor','Camioneta Combustible','Camioneta Triple Cabina','Furgon','Minibus','Camión De Sevicio','Cama Baja Mack','Camión Lubricador','Camioneta Polvorinera','Camioneta Rescate/Emergencia','Vehículo Liviano','Camión Caex 773','Camión Caex 777','Traslado Perforadora','Traslado Palas','Camión Extracción CAT 785C','Camión Caex 789','Camión Fábrica','Camión Polvorín','Camión Sonda','Camión Frontal CAT 992G','Camión Frontal CAT 994F','Excavadora Balde/Pica Roca','Excavadoras PC 5500','Manipulador De Neumáticos CF','Manipulador De Neumáticos GH','Motoniveladora CAT 16M','Sonda','Tractor De Orugas','Tractor De Ruedas','Tapapozos','Wheeldozer CAT 834G','Cargador WA900'
  ]},
  // Puedes seguir agregando más relaciones aquí según el markdown
];

async function main() {
  for (const rel of relations) {
    const documentation = await prisma.documentation.findUnique({ where: { name: rel.doc } });
    if (!documentation) continue;
    for (const actName of rel.acts) {
      const activity = await prisma.activity.findUnique({ where: { name: actName } });
      if (!activity) continue;
      // Buscar nota específica para la combinación actividad-documentación
      let notes = '';
      if (activityDocumentationNotes[actName] && activityDocumentationNotes[actName][rel.doc]) {
        notes = activityDocumentationNotes[actName][rel.doc];
      }
      await prisma.activityDocumentation.upsert({
        where: {
          activityId_documentationId: {
            activityId: activity.id,
            documentationId: documentation.id,
          },
        },
        update: {
          notes,
        },
        create: {
          activityId: activity.id,
          documentationId: documentation.id,
          quantity: 1,
          isSpecific: true,
          notes,
        },
      });
    }
  }
  console.log('Relaciones actividad-documentación insertadas con notas');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
