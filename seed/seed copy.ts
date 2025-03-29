import { PrismaClient } from '@prisma/client';
import bcryptjs from 'bcryptjs';

const db = new PrismaClient();

interface SeedUser {
    name: string;
    middleName?: string;
    lastName: string;
    secondLastName?: string;
    userName: string;
    displayName: string;
    email: string;
    run: string;
    phoneNumber: string;
    category: string;
    deletedLogic: boolean;
    password: string;
    image?: string;
    roles: ValidRoles[];
    companyId: string;
}


interface SeedCompany {
    name: string;
    rut: string;
    phone: string;
}

interface SeedData {
    users: SeedUser[];
    companies: SeedCompany[];
}
type ValidRoles = 'admin' | 'sheq' | 'adminContractor' | 'user' | 'credential';
export const initialData: SeedData = {
    users: [
        {
            name: 'Héctor',
            middleName: 'Javier',
            lastName: 'Matcovich',
            secondLastName: 'González',
            userName: 'H Matcovich G',
            displayName: 'Héctor Matcovich',
            email: 'matcovich@gmail.com'.toLocaleLowerCase(),
            run: '12345678-9',
            phoneNumber: '+56912345678',
            category: 'Category1',
            deletedLogic: false,
            password: bcryptjs.hashSync('123456', 10),
            image: 'path/to/image1.jpg',
            roles: ['admin'],
            companyId: 'cm7p8ogxg0009vdjk6gcp0h2r', // Se establecerá más adelante
        },
        {
            name: 'Rodrigo',
            middleName: 'Andres',
            lastName: 'Larenas',
            secondLastName: 'Matcovich',
            userName: 'Rodrigo Larenas Matcovich',
            displayName: 'Rodrigo Larenas',
            email: 'rodrigo.larenas@rcrsupport.cl'.toLocaleLowerCase(),
            run: '12345678-9',
            phoneNumber: '+56912345678',
            category: 'Category1',
            deletedLogic: false,
            password: bcryptjs.hashSync('123456', 10),
            image: 'path/to/image1.jpg',
            roles: ['admin'],
            companyId: 'cm7p8ogxg0009vdjk6gcp0h2r', // Se establecerá más adelante
        },
        {
            name: 'Sheq',
            middleName: '',
            lastName: 'Prueba',
            secondLastName: '',
            userName: 'sheq de prueba',
            displayName: 'Sheq de prueba',
            email: 'sheq@correo.com'.toLocaleLowerCase(),
            run: '87654321-0',
            phoneNumber: '+56987654321',
            category: 'Category2',
            deletedLogic: false,
            password: bcryptjs.hashSync('123456', 10),
            image: 'path/to/image2.jpg',
            roles: ['sheq'],
            companyId: 'cm7p8ogxg0009vdjk6gcp0h2r', // Se establecerá más adelante
        },
        {
            name: 'Admin Contrato',
            middleName: '',
            lastName: 'Prueba',
            secondLastName: '',
            userName: 'adminContrato de prueba',
            displayName: 'Admin Contrato de prueba',
            email: 'adminContrato@correo.com'.toLocaleLowerCase(),
            run: '11223344-5',
            phoneNumber: '+56911223344',
            category: 'Category3',
            deletedLogic: false,
            password: bcryptjs.hashSync('123456', 10),
            image: 'path/to/image3.jpg',
            roles: ['adminContractor'],
            companyId: 'cm7p8ogxg0009vdjk6gcp0h2r', // Se establecerá más adelante
        },
        {
            name: 'Usuario',
            middleName: '',
            lastName: 'Prueba',
            secondLastName: '',
            userName: 'usuario de prueba',
            displayName: 'Usuario de prueba',
            email: 'usuario@correo.com'.toLocaleLowerCase(),
            run: '55667788-9',
            phoneNumber: '+56955667788',
            category: 'Category4',
            deletedLogic: false,
            password: bcryptjs.hashSync('123456', 10),
            image: 'path/to/image4.jpg',
            roles: ['user'],
            companyId: 'cm7p8ogxg0009vdjk6gcp0h2r', // Se establecerá más adelante
        },
        {
            name: 'Imprimir',
            middleName: '',
            lastName: 'Prueba',
            secondLastName: '',
            userName: 'Imprimir de prueba',
            displayName: 'Imprimir de prueba',
            email: 'credencial@correo.com'.toLocaleLowerCase(),
            run: '99887766-5',
            phoneNumber: '+56998877665',
            category: 'Category5',
            deletedLogic: false,
            password: bcryptjs.hashSync('123456', 10),
            image: 'path/to/image5.jpg',
            roles: ['credential'],
            companyId: 'cm7p8ogxg0009vdjk6gcp0h2r', // Se establecerá más adelante
        }
    ],
    companies: [
        { name: 'RCR-Support', rut: '76.101.552-4', phone: '(094) 595-7595' },
        { name: 'Capstone Copper', rut: '77.418.580-1', phone: '(000) 000-0000' },
        { name: 'Ingeniería Civil Vicente S.A.', rut: '93.546.000-k', phone: '(022) 209-0137' },
        { name: 'Carcamo y Clunes Gestion de Riesgos', rut: '76.748.589-1', phone: '(097) 779-0642' },
        { name: 'Guiñez', rut: '78.152.850-1', phone: '(099) 324-5650' },
        // { name: 'MANTOS COPPER PLANTA', rut: '77.418.580-1', phone: '(999) 999-9999' },
        { name: 'Enaex', rut: '76.041.871-4', phone: '(976) 041-8714' },
        { name: 'EPSA', rut: '96.773.060-2', phone: '(099) 609-2847' },
        { name: 'VIGGO', rut: '76.642.320-5', phone: '(995) 342-9628' },
        { name: 'AMECO CHILE SA', rut: '96.862.140-8', phone: '(052) 220-4423' },
        { name: 'VMS Chile SA.', rut: '78.794.180-K', phone: '(055) 256-3971' },
        { name: 'Reveco & Schiaffo', rut: '76.259.779-9', phone: '(569) 902-0168' },
        { name: 'Schwager', rut: '76.145.047-6', phone: '(569) 220-5535' },
        { name: 'RV Conveyor', rut: '76.746.848-2', phone: '(569) 542-3831' },
        { name: 'FAM América Latina Maquinarias Ltda.', rut: '77.683.790-3', phone: '(562) 291-2300' },
        // { name: 'Soc. Zuñiga e Hijos Ltda.', rut: '76.241.154-7', phone: '(996) 155-0961' },
        // { name: 'CSI LTDA', rut: '85.840.100-3', phone: '(569) 666-9213' },
        // // { name: 'AMECO PLANTA', rut: '96.862.140-8', phone: '(569) 614-9742' },
        // { name: 'COPEC', rut: '99.520.000-7', phone: '(052) 220-4429' },
        // { name: 'M.Asmeco', rut: '76.077.051-5', phone: '(999) 070-5579' },
        // { name: 'BAILAC', rut: '77.247.050-9', phone: '(052) 220-4468' },
        // // { name: 'Capstone Copper Geo', rut: '77.418.580-1', phone: '(121) 212-1212' },
        // { name: 'ESACHS', rut: '99.579.260-5', phone: '(052) 220-4434' },
        // { name: 'VECCHIOLA S.A.', rut: '87.049.000-3', phone: '(569) 534-6950' },
        // { name: 'Staff de Mantoverde S.A', rut: '77.020.457-7', phone: '(522) 220-4232' },
        // { name: 'ATLAS COPCO', rut: '76.783.709-7', phone: '(569) 840-9703' },
        // { name: 'ELECCON', rut: '99.576.460-1', phone: '(111) 111-1111' },
        // { name: 'ELECMAS', rut: '76.224.524-8', phone: '(569) 68111747' },
        // { name: 'VERASAY (Acido)', rut: '76.303.840-8', phone: '(111) 111-1111' },
        // { name: 'VERASAY (Prod. Terminado)', rut: '76.303.840-8', phone: '(111) 111-1111' },
        // { name: 'Ingelcop Ltda', rut: '78.396.050-8', phone: '(569) 412-4374' },
        // { name: 'INNOVATRONIC', rut: '52.000.043-7', phone: '(055) 269-3042' },
        // { name: 'TECPROMIN', rut: '89.895.100-6', phone: '(222) 873-3639' },
        // { name: 'SUEZ', rut: '77.441.870-9', phone: '(111) 111-1111' },
        // { name: 'ECOCIL', rut: '76.015.444-K', phone: '(111) 111-1111' },
        // { name: 'SODEXO', rut: '96.550.960-7', phone: '(111) 111-1111' },
        // { name: 'Transportes Hurcam', rut: '52.003.032-8', phone: '(111) 111-1111' },
        // //{ name: 'Miscelanea', rut: '11.111.111-1', phone: '(111) 111-1111' },
        // { name: 'ZARGO', rut: '76.262.234-3', phone: '(052) 846-4910' },
        // { name: 'Terraservice', rut: '96.755.590-8', phone: '(111) 111-1111' },
        // { name: 'G4S', rut: '96.912.870-5', phone: '(052) 220-4254' },
        // { name: 'Sociedad de Servicios MESUT', rut: '76.215.152-9', phone: '(052) 220-4429' },
        // { name: 'Geoassay', rut: '76.040.561-2', phone: '(111) 111-1111' },
        // { name: 'LLORENTE', rut: '81.426.700-8', phone: '(111) 111-1111' },
        // { name: 'Ciencia Ambiental', rut: '76.019.465-4', phone: '(111) 111-1111' },
        // { name: 'Komatsu Cummins Chile Ltda.', rut: '77.260.520-K', phone: '(052) 220-4423' },
        // //{ name: 'nombre', rut: '11.111.111-1', phone: '(111) 111-1111' },
        // { name: 'Ambiental y Sectorial', rut: '76.617.829-4', phone: '(111) 111-1111' },
        // { name: 'ELECTRORAM', rut: '76.025.110-0', phone: '(111) 111-1111' },
        // { name: 'COMPROBE', rut: '78.951.730-4', phone: '(111) 111-1111' },
        // { name: 'FINNING CHILE', rut: '91.489.000-4', phone: '(229) 277-0000' },
        // //{ name: 'Mantoverde S.A', rut: '77.020.457-7', phone: '(111) 111-1111' },
        // { name: 'Mantoverde Proyecto de Desarrollo', rut: '21.212-1', phone: '(111) 111-1111' },
        // { name: 'KUPFER', rut: '90.844.000-5', phone: '(111) 111-1111' },
        // { name: 'TRANSJHURTADO SPA', rut: '76.107.863-1', phone: '(111) 111-1111' },
        // { name: 'Wilson Carrizo Reciclaje EIRL', rut: '77.071.385-4', phone: '(111) 111-1111' },
        // // { name: 'SOC. SERV. MESUT SPA', rut: '76.215.152-9', phone: '(052) 240-4423' },
        // { name: 'KOMATSU', rut: '95.616.000-6', phone: '(111) 111-1111' },
        // { name: 'GRUAS RIVADENEIRA', rut: '76.233.985-4', phone: '(111) 111-1111' },
        // { name: 'Gruas ByC', rut: '76.146.887-1', phone: '(111) 111-1111' },
        // { name: 'PROANORTE', rut: '76.455.577-5', phone: '(111) 111-1111' },
        // { name: 'Turismo Rojas', rut: '8.359.876-K', phone: '(111) 111-1111' },
        // { name: 'IMA Industrial SpA', rut: '88.689.100-8', phone: '(111) 111-1111' },
        // { name: 'RESITER', rut: '89.696.400-3', phone: '(111) 111-1111' },
        // { name: 'EMME INGENIERIA SPA', rut: '77.347.515-6', phone: '(111) 111-1111' },
        // { name: 'TRANSMAT', rut: '76.270.521-4', phone: '(111) 111-1111' },
        // // { name: 'Llorente Industrial S.A.', rut: '81.426.700-8', phone: '(996) 289-1411' },
        // { name: 'DINTEC CHILE', rut: '77.095.293-K', phone: '(111) 111-1111' },
        // { name: 'RENEL', rut: '15.030.307-0', phone: '(111) 111-1111' },
        // { name: 'TRANSCOM', rut: '79.904.920-1', phone: '(111) 111-1111' },
        // { name: 'DYNO NOBEL', rut: '76.040.923-5', phone: '(569) 571-9498' },
        // { name: 'VIGAL', rut: '96.849.540-2', phone: '(111) 111-1111' },
        // //{ name: 'JOY GLOBAL', rut: '95.616.000-6', phone: '(111) 111-1111' },
        // { name: 'Transmaq E.I.R.L.', rut: '76.184.224-2', phone: '(111) 111-1111' },
        // { name: 'KYNDRYL', rut: '17.120.652-9', phone: '(111) 111-1111' },
        // { name: 'MM PROJECTS', rut: '76.226.094-8', phone: '(111) 111-1111' },
        // { name: 'TEASCHILE LIMITADA', rut: '76.215.052-2', phone: '(055) 228-9522' },
        // { name: 'VEOLIA', rut: '77.441.870-9', phone: '(111) 111-1111' },
        // { name: 'C y D Ingenieria', rut: '88.359.600-5', phone: '(111) 111-1111' },
        // { name: 'ACHS', rut: '70.360.100-6', phone: '(111) 111-1111' },
        // { name: 'AZA', rut: '92.176.000-0', phone: '(947) 362-7430' },
        // { name: 'ICMAS SPA', rut: '76.696.393-5', phone: '(111) 111-1111' },
        // { name: 'ESC SERVICIOS', rut: '76.956.630-9', phone: '(111) 111-1111' },
        // { name: 'TRANSVERDE', rut: '76.499.730-1', phone: '(111) 111-1111' },
        // //{ name: 'Transportes Casablanca S.A', rut: '11.111.111-1', phone: '(111) 111-1111' },
        // { name: 'Voltta Ingeniería Eléctrica Spa', rut: '76.233.999-4', phone: '(111) 111-1111' },
        // { name: 'TRANSPORTES CARMAR LTDA', rut: '78510360-2', phone: '(111) 111-1111' },
        // { name: 'MDM TRANSPORTES Y GRUAS', rut: '76.001.251-3', phone: '(999) 100-659_' },
        // { name: 'ALUVIAL', rut: '76.365.203-3', phone: '(111) 111-1111' },
        // //{ name: 'FAM', rut: '77.683.790-3', phone: '(111) 111-1111' },
        // { name: 'CESMEC S.A', rut: '81.185.000-4', phone: '(111) 111-1111' },
        // { name: 'MGDL SpA', rut: '76.351.549-4', phone: '(111) 111-1111' },
        // { name: 'SOCIEDAD ZUÑIGA E HIJOS SPA', rut: '77.711.419-0', phone: '(111) 111-1111' },
        // // { name: 'Capstonecopper', rut: '77.020.457-7', phone: '(111) 111-1111' },
        // { name: 'SEBASTIAN FRANCISCO PEDREROS MONCADA INGENIERIA, CONSULTORA, INMOBILIARIA Y COMERCIALIZADORA E.I.R.L.', rut: '76.050.187-5', phone: '(111) 111-1111' },
        // { name: 'TRANSPORTES  INFINITY', rut: '76.207.531-8', phone: '(111) 111-1111' },
        // { name: 'Empresa de servicios externos achs', rut: '99.579.260-5', phone: '(111) 111-1111' },
        // { name: 'Komatsu Chile S.A ', rut: '96.843.130-7', phone: '(111) 111-1111' },
        // { name: 'WILUG MINERIA', rut: '77.183.916-9', phone: '(111) 111-1111' },
        // { name: 'Atacama Tech SpA', rut: '76.300.628-k', phone: '(111) 111-1111' },
        // //{ name: 'CAPSTONE COPPER', rut: '77.020.457-7', phone: '(565) 526-9300' },
        // // { name: 'MAQUINARIAS Y EQUIPOS HERRERA LIMITADA', rut: '76.040.561-2', phone: '(111) 111-1111' },
        // { name: 'Distribuidora Cummins Chile S.A.', rut: '96.843.140-4', phone: '(094) 296-2509' },
        // { name: 'ORPAK', rut: '76.309.298-4', phone: '(111) 111-1111' },
        // { name: 'EVH Ingeniería', rut: '52.004.641-0', phone: '(569) 883-7156' },
        // { name: 'BERMUDEZ Y CASTILLO SERVICE S.A', rut: '76.146.887-1', phone: '(111) 111-1111' },
        // { name: 'TRANSPORTE CORPORATIVO INFINITY', rut: '76.207.531-8', phone: '(111) 111-1111' },
        // { name: 'ELECTROFRIO LTDA', rut: '77.651.450-6', phone: '(111) 111-1111' },
        // { name: 'MAXAM Chile S.A.', rut: '77.870.140-5', phone: '(569) 846-8212' },
        // { name: 'SERMINCHO', rut: '76.231.611-0', phone: '(111) 111-1111' },
        // { name: 'INVERSIONES TRT SPA.', rut: '77.677.109-0', phone: '(111) 111-1111' },
        // // { name: 'Mantoverde S.A.', rut: '77020457-7', phone: '(111) 111-1111' },
        // { name: 'JOY GLOBAL S.A.', rut: '96.616.000-6', phone: '(111) 111-1111' },
        // { name: 'SERVISOLD INDUSTRIAL', rut: '76.399.112-2', phone: '(111) 111-1111' },
        // { name: 'JRVA', rut: '77.421.442-9', phone: '(111) 111-1111' },
        // { name: 'ID CHILE SERVICIOS SPA', rut: '76.738.857-8', phone: '(111) 111-1111' },
        // { name: 'MINTRAL', rut: '77.554.545-3', phone: '(111) 111-1111' },
        // { name: 'REPORT', rut: '96566940-k', phone: '(111) 111-1111' },
        // { name: 'RESTEC', rut: '77.683.300-2', phone: '(562) 223-6251' },
        // { name: 'EBL Servicios Industriales Integrales Limitada', rut: '76.048.531-4', phone: '(111) 111-1111' },
        // { name: 'TUSAN', rut: '86.386.700-2', phone: '(111) 111-1111' },
        // { name: 'JCM Ingenieria', rut: '76.005.567-0', phone: '(111) 111-1111' },
        // { name: 'NEXXO S.A.', rut: '86.968.900-9', phone: '(111) 111-1111' },
        // { name: 'FTF SERVICIOS S.A.', rut: '76.201.397-5', phone: '(111) 111-1111' },
        // { name: 'BYF', rut: '76.823.557-0', phone: '(111) 111-1111' },
        // { name: 'ZGA Spa', rut: '77.074.607-8', phone: '(111) 111-1111' },
        // { name: 'GEOLAQUIM', rut: '76.835.020-5', phone: '(111) 111-1111' },
        // { name: 'ICMAS', rut: '76.696.393-5', phone: '(111) 111-1111' },
        // { name: 'Sociedad Maestranza Metalmecánica  Asmeco LTDA ', rut: '76.224.524-8', phone: '(569) 845-7249' },
        // { name: 'Servicios Integrales y Operacionales Olivares SpA', rut: '77.140.505-3', phone: '(111) 111-1111' },
        // { name: 'SEUR TRANSPORTES SPA', rut: '76771509-9', phone: '(111) 111-1111' },
        // { name: 'GOHE INVERSIONES SPA', rut: '77196779-5', phone: '(111) 111-1111' },
        // { name: 'COMERCIAL AGRICOLA Y TRANSPORTES TOLEDO GIANZO Y CIA. LTDA.', rut: '76103845-1', phone: '(111) 111-1111' },
        // { name: 'MOVIMIENTOS DE TIERRAS, TRANSPORTES Y MAQUINARIA TERRA NORTE SPA', rut: '76103845-1', phone: '(111) 111-1111' },
        // { name: 'R&Q INGENIERIA', rut: '84.865.000-5', phone: '(111) 111-1111' },
        // { name: 'TRICONOS MINEROS', rut: '96.961.460-K', phone: '(994) 868-0337' },
        // { name: 'RENEL INGENIERIA', rut: '15.030.307-9', phone: '(111) 111-1111' },
        // { name: 'INGEVAL', rut: '76.736.672-8', phone: '(111) 111-1111' },
        // { name: 'SRM PUENTE GRUA', rut: '76.774.737-3', phone: '(111) 111-1111' },
        // //{ name: 'MANTOVERDE', rut: '77.020.457-7', phone: '(111) 111-1111' },
        // { name: 'SGS Minerals S.A', rut: '98.801.810-8', phone: '(111) 111-1111' },
        // { name: 'EQUANS INDUSTRIAL SPA', rut: '88.689.100-8', phone: '(111) 111-1111' },
        // { name: 'PACKMATIC', rut: '76.072.205-7', phone: '(569) 777-9064' },
        // { name: 'Transportes Bello', rut: '88.397.100-0', phone: '(569) 777-9064' },
        // { name: 'CAPSTONE COPPER', rut: '77.233.325-0', phone: '(569) 990-0990' },
        // { name: 'Vortex Servicios e Inversiones Limitada', rut: '77.233.325-0', phone: '(569) 841-6790' },
        // { name: 'KNIGHT PIESOLD', rut: '96.680.350-9', phone: '(562) 259-4640' },
        // { name: 'HUALPEN', rut: '76.750.560-4', phone: '(569) 623-9620' },
        // { name: 'AGUNSA', rut: '96.566.940-K', phone: '(569) 685-2674' },
        // { name: 'HUALPEN', rut: '76.750.560-4', phone: '(998) 504-6905' },
        // { name: 'PREIN CHILE', rut: '77.764.140-9', phone: '(111) 111-1111' },
        // { name: 'TRES60', rut: '18.747.515-5', phone: '(123) 455-6789' },
        // { name: 'Mutual de Seguridad Asesorías S.A', rut: '96.783.880-2', phone: '(111) 111-1111' },
        // { name: 'WORLD SURVEY SERVICES S.A.', rut: '96.947.280-5', phone: '(111) 111-1111' },
        // { name: 'CIFUENTES Y CIA LTDA (SRM PUENTE GRUAS)', rut: '76.774.737-3', phone: '(111) 111-1111' },
        // { name: 'Guillermo Lagos Fuentes', rut: '8.035.316-2', phone: '(111) 111-1111' },
        // { name: 'SUAC SOLUTIONS SpA', rut: '76.865.368-2', phone: '(111) 111-1111' },
        // { name: 'KAESER COMPRESORES DE CHILE SPA', rut: '77.152.830-9', phone: '(111) 111-1111' },
        // { name: 'HEXAGON MINING LTDA.', rut: '76.015.699-k', phone: '(999) 246-4817' },
        // { name: 'PROMET SERVICIOS SPA', rut: '96.853.940-k', phone: '(111) 111-1111' },
        // { name: 'INACAL SA', rut: '76.115.484-2', phone: '(111) 111-1111' },
        // { name: 'Autorentas del Pacifico SPA', rut: '83.547.100-4', phone: '(111) 111-1111' },
        // { name: 'VERASAY (INACAL)', rut: '76.303.840-8', phone: '(111) 111-1111' },
        // { name: 'DINTEC', rut: '77.095.293-k', phone: '(111) 111-1111' },
        // { name: 'Recon Drilling', rut: '77.634.636-5', phone: '(111) 111-1111' },
        // { name: 'AUSENCO CHILE LTDA', rut: '78.727.440-4', phone: '(111) 111-1111' },
        // { name: 'Russell Mineral Equipment S.A', rut: '99.572.320-4', phone: '(111) 111-1111' },
        // { name: 'Superex S.A', rut: '11.669.178-7', phone: '(111) 111-1111' },
        // { name: 'Tcon Chile Limitada', rut: '76.638.375-0', phone: '(111) 111-1111' },
        // { name: 'IMH Solutyons', rut: '77.083.885-1', phone: '(111) 111-1111' },
        // { name: 'INCOVALL', rut: '76.511.747-K', phone: '(569) 261-9918' },
        // { name: 'Soluciones ambientales del norte S.A.', rut: '76.849.990-k', phone: '(999) 999-9999' },
        // { name: 'SOCIEDAD TRANSPORTES E INVERSIONES VINARA LTDA', rut: '76.324.888-7', phone: '(111) 111-1111' },
        // { name: 'Hidroatacama', rut: '76.227.065-k', phone: '(956) 371-7879' },
    ]
};

