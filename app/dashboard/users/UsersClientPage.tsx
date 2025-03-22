'use client';

import { User } from "@/interfaces";
import UsersView from "./UsersView";
import { withPermission } from '@/components/ui/auth/withPermission';

interface Props {
    initialUsers: User[];
}

function UsersClientPage({ initialUsers }: Props) {
    return <UsersView users={initialUsers} />;
}

const ProtectedUsersPage = withPermission(UsersClientPage, '/dashboard/users');
export default ProtectedUsersPage;
