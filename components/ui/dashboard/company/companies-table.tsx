import { CompanySelect } from "@/interfaces/company.interface"
import { CompaniesGrid } from "./CardCompany"

interface CompaniesTableProps {
  companies: CompanySelect[]
}

export function CompaniesTable({ companies }: CompaniesTableProps) {
  return (
    <>
      <CompaniesGrid companies={companies} />
    </>
  )
}
export default CompaniesTable
