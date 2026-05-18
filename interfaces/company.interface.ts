import { User } from './user.interface';
import { Contract } from './contract.interface';

export interface Company {
  id: string;
  name: string | null;
  rut: string;
  phone: string;
  city: string | null;
  url: string | null;
  logoUrl: string | null;
  status: boolean;
  users?: User[];
  contracts?: Contract[];
  // Contratos en los que esta empresa participa como sub-empresa
  asSubcontractor?: Array<{
    contractName: string;
    contractNumber: string;
    mandanteName: string | null;
    status: string;
  }>;
}

export interface CompanyUser {
  id: string;
  email: string;
  name: string;
  lastName: string;
  displayName: string;
  phoneNumber: string;
  roles: {
    role: {
      id: string;
      name: string;
    };
    userId: string;
    roleId: string;
  }[];
}

export interface CompanySelect {
  value: string;
  label: string;
  description: string;
  logoUrl?: string | null;
  users?: Array<{
    id: string;
    displayName: string;
    email: string;
    roles: Array<{
      role: {
        name: string;
      };
    }>;
  }>;
  contracts?: Array<{
    id: string;
    contractNumber: string;
    contractName: string;
    initialDate: Date;
    finalDate: Date;
    userAc?: {
      id: string;
      displayName: string;
      email: string;
    };
    subcompanies?: Array<{
      id: string;
      name: string | null;
      rut: string;
      status: string;
      representativeName?: string | null;
    }>;
  }>;
  // Contratos en los que esta empresa participa como sub-empresa
  asSubcontractor?: Array<{
    contractId: string;
    contractName: string;
    contractNumber: string;
    mandanteId?: string;
    mandanteName?: string | null;
    mandanteRut?: string;
    status: string;
  }>;
  summary?: {
    totalUsers: number;
    totalContracts: number;
  };
}
