import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const contracts = await db.contract.findMany({
      where: { deletedAt: null },
      select: {
        id: true,
        contractNumber: true,
        contractName: true,
        Company: {
          select: {
            name: true,
            rut: true,
          },
        },
      },
      orderBy: [
        { Company: { name: 'asc' } },
        { contractNumber: 'asc' },
      ],
    });

    return NextResponse.json(
      contracts.map(contract => ({
        value: contract.id,
        label: `${contract.Company.name ?? contract.Company.rut} - ${contract.contractNumber} - ${contract.contractName}`,
      }))
    );
  } catch {
    return new NextResponse('Error interno', { status: 500 });
  }
}
