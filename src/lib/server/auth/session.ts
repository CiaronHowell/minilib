import { db } from '$lib/server/db';
import { encodeBase32LowerCaseNoPadding, encodeHexLowerCase } from '@oslojs/encoding';
import { sha256 } from '@oslojs/crypto/sha2';
import type { User } from './user';
import type { RequestEvent } from '@sveltejs/kit';
import { eq, getTableColumns, sql } from 'drizzle-orm';
import { sessions, users } from '$lib/server/db/schema/users';

export async function validateSessionToken(token: string): Promise<SessionValidationResult> {
	const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
	const row = await db
		.select({
			...getTableColumns(sessions),
			...getTableColumns(users),
			registered2FA: sql<number>`IIF(totp_key IS NOT NULL, 1, 0)`
		})
		.from(sessions)
		.innerJoin(users, eq(sessions.userId, users.id))
		.where(eq(sessions.id, sessionId));

	if (row === null || row.length < 1) {
		return { session: null, user: null };
	}

	const sessionRow = row[0];
	const session: Session = {
		id: sessionId,
		userId: sessionRow.userId,
		expiresAt: new Date(sessionRow.expiresAt),
		twoFactorVerified: Boolean(sessionRow.twoFactorVerified)
	};

	const user: User = {
		id: sessionRow.userId,
		firstName: sessionRow.firstName,
		lastName: sessionRow.lastName,
		email: sessionRow.email,
		emailVerified: Boolean(sessionRow.emailVerified),
		registered2FA: Boolean(sessionRow.registered2FA)
	};

	if (Date.now() >= session.expiresAt.getTime()) {
		await db.delete(sessions).where(eq(sessions.id, sessionId));

		return { session: null, user: null };
	}

	if (Date.now() >= session.expiresAt.getTime() - 1000 * 60 * 60 * 24 * 15) {
		session.expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);

		await db
			.update(sessions)
			.set({ expiresAt: session.expiresAt })
			.where(eq(sessions.id, sessionId));
	}

	return { session, user };
}

export async function invalidateSession(sessionId: string): Promise<void> {
	await db.delete(sessions).where(eq(sessions.id, sessionId));
}

export async function invalidateUserSessions(userId: number): Promise<void> {
	await db.delete(sessions).where(eq(sessions.userId, userId));
}

export function setSessionTokenCookie(event: any, token: string, expiresAt: Date): void {
	event.cookies.set('session', token, {
		httpOnly: true,
		path: '/',
		secure: import.meta.env.PROD,
		sameSite: 'lax',
		expires: expiresAt
	});
}

export function deleteSessionTokenCookie(event: RequestEvent): void {
	event.cookies.set('session', '', {
		httpOnly: true,
		path: '/',
		secure: import.meta.env.PROD,
		sameSite: 'lax',
		maxAge: 0
	});
}

export function generateSessionToken(): string {
	const tokenBytes = new Uint8Array(20);
	crypto.getRandomValues(tokenBytes);
	const token = encodeBase32LowerCaseNoPadding(tokenBytes).toLowerCase();
	return token;
}

export async function createSession(
	token: string,
	userId: number,
	flags: SessionFlags
): Promise<Session> {
	const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
	const session: Session = {
		id: sessionId,
		userId,
		expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
		twoFactorVerified: flags.twoFactorVerified
	};

	await db.insert(sessions).values({
		id: session.id,
		userId: session.userId,
		expiresAt: session.expiresAt,
		twoFactorVerified: Number(session.twoFactorVerified)
	});

	return session;
}

export async function setSessionAs2FAVerified(sessionId: string): Promise<void> {
	await db.update(sessions).set({ twoFactorVerified: 1 }).where(eq(sessions.id, sessionId));
}

export interface SessionFlags {
	twoFactorVerified: boolean;
}

export interface Session extends SessionFlags {
	id: string;
	expiresAt: Date;
	userId: number;
}

type SessionValidationResult = { session: Session; user: User } | { session: null; user: null };
