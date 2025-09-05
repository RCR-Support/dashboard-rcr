import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  const companies = await db.company.findMany({
    where: { status: true, name: { not: null } },
    select: { id: true, name: true, rut: true },
    orderBy: { name: 'asc' },
  });

  const data = companies.map(company => ({
    label: company.name ? `${company.name} (${company.rut})` : company.rut,
    value: company.id,
  }));

  return NextResponse.json(data);
}
