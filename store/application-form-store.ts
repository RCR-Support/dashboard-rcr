import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Contract } from '@/interfaces/contract.interface';
import { WorkerFormValues } from '@/app/dashboard/applications/create/steps/WorkerStep';

import { Activity } from '@/app/dashboard/activities/interfaces';
import { DocumentData } from '@/app/dashboard/applications/create/types';

interface Document extends DocumentData {
  id: string;
  name: string;
  activityName?: string;
  notes?: string;
  isSpecific: boolean;
  relatedActivities?: string[];
  file?: File;
  status: 'pending' | 'uploading' | 'completed' | 'error' | 'approved' | 'rejected';
}

interface Company {
  id: string;
  name: string;
  phone?: string;
  email?: string;
}

interface ApplicationFormState {
  // Control de pasos
  currentStep: number;

  // Paso 1: Contrato
  contract: Contract | null;
  availableContracts: Contract[];
  company: Company | null;

  // Paso 2: Trabajador
  workerData: WorkerFormValues | null;
  credentialPhoto: string | null; // URL o base64 de la foto de credencial

  // Paso 3: Actividades
  selectedActivities: Activity[];
  availableActivities: Activity[];
  isLoadingActivities: boolean;

  // Paso 4: Documentos
  documents: DocumentData[];
  existingDocuments: Map<string, any> | null; // Para modo edición

  // Acciones
  setCurrentStep: (step: number) => void;
  setContract: (contract: Contract | null) => void;
  setAvailableContracts: (contracts: Contract[]) => void;
  setCompany: (company: Company | null) => void;
  setWorkerData: (data: WorkerFormValues) => void;
  setCredentialPhoto: (photoUrl: string | null) => void;
  setSelectedActivities: (activities: Activity[]) => void;
  setAvailableActivities: (activities: Activity[]) => void;
  setDocuments: (documents: Document[]) => void;
  setExistingDocuments: (existingDocs: Map<string, any> | null) => void;
  clearForm: () => void;
  resetFormKeepingCompanyData: () => void;
}

// Crear el store con persistencia
// Estado inicial
type ActionTypes = {
  setCurrentStep: (step: number) => void;
  setContract: (contract: Contract | null) => void;
  setAvailableContracts: (contracts: Contract[]) => void;
  setCompany: (company: Company | null) => void;
  setWorkerData: (data: WorkerFormValues) => void;
  setCredentialPhoto: (photoUrl: string | null) => void;
  setSelectedActivities: (activities: Activity[]) => void;
  setAvailableActivities: (activities: Activity[]) => void;
  setDocuments: (documents: Document[]) => void;
  setExistingDocuments: (existingDocs: Map<string, any> | null) => void;
  clearForm: () => void;
  resetFormKeepingCompanyData: () => void;
};

const initialState: Omit<ApplicationFormState, keyof ActionTypes> = {
  currentStep: 0,
  contract: null,
  availableContracts: [],
  company: null,
  workerData: null,
  credentialPhoto: null,
  selectedActivities: [],
  availableActivities: [],
  isLoadingActivities: false,
  documents: [],
  existingDocuments: null,
};

export const useApplicationFormStore = create<ApplicationFormState>()(
  // Sin persist middleware - Usar localStorage solo cuando sea necesario
  (set, get) => ({
    ...initialState,

    // Nueva acción para reset controlado
    resetFormKeepingCompanyData: () => {
        const state = get();
        const company = state.company;
        const availableContracts = state.availableContracts;

        // Siempre reseteamos a estado inicial manteniendo solo los datos de empresa
        set({
          ...initialState,
          company,
          availableContracts,
          currentStep: 0,
          contract: null,
        });
      },

      // Acciones
      setCurrentStep: step => {
        // Simplificar: solo validar rango, sin cambios automáticos
        if (step >= 0 && step <= 3) {
          set({ currentStep: step });
        }
      },

      setContract: contract => set({ contract }),
      setAvailableContracts: contracts =>
        set({ availableContracts: contracts }),
      setCompany: company => set({ company }),
      setWorkerData: data => set({ workerData: data }),
      setCredentialPhoto: photoUrl => set({ credentialPhoto: photoUrl }),
      setSelectedActivities: activities =>
        set({ selectedActivities: activities }),
      setAvailableActivities: activities =>
        set({ availableActivities: activities }),
      setDocuments: documents => set({ documents }),
      setExistingDocuments: existingDocs => set({ existingDocuments: existingDocs }),

      clearForm: () => set(initialState),
    })
);
