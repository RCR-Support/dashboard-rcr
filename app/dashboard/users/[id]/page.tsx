import { redirect } from 'next/navigation';

const UserDetailPage = () => {
  redirect('/dashboard/users');
};

export default UserDetailPage;
