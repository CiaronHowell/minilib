import { db } from './db';
import { encodeHexLowerCase } from '@oslojs/encoding';
import { generateRandomOTP } from './utils';
import { sha256 } from '@oslojs/crypto/sha2';

import type { RequestEvent } from '@sveltejs/kit';
import type { User } from './user';
import { passwordResetSessions, users } from './db/schema';
import { eq, getTableColumns, sql } from 'drizzle-orm';

export async function createPasswordResetSession(
	token: string,
	userId: number,
	email: string
): Promise<PasswordResetSession> {
	const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
	const session: PasswordResetSession = {
		id: sessionId,
		userId,
		email,
		expiresAt: new Date(Date.now() + 1000 * 60 * 10),
		code: generateRandomOTP(),
		emailVerified: false,
		twoFactorVerified: false
	};

	await db.insert(passwordResetSessions).values({
		id: session.id,
		userId: userId,
		email: email,
		code: session.code,
		expiresAt: session.expiresAt
	});

	return session;
}

export async function validatePasswordResetSessionToken(
	token: string
): Promise<PasswordResetSessionValidationResult> {
	const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
	const row = await db
		.select({
			...getTableColumns(passwordResetSessions),
			...getTableColumns(users),
			registered2FA: sql<number>`IIF(totp_key IS NOT NULL, 1, 0)`
		})
		.from(passwordResetSessions)
		.innerJoin(users, eq(users.id, passwordResetSessions.userId))
		.where(eq(passwordResetSessions.id, sessionId));
	if (row === null || row.length < 1) {
		return { session: null, user: null };
	}

	const sessionRow = row[0];
	const session: PasswordResetSession = {
		id: sessionId,
		userId: sessionRow.userId,
		email: sessionRow.email,
		code: sessionRow.code,
		expiresAt: new Date(sessionRow.expiresAt),
		emailVerified: Boolean(sessionRow.emailVerified),
		twoFactorVerified: Boolean(sessionRow.twoFactorVerified)
	};
	const user: User = {
		id: sessionRow.userId,
		email: sessionRow.email,
		emailVerified: Boolean(sessionRow.emailVerified),
		registered2FA: Boolean(sessionRow.registered2FA)
	};

	if (Date.now() >= session.expiresAt.getTime()) {
		await db.delete(passwordResetSessions).where(eq(passwordResetSessions.id, session.id));

		return { session: null, user: null };
	}

	return { session, user };
}

export async function setPasswordResetSessionAsEmailVerified(sessionId: string): Promise<void> {
	await db
		.update(passwordResetSessions)
		.set({ emailVerified: 1 })
		.where(eq(passwordResetSessions.id, sessionId));
}

export async function setPasswordResetSessionAs2FAVerified(sessionId: string): Promise<void> {
	await db
		.update(passwordResetSessions)
		.set({ twoFactorVerified: 1 })
		.where(eq(passwordResetSessions.id, sessionId));
}

export async function invalidateUserPasswordResetSessions(userId: number): Promise<void> {
	await db.delete(passwordResetSessions).where(eq(passwordResetSessions.userId, userId));
}

export async function validatePasswordResetSessionRequest(
	event: RequestEvent
): Promise<PasswordResetSessionValidationResult> {
	const token = event.cookies.get('password_reset_session') ?? null;
	if (token === null) {
		return { session: null, user: null };
	}

	const result = await validatePasswordResetSessionToken(token);
	if (result.session === null) {
		deletePasswordResetSessionTokenCookie(event);
	}

	return result;
}

export async function setPasswordResetSessionTokenCookie(
	event: RequestEvent,
	token: string,
	expiresAt: Date
): Promise<void> {
	event.cookies.set('password_reset_session', token, {
		expires: expiresAt,
		sameSite: 'lax',
		httpOnly: true,
		path: '/',
		secure: !import.meta.env.DEV
	});
}

export async function deletePasswordResetSessionTokenCookie(event: RequestEvent): Promise<void> {
	event.cookies.set('password_reset_session', '', {
		maxAge: 0,
		sameSite: 'lax',
		httpOnly: true,
		path: '/',
		secure: !import.meta.env.DEV
	});
}

export async function sendPasswordResetEmail(email: string, code: string): Promise<void> {
	//TODO: Use smtp api for sending password reset email
	console.log(`To ${email}: Your reset code is ${code}`);
}

export interface PasswordResetSession {
	id: string;
	userId: number;
	email: string;
	expiresAt: Date;
	code: string;
	emailVerified: boolean;
	twoFactorVerified: boolean;
}

export type PasswordResetSessionValidationResult =
	| { session: PasswordResetSession; user: User }
	| { session: null; user: null };
