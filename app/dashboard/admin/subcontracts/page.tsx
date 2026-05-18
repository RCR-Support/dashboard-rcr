import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { hasActionPermission } from '@/config/action-permissions';
import { db } from '@/lib/db';
import SubcontractsAdminClient from './SubcontractsAdminClient';

export default async function SubcontractsAdminPage() {
  const session = await auth();
  if (!session?.user) redirect('/auth/login');

  if (!hasActionPermission('subcontracts:approve', session.user.roles)) {
    redirect('/unauthorized');
  }

  const subcontracts = await db.subcontract.findMany({
    include: {
      subCompany: {
        select: { id: true, name: true, rut: true, city: true },
      },
      contract: {
        select: {
          id: true,
          contractName: true,
          contractNumber: true,
          Company: { select: { id: true, name: true, rut: true } },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return <SubcontractsAdminClient subcontracts={subcontracts} />;
}
