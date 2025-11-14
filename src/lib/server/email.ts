import { count, eq } from 'drizzle-orm';
import { db } from './db';
import { users } from './db/schema/users';

export async function checkEmailAvailability(email: string): Promise<boolean> {
	const row = await db.select({ count: count() }).from(users).where(eq(users.email, email));
	if (row === null || row.length < 1) {
		throw new Error();
	}

	return row[0].count === 0;
}
