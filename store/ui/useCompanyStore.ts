import { create } from 'zustand';
import { CompanySelect } from '@/interfaces/company.interface';

interface CompanyStore {
  editingCompany: CompanySelect | null;
  setEditingCompany: (company: CompanySelect | null) => void;
}

export const useCompanyStore = create<CompanyStore>(set => ({
  editingCompany: null,
  setEditingCompany: company => set({ editingCompany: company }),
}));
