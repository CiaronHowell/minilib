import { generateRandomOTP } from './utils';
import { db } from './db';
import { ExpiringTokenBucket } from './rate-limit';
import { encodeBase32 } from '@oslojs/encoding';

import type { RequestEvent } from '@sveltejs/kit';
import { emailVerificationRequests, type EmailVerificationRequests } from './db/schema/users';
import { and, eq } from 'drizzle-orm';

export async function getUserEmailVerificationRequest(
	userId: number,
	id: string
): Promise<EmailVerificationRequests | null> {
	const row = await db
		.select()
		.from(emailVerificationRequests)
		.where(and(eq(emailVerificationRequests.id, id), eq(emailVerificationRequests.userId, userId)));

	if (row === null) {
		return row;
	}

	const res = row[0];
	const request: EmailVerificationRequests = {
		id: res.id,
		userId: res.userId,
		code: res.code,
		email: res.email,
		expiresAt: new Date(res.expiresAt)
	};
	return request;
}

export async function createEmailVerificationRequest(
	userId: number,
	email: string
): Promise<EmailVerificationRequests> {
	deleteUserEmailVerificationRequest(userId);

	const idBytes = new Uint8Array(20);
	crypto.getRandomValues(idBytes);
	const id = encodeBase32(idBytes).toLowerCase();

	const code = generateRandomOTP();
	const expiresAt = new Date(Date.now() + 1000 * 60 * 10);

	const request: EmailVerificationRequests = {
		id,
		userId,
		code,
		email,
		expiresAt
	};
	await db.insert(emailVerificationRequests).values(request);

	return request;
}

export async function deleteUserEmailVerificationRequest(userId: number): Promise<void> {
	await db.delete(emailVerificationRequests).where(eq(emailVerificationRequests.userId, userId));
}

export function sendVerificationEmail(email: string, code: string): void {
	// TODO: Link this up to an smtp API
	console.log(`To ${email}: Your verification code is ${code}`);
}

export function setEmailVerificationRequestCookie(
	event: RequestEvent,
	request: EmailVerificationRequests
): void {
	event.cookies.set('email_verification', request.id, {
		httpOnly: true,
		path: '/',
		secure: import.meta.env.PROD,
		sameSite: 'lax',
		expires: request.expiresAt
	});
}

export function deleteEmailVerificationRequestCookie(event: RequestEvent): void {
	event.cookies.set('email_verification', '', {
		httpOnly: true,
		path: '/',
		secure: import.meta.env.PROD,
		sameSite: 'lax',
		maxAge: 0
	});
}

export async function getUserEmailVerificationRequestFromRequest(
	event: RequestEvent
): Promise<EmailVerificationRequests | null> {
	if (event.locals.user === null) {
		return null;
	}

	const id = event.cookies.get('email_verification') ?? null;
	if (id === null) {
		return null;
	}

	const request = await getUserEmailVerificationRequest(event.locals.user.id, id);
	if (request === null) {
		deleteEmailVerificationRequestCookie(event);
	}

	return request;
}

export const sendVerificationEmailBucket = new ExpiringTokenBucket<number>(3, 60 * 10);
