import { eq, and } from 'drizzle-orm';
import { db } from './db';
import * as table from '$lib/server/db/schema';
import { decryptToString, encryptString } from './encryption';
import { ExpiringTokenBucket } from './rate-limit';
import { generateRandomRecoveryCode } from './utils';

export const totpBucket = new ExpiringTokenBucket<number>(5, 60 * 30);
export const recoveryCodeBucket = new ExpiringTokenBucket<number>(3, 60 * 60);

export async function resetUser2FAWithRecoveryCode(
	userId: number,
	recoveryCode: string
): Promise<boolean> {
	// Note: In Postgres and MySQL, these queries should be done in a transaction using SELECT FOR UPDATE
	const row = await db.select().from(table.users).where(eq(table.users.id, userId)).limit(0);

	if (row === null || row.length < 1) {
		return false;
	}
	const encryptedRecoveryCode = row[0].recoveryCode;
	const userRecoveryCode = decryptToString(encryptedRecoveryCode);
	if (recoveryCode !== userRecoveryCode) {
		return false;
	}

	const newRecoveryCode = generateRandomRecoveryCode();
	const encryptedNewRecoveryCode = encryptString(newRecoveryCode);
	await db
		.update(table.sessions)
		.set({
			twoFactorVerified: 0
		})
		.where(eq(table.sessions.userId, userId));

	// Compare old recovery code to ensure recovery code wasn't updated.
	// const result = db.execute(
	// 	'UPDATE user SET recovery_code = ?, totp_key = NULL WHERE id = ? AND recovery_code = ?',
	// 	[encryptedNewRecoveryCode, userId, encryptedRecoveryCode]
	// );
	const result = await db
		.update(table.users)
		.set({
			recoveryCode: Buffer.from(encryptedNewRecoveryCode),
			totpKey: null
		})
		.where(and(eq(table.users.id, userId), eq(table.users.recoveryCode, encryptedRecoveryCode)));

	return result.rowsAffected > 0;
}
