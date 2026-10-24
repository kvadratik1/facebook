import { config } from "dotenv";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";

config({ path: ".env.local", quiet: true });

async function setPassword(username: string, password: string) {
  if (!process.env.DATABASE_URL) {
    throw new Error(
      "Set DATABASE_URL in .env.local before running this script."
    );
  }

  const { db } = await import("./db");
  const { users } = await import("./db/schema");
  const hash = await bcrypt.hash(password, 10);

  const updated = await db
    .update(users)
    .set({ passwordHash: hash })
    .where(eq(users.username, username))
    .returning({ username: users.username });

  if (updated.length === 0) {
    throw new Error(`User "${username}" was not found.`);
  }

  console.log(`Password set for user: ${username}`);
}

const username = process.argv[2];
const password = process.argv[3];

if (!username || !password) {
  console.error("Usage: npx tsx set-password.ts <username> <password>");
  process.exit(1);
}

setPassword(username, password).catch((error: unknown) => {
  console.error(
    error instanceof Error ? error.message : "Failed to set password."
  );
  process.exitCode = 1;
});
