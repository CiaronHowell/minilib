import { and, eq, getTableColumns, sql } from 'drizzle-orm';
import { db } from './db';
import { users, type Users } from './db/schema/users';
import { decrypt, decryptToString, encrypt, encryptString } from './encryption';
import { hashPassword } from './password';
import { generateRandomRecoveryCode } from './utils';

export async function createUser(
	firstName: string,
	lastName: string,
	email: string,
	password: string
): Promise<User> {
	const passwordHash = await hashPassword(password);
	const recoveryCode = generateRandomRecoveryCode();
	const encryptedRecoveryCode = encryptString(recoveryCode);

	const row = await db
		.insert(users)
		.values({
			firstName: firstName,
			lastName: lastName,
			email: email,
			passwordHash: passwordHash,
			recoveryCode: Buffer.from(encryptedRecoveryCode)
		})
		.returning();
	if (row === null) {
		throw new Error('Unexpected error');
	}

	const user: User = {
		id: row[0].id,
		firstName: firstName,
		lastName: lastName,
		email: email,
		emailVerified: false,
		registered2FA: false
	};

	return user;
}

export async function updateUserPassword(userId: number, password: string): Promise<void> {
	const passwordHash = await hashPassword(password);
	await db.update(users).set({ passwordHash: passwordHash }).where(eq(users.id, userId));
}

export async function updateUserEmailAndSetEmailAsVerified(
	userId: number,
	email: string
): Promise<void> {
	await db.update(users).set({ email: email, emailVerified: 1 }).where(eq(users.id, userId));
}

export async function setUserAsEmailVerifiedIfEmailMatches(
	userId: number,
	email: string
): Promise<boolean> {
	const result = await db
		.update(users)
		.set({ emailVerified: 1 })
		.where(and(eq(users.id, userId), eq(users.email, email)));

	return result.rowsAffected > 0;
}

export async function getUserPasswordHash(userId: number): Promise<string> {
	const row = await db.select().from(users).where(eq(users.id, userId));
	if (row === null || row.length < 1) {
		throw new Error('Invalid user ID');
	}

	return row[0].passwordHash;
}

export async function getUserRecoverCode(userId: number): Promise<string> {
	const row = await db.select().from(users).where(eq(users.id, userId));
	if (row === null || row.length < 1) {
		throw new Error('Invalid user ID');
	}

	return decryptToString(row[0].recoveryCode);
}

export async function getUserTOTPKey(userId: number): Promise<Uint8Array | null> {
	const row = await db.select().from(users).where(eq(users.id, userId));
	if (row === null || row.length < 1) {
		throw new Error('Invalid user ID');
	}

	const encrypted = row[0].totpKey;
	if (encrypted === null) {
		return null;
	}

	return decrypt(encrypted);
}

export async function updateUserTOTPKey(userId: number, key: Uint8Array): Promise<void> {
	const encrypted = encrypt(key);
	await db
		.update(users)
		.set({ totpKey: Buffer.from(encrypted) })
		.where(eq(users.id, userId));
}

export async function resetUserRecoveryCode(userId: number): Promise<string> {
	const recoveryCode = generateRandomRecoveryCode();
	const encrypted = encryptString(recoveryCode);

	await db
		.update(users)
		.set({ recoveryCode: Buffer.from(encrypted) })
		.where(eq(users.id, userId));

	return recoveryCode;
}

export async function getUserFromEmail(email: string): Promise<User | null> {
	const row = await db
		.select({
			...getTableColumns(users),
			registered2FA: sql<number>`IIF(totp_key IS NOT NULL, 1, 0)`
		})
		.from(users)
		.where(eq(users.email, email));
	if (row === null || row.length < 1) {
		return null;
	}

	const userRow = row[0];
	const user: User = {
		id: userRow.id,
		firstName: userRow.firstName,
		lastName: userRow.lastName,
		email: userRow.email,
		emailVerified: Boolean(userRow.emailVerified),
		registered2FA: Boolean(userRow.registered2FA)
	};

	return user;
}

export interface User {
	id: number;
	firstName: string;
	lastName: string;
	email: string;
	emailVerified: boolean;
	registered2FA: boolean;
}
