export interface Activity {
  id: string;
  name: string;
  imageUrl: string | null;
  requiredDriverLicense: string | null;
  requiredDocumentations?: {
    id: string;
    documentation: {
      id: string;
      name: string;
    };
    notes?: string | null;
  }[];
}

export type ViewType = 'cards' | 'table';

export interface ViewProps {
  activities: Activity[];
}

export const VIEW_TYPES = {
  CARDS: 'cards' as ViewType,
  TABLE: 'table' as ViewType,
} as const;

export const COLORS = {
  ACTIVE: 'text-[#03c9d7]',
  HOVER: 'hover:text-blue-400',
} as const;
