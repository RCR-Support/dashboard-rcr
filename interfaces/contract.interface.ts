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