async function main() {
    // console.log('Seeding database...');

    // Eliminar datos existentes
    await db.userRole.deleteMany({});
    await db.user.deleteMany({});
    await db.company.deleteMany({});

    // Crear empresas y obtener sus IDs
    const companies = await Promise.all(
        initialData.companies.map(company =>
            db.company.create({
                data: company,
            })
        )
    );

    // Crear usuarios y asignar roles
    for (const user of initialData.users) {
        const company = companies.find(c => c.name === 'RCR-Support'); // Ajusta esto según tus necesidades
        if (company) {
            user.companyId = company.id;
        }

        const createdUser = await db.user.create({
            data: {
                name: user.name,
                middleName: user.middleName,
                lastName: user.lastName,
                secondLastName: user.secondLastName,
                userName: user.userName,
                displayName: user.displayName,
                email: user.email,
                run: user.run,
                phoneNumber: user.phoneNumber,
                category: user.category,
                deletedLogic: user.deletedLogic,
                password: user.password,
                image: user.image,
                companyId: user.companyId,
            },
        });

        // Asignar roles al usuario
        for (const role of user.roles) {
            const roleRecord = await db.role.findUnique({
                where: { name: role },
            });

            if (roleRecord) {
                await db.userRole.create({
                    data: {
                        userId: createdUser.id,
                        roleId: roleRecord.id,
                    },
                });
            }
        }
    }

    // console.log('Database seeded successfully.');
}

main()
    .catch((e) => {
        // console.error('Error al ejecutar el seed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await db.$disconnect();
    });
