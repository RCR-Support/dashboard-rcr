import { describe, expect, it } from 'vitest';
import {
  getRequiredApplicationDocuments,
  validateApplicationDocumentCoverage,
  type ActivityDocumentRules,
} from '@/lib/applications/document-requirements';

const vehicleActivity: ActivityDocumentRules = {
  id: 'vehicle',
  requiredDocumentations: [],
  zoneDocumentations: [{
    zoneId: 'red-zone',
    zone: { name: 'Roja' },
    documentation: { id: 'red-permit', name: 'Autorización Zona Roja' },
  }],
};

const ambulanceActivity: ActivityDocumentRules = {
  id: 'ambulance',
  requiredDocumentations: [],
  zoneDocumentations: [],
};

describe('documentos condicionales por zona', () => {
  it('requiere el documento de Vehículo Liviano al seleccionar Zona Roja', () => {
    const required = getRequiredApplicationDocuments([vehicleActivity], ['red-zone']);
    expect(required.get('vehicle:red-permit')).toContain('Autorización Zona Roja');
  });

  it('no requiere el documento si no se selecciona la zona configurada', () => {
    const required = getRequiredApplicationDocuments([vehicleActivity], ['green-zone']);
    expect(required.size).toBe(0);
  });

  it('no activa requisitos para una actividad distinta', () => {
    const required = getRequiredApplicationDocuments([ambulanceActivity], ['red-zone']);
    expect(required.size).toBe(0);
  });

  it('solicita un solo archivo si varias zonas configuran el mismo documento para la actividad', () => {
    const activity: ActivityDocumentRules = {
      ...vehicleActivity,
      zoneDocumentations: [
        ...vehicleActivity.zoneDocumentations,
        { ...vehicleActivity.zoneDocumentations[0], zoneId: 'restricted-yard', zone: { name: 'Patio restringido' } },
      ],
    };
    const required = getRequiredApplicationDocuments([activity], ['red-zone', 'restricted-yard']);
    expect(required.size).toBe(1);
  });

  it('permite una carga valida y rechaza omisiones', () => {
    const required = getRequiredApplicationDocuments([vehicleActivity], ['red-zone']);
    expect(validateApplicationDocumentCoverage(required, [{
      documentationId: 'red-permit',
      activityId: 'vehicle',
      url: 'https://files.example/red-permit.pdf',
    }])).toBeNull();
    expect(validateApplicationDocumentCoverage(required, [])).toContain('Faltan documentos obligatorios');
  });

  it('rechaza documentos que no corresponden a la actividad y zona enviadas', () => {
    const required = getRequiredApplicationDocuments([vehicleActivity], []);
    expect(validateApplicationDocumentCoverage(required, [{
      documentationId: 'red-permit',
      activityId: 'vehicle',
      url: 'https://files.example/red-permit.pdf',
    }])).toContain('no corresponden');
  });
});
