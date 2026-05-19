import { Company } from './company.interface';

// Interfaz para el usuario administrador del contrato (versión reducida)
export interface ContractUser {
  id: string;
  email: string;
  displayName: string;
}

// Interfaz para Company simplificada (usada en listados)
export interface ContractCompany {
  id: string;
  name: string | null;
  rut: string;
}

// Interfaz principal del contrato
export interface Contract {
  id: string;
  contractNumber: string;
  contractName: string;
  initialDate: Date;
  finalDate: Date;
  companyId?: string;
  useracId?: string;
  company?: ContractCompany;
  userAc?: ContractUser;
  createdAt: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
  _count?: {
    application: number;
  };
  // Sub-contrato: el contrato pertenece al mandante y la empresa actual es sub-empresa
  isSubcontract?: boolean;
  mandanteName?: string | null;
  // Sub-empresas vinculadas a este contrato (cuando esta empresa es mandante)
  subcontracts?: Array<{
    id: string;
    status: string;
    subCompany: {
      id: string;
      name: string | null;
      rut: string;
    };
    representativeName?: string | null;
  }>;
  // Traspaso temporal activo (si el AC actual no es el AC original)
  activeReassignment?: {
    originalAcId: string;
    originalAcName: string;
    returnDate: string | null;
    reason: string;
    assignedAt: string;
  } | null;
}

export interface ContractResponse {
  success: boolean;
  contracts?: Contract[];
  error?: string;
}
// Interfaz para el formulario
export interface ContractFormValues {
  contractNumber: string;
  contractName: string;
  initialDate: Date;
  finalDate: Date;
  companyId: string;
  useracId: string;
}
