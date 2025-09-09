import { create } from 'zustand';
import { Contract } from '@/interfaces/contract.interface';

interface Activity {
  id: string;
  name: string;
  description?: string;
}

interface Document {
  id: string;
  name: string;
  file?: File;
  status: 'pending' | 'uploading' | 'completed' | 'error';
}

interface Company {
  id: string;
  name: string;
  phone?: string;
  email?: string;
}

interface ApplicationFormState {
  // Paso 1: Contrato
  contract: Contract | null;
  availableContracts: Contract[];
  company: Company | null;

  // Paso 2: Trabajador
  workerData: {
    workerName: string;
    workerPaternal: string;
    workerMaternal: string;
    workerRun: string;
  };

  // Paso 3: Actividades
  selectedActivities: Activity[];

  // Paso 4: Documentos
  documents: Document[];

  // Acciones
  setContract: (contract: Contract | null) => void;
  setAvailableContracts: (contracts: Contract[]) => void;
  setCompany: (company: Company | null) => void;
  setWorkerData: (data: ApplicationFormState['workerData']) => void;
  setSelectedActivities: (activities: Activity[]) => void;
  setDocuments: (documents: Document[]) => void;
  reset: () => void;
}

const initialWorkerData = {
  workerName: '',
  workerPaternal: '',
  workerMaternal: '',
  workerRun: '',
};

export const useApplicationFormStore = create<ApplicationFormState>((set) => ({
  // Estado inicial
  contract: null,
  availableContracts: [],
  company: null,
  workerData: initialWorkerData,
  selectedActivities: [],
  documents: [],

  // Acciones
  setContract: (contract) => set({ contract }),
  
  setAvailableContracts: (contracts) => set({ availableContracts: contracts }),

  setCompany: (company) => set({ company }),
  
  setWorkerData: (data) => set({ workerData: data }),
  
  setSelectedActivities: (activities) => set({ selectedActivities: activities }),
  
  setDocuments: (documents) => set({ documents }),
  
  reset: () => set({
    contract: null,
    availableContracts: [],
    company: null,
    workerData: initialWorkerData,
    selectedActivities: [],
    documents: [],
  }),
}));
