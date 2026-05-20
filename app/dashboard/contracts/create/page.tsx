import { redirect } from 'next/navigation';

export default function ContractsCreatePage() {
  redirect('/dashboard/contracts?create=1');
}
