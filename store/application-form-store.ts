import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Contract } from '@/interfaces/contract.interface';
import { WorkerFormValues } from '@/app/dashboard/applications/create/steps/WorkerStep';

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
  // Control de pasos
  currentStep: number;
  
  // Paso 1: Contrato
  contract: Contract | null;
  availableContracts: Contract[];
  company: Company | null;

  // Paso 2: Trabajador
  workerData: WorkerFormValues | null;

  // Paso 3: Actividades
  selectedActivities: Activity[];

  // Paso 4: Documentos
  documents: Document[];

  // Acciones
  setCurrentStep: (step: number) => void;
  setContract: (contract: Contract | null) => void;
  setAvailableContracts: (contracts: Contract[]) => void;
  setCompany: (company: Company | null) => void;
  setWorkerData: (data: WorkerFormValues) => void;
  setSelectedActivities: (activities: Activity[]) => void;
  setDocuments: (documents: Document[]) => void;
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
  setSelectedActivities: (activities: Activity[]) => void;
  setDocuments: (documents: Document[]) => void;
  clearForm: () => void;
  resetFormKeepingCompanyData: () => void;
};

const initialState: Omit<ApplicationFormState, keyof ActionTypes> = {
  currentStep: 0,
  contract: null,
  availableContracts: [],
  company: null,
  workerData: null,
  selectedActivities: [],
  documents: [],
};

export const useApplicationFormStore = create<ApplicationFormState>()(
  persist(
    (set, get) => ({
      ...initialState,

      // Nueva acción para reset controlado
      resetFormKeepingCompanyData: () => {
        const state = get();
        const company = state.company;
        const availableContracts = state.availableContracts;

        if (availableContracts.length > 1) {
          // Caso de múltiples contratos
          set({
            ...initialState,
            company,
            availableContracts,
            currentStep: 0,
            contract: null
          });
        } else if (availableContracts.length === 1) {
          // Caso de un solo contrato
          set({
            ...initialState,
            company,
            availableContracts,
            contract: availableContracts[0],
            currentStep: 1
          });
        }
      },

      // Acciones
      setCurrentStep: (step) => {
        const state = get();
        
        // Validar que el paso esté en el rango válido
        if (step < 0 || step > 3) return;

        // Reglas básicas de navegación
        if (!state.contract) {
          set({ currentStep: 0 });
          return;
        }

        // Si hay contrato y se solicita paso 1, permitir
        if (step === 1) {
          set({ currentStep: 1 });
          return;
        }

        // Para otros pasos, validar requisitos
        if (step === 2 && !state.workerData?.workerName) {
          set({ currentStep: 1 });
          return;
        }

        if (step === 3 && state.selectedActivities.length === 0) {
          set({ currentStep: 2 });
          return;
        }

        // Si pasa todas las validaciones, permitir el cambio
        set({ currentStep: step });
      },

      setContract: (contract) => set({ contract }),
      setAvailableContracts: (contracts) => set({ availableContracts: contracts }),
      setCompany: (company) => set({ company }),
      setWorkerData: (data) => set({ workerData: data }),
      setSelectedActivities: (activities) => set({ selectedActivities: activities }),
      setDocuments: (documents) => set({ documents }),
      
      clearForm: () => set(initialState),
    }),
    {
      name: 'application-form-storage',
      version: 1, // Añadimos versión para manejar actualizaciones futuras
      partialize: (state) => ({
        currentStep: state.currentStep,
        contract: state.contract,
        availableContracts: state.availableContracts,
        company: state.company,
        workerData: state.workerData,
        selectedActivities: state.selectedActivities,
        documents: state.documents,
      }),
      merge: (persistedState: unknown, currentState: ApplicationFormState) => {
        if (!persistedState) return currentState;
        
        const typedState = persistedState as Partial<ApplicationFormState>;
        
        // Asegurarse de que las arrays estén inicializadas
        const state = {
          ...currentState,
          ...typedState,
          availableContracts: typedState.availableContracts || [],
          selectedActivities: typedState.selectedActivities || [],
          documents: typedState.documents || [],
        };

        // Validar el paso actual
        if (state.contract && state.currentStep === 0) {
          state.currentStep = 1;
        }
        if (!state.contract && state.currentStep > 0) {
          state.currentStep = 0;
        }

        return state;
      },
      // Asegurarnos de que los datos sean válidos al cargar
      onRehydrateStorage: (_state) => {
        return (state) => {
          if (state) {
            // Validar que tenemos los datos necesarios para el paso actual
            if (state.currentStep > 1 && !state.workerData) {
              state.currentStep = 1;
            }
          }
        };
      }
    }
  )
);
