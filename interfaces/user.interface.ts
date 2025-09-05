import { RoleEnum } from '@prisma/client';
import { Company } from './company.interface';

export interface User {
  id: string;
  name: string;
  middleName?: string | null;
  lastName: string;
  secondLastName?: string | null;
  displayName: string;
  userName: string;
  email: string;
  run: string;
  phoneNumber?: string | null;
  category?: string;
  deletedLogic?: boolean | null;
  isActive: boolean;
  password?: string | null;
  image?: string | null;
  companyId: string | null;
  company?: Company | null;
  adminContractorId?: string | null;
  adminContractor?: {
    id: string;
    name: string;
    lastName: string;
    displayName: string;
    phoneNumber?: string;
    email?: string;
  } | null;
  roles: RoleEnum[];
  assignedUsers?: {
    id: string;
    displayName: string;
    email: string;
    company?: {
      name: string | null;
    } | null;
  }[];
  createdAt?: string | Date;
}
