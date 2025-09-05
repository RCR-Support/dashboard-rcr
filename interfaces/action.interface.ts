// action.interface.ts
export interface RegisterActionInput {
  name: string;
  lastName: string;
  userName: string;
  email: string;
  run: string;
  phoneNumber: string;
  companyId?: string; // Hacer esta propiedad opcional
  category: string;
  roles: string[];
  password: string;
  middleName?: string;
  secondLastName?: string;
  image?: string;
  adminContractorId?: string; // ID del contratista administrador, ahora opcional
}

export type EditActionInput = Omit<RegisterActionInput, 'password'> & {
  password?: string;
};
