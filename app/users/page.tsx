import Link from "next/link";
import { connection } from "next/server";
import { getUsers } from "../services/users";

export default async function Users() {
  await connection();
  const users = await getUsers();

  return (
    <div>
      <h2>Users</h2>
      <ul>
        {users.map((user) => (
          <li key={user.id}>
            <Link href={`/users/${user.id}`}>{user.name}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
