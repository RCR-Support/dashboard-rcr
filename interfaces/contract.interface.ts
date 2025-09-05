import { Company } from './company.interface';

// Interfaz para el usuario administrador del contrato (versión reducida)
export interface ContractUser {
  id: string;
  email: string;
  displayName: string;
}

// Interfaz principal del contrato
export interface Contract {
  id: string;
  contractNumber: string;
  contractName: string;
  initialDate: Date;
  finalDate: Date;
  companyId: string;
  useracId: string;
  company?: Company;
  userAc?: ContractUser; // Cambiado a ContractUser en lugar de User completo
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
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
