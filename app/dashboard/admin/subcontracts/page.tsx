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
        select: {
          id: true,
          name: true,
          rut: true,
          city: true,
          User: {
            where: { deletedLogic: false },
            select: { id: true, displayName: true, email: true, isActive: true },
            orderBy: { displayName: 'asc' },
          },
        },
      },
      user: {
        select: { id: true, displayName: true, email: true, isActive: true },
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

  const mappedSubcontracts = subcontracts.map(({ subCompany, ...subcontract }) => ({
    ...subcontract,
    subCompany: {
      id: subCompany.id,
      name: subCompany.name,
      rut: subCompany.rut,
      city: subCompany.city,
    },
    availableUsers: subCompany.User,
  }));

  return <SubcontractsAdminClient subcontracts={mappedSubcontracts} />;
}
