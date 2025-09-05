export interface AdminContractor {
  value: string;
  label: string;
  description: string;
}

export interface AdminContractorResponse {
  success: boolean;
  adminContractors?: AdminContractor[];
  error?: string;
}
