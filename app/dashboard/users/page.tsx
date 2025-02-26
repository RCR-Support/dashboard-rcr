import { db } from '@/lib/db';

const UsersPage = async () => {
  const users = await db.user.findMany();

  return (
    <div>
      <h1>Users Page Data</h1>
      <ul>
        {users.map((user) => (
          <li key={user.id}>
            {user.name} {user.lastName} ({user.email} - {user.role})
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UsersPage;
