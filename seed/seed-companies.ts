/**
 * Seed de empresas importadas desde la base de datos original (phpMyAdmin / Laravel 2015).
 * Solo se requiere nombre (Razón Social) y RUT.
 *
 * Ejecución:
 *   npx ts-node --project seed/tsconfig.json seed/seed-companies.ts
 */

import { db } from '../lib/db';

interface SeedCompany {
  name: string;
  rut: string;
}

// ─── Empresas importadas desde BD original (Laravel 2015) ───────────────────
const companies: SeedCompany[] = [
  { name: 'Ingeniería Civil Vicente S.A.', rut: '93.546.000-k' },
  { name: 'Carcamo y Clunes Gestion de Riesgos', rut: '76.748.589-1' },
  { name: 'Guiñez', rut: '78.152.850-1' },
  { name: 'Enaex', rut: '76.041.871-4' },
  { name: 'EPSA', rut: '96.773.060-2' },
  { name: 'VIGGO', rut: '76.642.320-5' },
  { name: 'AMECO CHILE SA', rut: '96.862.140-8' },
  { name: 'VMS Chile SA.', rut: '78.794.180-K' },
  { name: 'Reveco & Schiaffo', rut: '76.259.779-9' },
  { name: 'Schwager', rut: '76.145.047-6' },
  { name: 'RV Conveyor', rut: '76.746.848-2' },
  { name: 'FAM América Latina Maquinarias Ltda.', rut: '77.683.790-3' },
  { name: 'Soc. Zuñiga e Hijos Ltda.', rut: '76.241.154-7' },
  { name: 'CSI LTDA', rut: '85.840.100-3' },
  { name: 'COPEC', rut: '99.520.000-7' },
  { name: 'M.Asmeco', rut: '76.077.051-5' },
  { name: 'BAILAC', rut: '77.247.050-9' },
  { name: 'Capstone Copper Geo', rut: '77.418.580-1' },
  { name: 'ESACHS', rut: '99.579.260-5' },
  { name: 'VECCHIOLA S.A.', rut: '87.049.000-3' },
  { name: 'ATLAS COPCO', rut: '76.783.709-7' },
  { name: 'ELECCON', rut: '99.576.460-1' },
  { name: 'ELECMAS', rut: '76.224.524-8' },
  { name: 'VERASAY (Acido)', rut: '76.303.840-8' },
  { name: 'Ingelcop Ltda', rut: '78.396.050-8' },
  { name: 'INNOVATRONIC', rut: '52.000.043-7' },
  { name: 'TECPROMIN', rut: '89.895.100-6' },
  { name: 'SUEZ', rut: '77.441.870-9' },
  { name: 'ECOCIL', rut: '76.015.444-K' },
  { name: 'SODEXO', rut: '96.550.960-7' },
  { name: 'Transportes Hurcam', rut: '52.003.032-8' },
  { name: 'Miscelanea', rut: '11.111.111-1' },
  { name: 'ZARGO', rut: '76.262.234-3' },
  { name: 'Terraservice', rut: '96.755.590-8' },
  { name: 'G4S', rut: '96.912.870-5' },
  { name: 'Geoassay', rut: '76.040.561-2' },
  { name: 'Ciencia Ambiental', rut: '76.019.465-4' },
  { name: 'Komatsu Cummins Chile Ltda.', rut: '77.260.520-K' },
  { name: 'Ambiental y Sectorial', rut: '76.617.829-4' },
  { name: 'ELECTRORAM', rut: '76.025.110-0' },
  { name: 'COMPROBE', rut: '78.951.730-4' },
  { name: 'FINNING CHILE', rut: '91.489.000-4' },
  { name: 'Mantoverde Proyecto de Desarrollo', rut: '21.212-1' },
  { name: 'KUPFER', rut: '90.844.000-5' },
  { name: 'TRANSJHURTADO SPA', rut: '76.107.863-1' },
  { name: 'Wilson Carrizo Reciclaje EIRL', rut: '77.071.385-4' },
  { name: 'SOC. SERV. MESUT SPA', rut: '76.215.152-9' },
  { name: 'KOMATSU', rut: '95.616.000-6' },
  { name: 'GRUAS RIVADENEIRA', rut: '76.233.985-4' },
  { name: 'Gruas ByC', rut: '76.146.887-1' },
  { name: 'PROANORTE', rut: '76.455.577-5' },
  { name: 'Turismo Rojas', rut: '8.359.876-K' },
  { name: 'IMA Industrial SpA', rut: '88.689.100-8' },
  { name: 'RESITER', rut: '89.696.400-3' },
  { name: 'EMME CONSTRUCCIONES SPA', rut: '78.076.801-0' },
  { name: 'TRANSMAT', rut: '76.270.521-4' },
  { name: 'Llorente Industrial S.A.', rut: '81.426.700-8' },
  { name: 'DINTEC CHILE', rut: '77.095.293-K' },
  { name: 'RENEL', rut: '15.030.307-0' },
  { name: 'TRANSCOM', rut: '79.904.920-1' },
  { name: 'DYNO NOBEL', rut: '76.040.923-5' },
  { name: 'VIGAL', rut: '96.849.540-2' },
  { name: 'Transmaq E.I.R.L.', rut: '76.184.224-2' },
  { name: 'KYNDRYL', rut: '17.120.652-9' },
  { name: 'MM PROJECTS', rut: '76.226.094-8' },
  { name: 'TEASCHILE LIMITADA', rut: '76.215.052-2' },
  { name: 'C y D Ingenieria', rut: '88.359.600-5' },
  { name: 'ACHS', rut: '70.360.100-6' },
  { name: 'AZA', rut: '92.176.000-0' },
  { name: 'ICMAS SPA', rut: '76.696.393-5' },
  { name: 'ESC SERVICIOS', rut: '76.956.630-9' },
  { name: 'TRANSVERDE', rut: '76.499.730-1' },
  { name: 'TRANSPORTES CARMAR LTDA', rut: '78510360-2' },
  { name: 'MDM TRANSPORTES Y GRUAS', rut: '76.001.251-3' },
  { name: 'ALUVIAL', rut: '76.365.203-3' },
  { name: 'CESMEC S.A', rut: '81.185.000-4' },
  { name: 'MGDL SpA', rut: '76.351.549-4' },
  { name: 'SOCIEDAD ZUÑIGA E HIJOS SPA', rut: '77.711.419-0' },
  { name: 'SEBASTIAN FRANCISCO PEDREROS MONCADA INGENIERIA, CONSULTORA, INMOBILIARIA Y COMERCIALIZADORA E.I.R.L.', rut: '76.050.187-5' },
  { name: 'TRANSPORTES INFINITY', rut: '76.207.531-8' },
  { name: 'Komatsu Chile S.A', rut: '96.843.130-7' },
  { name: 'WILUG MINERIA', rut: '77.183.916-9' },
  { name: 'Atacama Tech SpA', rut: '76.300.628-k' },
  { name: 'Distribuidora Cummins Chile S.A.', rut: '96.843.140-4' },
  { name: 'ORPAK', rut: '76.309.298-4' },
  { name: 'EVH Ingeniería', rut: '52.004.641-0' },
  { name: 'ELECTROFRIO LTDA', rut: '77.651.450-6' },
  { name: 'MAXAM Chile S.A.', rut: '77.870.140-5' },
  { name: 'SERMINCHO', rut: '76.231.611-0' },
  { name: 'INVERSIONES TRT SPA.', rut: '77.677.109-0' },
  { name: 'Mantoverde S.A.', rut: '77020457-7' },
  { name: 'JOY GLOBAL S.A.', rut: '96.616.000-6' },
  { name: 'SERVISOLD INDUSTRIAL', rut: '76.399.112-2' },
  { name: 'JRVA', rut: '77.421.442-9' },
  { name: 'ID CHILE SERVICIOS SPA', rut: '76.738.857-8' },
  { name: 'MINTRAL', rut: '77.554.545-3' },
  { name: 'SERLOG', rut: '96566940-k' },
  { name: 'RESTEC', rut: '77.683.300-2' },
  { name: 'EBL Servicios Industriales Integrales Limitada', rut: '76.048.531-4' },
  { name: 'TUSAN', rut: '86.386.700-2' },
  { name: 'JCM Ingenieria', rut: '76.005.567-0' },
  { name: 'NEXXO S.A.', rut: '86.968.900-9' },
  { name: 'FTF SERVICIOS S.A.', rut: '76.201.397-5' },
  { name: 'BYF', rut: '76.823.557-0' },
  { name: 'ZGA Spa', rut: '77.074.607-8' },
  { name: 'GEOLAQUIM', rut: '76.835.020-5' },
  { name: 'Servicios Integrales y Operacionales Olivares SpA', rut: '77.140.505-3' },
  { name: 'SEUR TRANSPORTES SPA', rut: '76771509-9' },
  { name: 'COMERCIAL AGRICOLA Y TRANSPORTES TOLEDO GIANZO Y CIA. LTDA.', rut: '76103845-1' },
  { name: 'R&Q INGENIERIA', rut: '84.865.000-5' },
  { name: 'TRICONOS MINEROS', rut: '96.961.460-K' },
  { name: 'RENEL INGENIERIA', rut: '15.030.307-9' },
  { name: 'INGEVAL', rut: '76.736.672-8' },
  { name: 'SRM PUENTE GRUA', rut: '76.774.737-3' },
  { name: 'SGS Minerals S.A', rut: '98.801.810-8' },
  { name: 'PACKMATIC', rut: '76.072.205-7' },
  { name: 'Transportes Bello', rut: '88.397.100-0' },
  { name: 'CAPSTONE COPPER', rut: '77.233.325-0' },
  { name: 'KNIGHT PIESOLD', rut: '96.680.350-9' },
  { name: 'HUALPEN', rut: '76.750.560-4' },
  { name: 'AGUNSA', rut: '96.566.940-K' },
  { name: 'PREIN CHILE', rut: '77.764.140-9' },
  { name: 'TRES60', rut: '18.747.515-5' },
  { name: 'Mutual de Seguridad Asesorías S.A', rut: '96.783.880-2' },
  { name: 'WORLD SURVEY SERVICES S.A.', rut: '96.947.280-5' },
  { name: 'Guillermo Lagos Fuentes', rut: '8.035.316-2' },
  { name: 'SUAC SOLUTIONS SpA', rut: '76.865.368-2' },
  { name: 'KAESER COMPRESORES DE CHILE SPA', rut: '77.152.830-9' },
  { name: 'HEXAGON MINING LTDA.', rut: '76.015.699-k' },
  { name: 'PROMET SERVICIOS SPA', rut: '96.853.940-k' },
  { name: 'INACAL SA', rut: '76.115.484-2' },
  { name: 'Autorentas del Pacifico SPA', rut: '83.547.100-4' },
  { name: 'Recon Drilling', rut: '77.634.636-5' },
  { name: 'AUSENCO CHILE LTDA', rut: '78.727.440-4' },
  { name: 'Russell Mineral Equipment S.A', rut: '99.572.320-4' },
  { name: 'Superex S.A', rut: '11.669.178-7' },
  { name: 'IMH Solutyons', rut: '77.083.885-1' },
  { name: 'INCOVALL', rut: '76.511.747-K' },
  { name: 'Soluciones ambientales del norte S.A.', rut: '76.849.990-k' },
  { name: 'SOCIEDAD TRANSPORTES E INVERSIONES VINARA LTDA', rut: '76.324.888-7' },
  { name: 'Hidroatacama', rut: '76.227.065-k' },
  { name: 'Konecranes Chile SpA', rut: '76.126.252-1' },
  { name: 'TCON CHILE LTDA', rut: '76.638.375-0' },
  { name: 'LINKPROJECTS', rut: '96.858.730-7' },
  { name: 'Metxxo Chile Ltda', rut: '76.591.074-9' },
  { name: 'ACM INGENIERIA INDUSTRIAL Y CLIMATIZACION SPA', rut: '76.466.825-0' },
  { name: 'ZEPEDA Y VECCIOLA Y CIA. LTDA.', rut: '78.560.030-4' },
  { name: 'GEODETEC INGENIERIA SPA', rut: '76.872.320-6' },
  { name: 'Ingeniería y Servicios Julio Arancibia Ramos E.I.R.L.', rut: '76.177.333-K' },
  { name: 'KATECS Y COMPAÑÍA SPA', rut: '76.267.420-3' },
  { name: 'FLSMIDTH MINERALS S.A.', rut: '89664200-6' },
  { name: 'Tec-ionic Durban S.A', rut: '76.109.374-6' },
  { name: 'PROYECTOS Y SUMINISTRO INDUSTRIALES LTDA.', rut: '76.402.535-0' },
  { name: 'RID INGENIERIA SPA', rut: '77.744.755-6' },
  { name: 'AGQ LABS', rut: '96.964.370-7' },
  { name: 'Asistec SA', rut: '78.192.120-3' },
  { name: 'SANTO DOMINGO', rut: '1.111.111-1' },
  { name: 'Vardor SPA', rut: '77.906.689-4' },
  { name: 'Inverex', rut: '78.403.920-k' },
  { name: 'Enoc Ingenieria SpA', rut: '77.806.282-8' },
  { name: 'INSPECCION Y CERTIFICACION BBF LTDA', rut: '76.428.790-8' },
  { name: 'SISTEMA DE TRANSMISIÓN DEL NORTE S.A.', rut: '76.410.374-2' },
  { name: 'VALTECK', rut: '76.591.503-1' },
  { name: 'Water Minerals Ingenieria SPA', rut: '77.494.555-5' },
  { name: 'JVOLT', rut: '76.791.016-9' },
  { name: 'NORTHTEK INGENIERIA LIMITADA', rut: '76.696.269-6' },
  { name: 'Inamar Izaje SpA', rut: '92.975.000-4' },
  { name: 'VOLTTA INGENIERIA ELECTRICA SPA', rut: '76.233.999-4' },
  { name: 'LUIS HUMBERTO ALBORNOZ PERALTA TRANSPORTE SPA', rut: '78.030.655-6' },
  { name: 'SERVIALL SOCIEDAD ANONIMA', rut: '76.035.324-8' },
  { name: 'TRANSPORTES SANTA MARIA', rut: '79.705.390-2' },
  { name: 'Precisión Servicio SpA', rut: '96.525.710-1' },
  { name: 'MACEP LTDA', rut: '76.191.470-7' },
  { name: 'IT TRANSPORTES S.A.', rut: '76.091.703-6' },
  { name: 'Servicios Mineros Tecnipak Ltda', rut: '76.266.409-7' },
  { name: 'Linde Gas Chile S.A.', rut: '90.100.000-k' },
  { name: 'MINERAL DRILLING SPA', rut: '76.128.865-2' },
  { name: 'Moinco ingeniería Spa', rut: '77.789.862-0' },
  { name: 'OH INVERSIONES Y SERVICIOS SpA', rut: '76.543.658-3' },
  { name: 'GOHE INVERSIONES SPA', rut: '77.196.779-5' },
  { name: 'Fundición Talleres Ltda', rut: '99.532.410-5' },
  { name: 'SERPRAM', rut: '96.799.790-0' },
  { name: 'FRANCISCO CAYO ALVINO', rut: '8.468.228-4' },
  { name: 'ASITEL', rut: '16.109.130-8' },
  { name: 'Constructora Precon S.A', rut: '93.740.000-4' },
  { name: 'Sociedad Comercial Rodrigo Urbano SPA', rut: '76.920.615-9' },
  { name: 'Climbers SPA', rut: '76.438.121-1' },
  { name: 'Ingeniería de Protección SpA', rut: '89.722.200-0' },
  { name: 'Cbb Cales S.A', rut: '96.718.010-6' },
  { name: 'Geosinergia Ingeniería y Medio Ambiente Ltda', rut: '77.836.810-2' },
  { name: 'Punto y Red Eirl', rut: '77.290.344-8' },
  { name: 'Transportes Ilzauspe', rut: '78.782.700-4' },
  { name: 'Mantoverde Proyectos', rut: '88.888-5' },
  { name: 'SIMPLEX TECNOLOGIA Y SERVICIOS SPA', rut: '76.528.807-K' },
  { name: 'NORTELAB SPA', rut: '76.552.532-2' },
  { name: 'Tecnasic', rut: '96.917.120-1' },
  { name: 'JEJ INGENIERIA S.A', rut: '78.318.570-9' },
  { name: 'Turismo Rojas Atacama', rut: '76.082.190-K' },
  { name: 'Sick SpA', rut: '85.572.900-8' },
  { name: 'KDM INDUSTRIAL S.A', rut: '76.117.512-2' },
  { name: 'Metso Outotec Chile Spa', rut: '93.077.000-0' },
  { name: 'Transportes y Servicios spa (Transportes Trigo)', rut: '76.904.504-K' },
  { name: 'CBS Industrial', rut: '76.188.317-8' },
  { name: 'ASESORIA MINERA GEOASSAY SPA', rut: '77.945.779-6' },
  { name: 'JCC EIRL', rut: '76.031.305-k' },
  { name: 'SCAF LOGISTICA S.A', rut: '76.727.690-7' },
  { name: 'RAL GRAFICA INDUSTRIAL', rut: '17.364.686-0' },
  { name: 'Mansielec', rut: '76.806.277-3' },
  { name: 'Recauchajes Atlas Ltda.', rut: '84.135.500-3' },
  { name: 'TRANSPORTES ABEL DIAZ SILVA', rut: '19462363-1' },
  { name: 'EMMAIN', rut: '78.186.320-3' },
  { name: 'TRANSPORTES GONZALEZ E HIJOS LIMITADA', rut: '76.374.411-6' },
  { name: 'SOCIEDAD COMERCIAL CRISTIAN JIMENEZ Y COMPAÑIA LIMITADA', rut: '76.002.189-k' },
  { name: 'JUAN PABLO ORTEGA FERNANDEZ', rut: '9907136-2' },
  { name: 'LUIS CORNEJO', rut: '13915809-1' },
  { name: 'SOCIEDAD DE TRANSPORTE MABECO LIMITADA', rut: '76890745-5' },
  { name: 'TRANSPORTES RIO TRUCKS CARGO LTDA', rut: '76755137-1' },
  { name: 'TRANSPORTE SERVICIOS Y VENTA DE INSUMOS SEPULVEDA SPA', rut: '77.243.364-6' },
  { name: 'TRUCK SERVICE SPA', rut: '77219639-3' },
  { name: 'Machine Monitoring SpA', rut: '76.485.922-7' },
  { name: 'PRECISION AUTOMATION SpA', rut: '81217800-8' },
  { name: 'SIOM SPA', rut: '76.090.717-0' },
  { name: 'HINTEK SPA', rut: '76.178.615-6' },
  { name: 'INGENIERÍA Y SERVICIOS SPA', rut: '78.283.504-1' },
  { name: 'SONDA S.A.', rut: '83.628.100-4' },
  { name: 'AVA MONTAJES', rut: '76.214.280-5' },
  { name: 'ZAMINE SERVICE CHILE SPA', rut: '76377755-3' },
  { name: 'Inversiones Pedro Arredondo Vidal SPA', rut: '76.495.708-3' },
  { name: 'PRAMAX', rut: '78902530-4' },
  { name: 'SANYTRANS BUSES LTDA', rut: '76.349.997-9' },
  { name: 'ANAKENA GROUP SPA', rut: '52.003.237-1' },
  { name: 'Araya Hermanos S.A', rut: '78567810-9' },
  { name: 'Master Tec Services Ltda.', rut: '76.769.053-3' },
];
// ─────────────────────────────────────────────────────────────────────────────

async function seedCompanies() {
  console.log('🏢 Iniciando seed de empresas...\n');

  let created = 0;
  let skipped = 0;
  let errors = 0;

  for (const company of companies) {
    const rut = company.rut.trim();
    try {
      const existing = await db.company.findUnique({
        where: { rut },
      });

      if (existing) {
        console.log(`  ⏭  Omitida (ya existe): ${company.name} [${rut}]`);
        skipped++;
        continue;
      }

      await db.company.create({
        data: {
          name: company.name,
          rut,
          status: true,
        },
      });

      console.log(`  ✅ Creada: ${company.name} [${rut}]`);
      created++;
    } catch (error) {
      console.error(`  ❌ Error con ${company.name} [${company.rut.trim()}]:`, error);
      errors++;
    }
  }

  console.log(`
────────────────────────────────
  Total procesadas : ${companies.length}
  Creadas          : ${created}
  Omitidas         : ${skipped}
  Errores          : ${errors}
────────────────────────────────`);
}

seedCompanies()
  .catch(console.error)
  .finally(() => db.$disconnect());
