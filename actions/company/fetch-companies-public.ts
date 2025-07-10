import { db } from "@/lib/db";

export const fetchCompaniesPublic = async () => {
  const companies = await db.company.findMany({
    where: {
      status: true,
      name: { not: null }
    },
    select: {
      id: true,
      name: true,
      rut: true
    },
    orderBy: { name: "asc" }
  });

  return companies.map(company => ({
    label: company.name ? `${company.name} (${company.rut})` : company.rut,
    value: company.id
  }));
};
