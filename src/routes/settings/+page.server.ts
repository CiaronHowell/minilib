import {
	createEmailVerificationRequest,
	sendVerificationEmail,
	sendVerificationEmailBucket,
	setEmailVerificationRequestCookie
} from '$lib/server/auth/email-verification';
import { fail, redirect } from '@sveltejs/kit';
import { checkEmailAvailability } from '$lib/server/auth/email';
import { verifyPasswordHash, verifyPasswordStrength } from '$lib/server/auth/password';
import { getUserPasswordHash, getUserRecoverCode, updateUserPassword } from '$lib/server/auth/user';
import {
	createSession,
	generateSessionToken,
	invalidateUserSessions,
	setSessionTokenCookie
} from '$lib/server/auth/session';
import { ExpiringTokenBucket } from '$lib/server/auth/rate-limit';

import type { Actions, RequestEvent } from './$types';
import type { SessionFlags } from '$lib/server/auth/session';
import { message, superForm, superValidate } from 'sveltekit-superforms';
import { emailSchema, passwordSchema } from './schema';
import { zod4 } from 'sveltekit-superforms/adapters';

const passwordUpdateBucket = new ExpiringTokenBucket<string>(5, 60 * 30);

export async function load(event: RequestEvent) {
	if (event.locals.session === null || event.locals.user === null) {
		return redirect(302, '/login');
	}

	if (event.locals.user.registered2FA && !event.locals.session.twoFactorVerified) {
		return redirect(302, '/2fa');
	}

	let recoveryCode: string | null = null;
	if (event.locals.user.registered2FA) {
		recoveryCode = await getUserRecoverCode(event.locals.user.id);
	}

	return {
		recoveryCode,
		emailForm: await superValidate(zod4(emailSchema)),
		passwordForm: await superValidate(zod4(passwordSchema)),
		user: event.locals.user
	};
}

export const actions: Actions = {
	password: updatePasswordAction,
	email: updateEmailAction
};

async function updatePasswordAction(event: any) {
	const passwordForm = await superValidate(event, zod4(passwordSchema));
	if (event.locals.session === null || event.locals.user === null) {
		passwordForm.errors.newPassword = ['Not authenticated'];
		return fail(401, passwordForm);
	}

	if (event.locals.user.registered2FA && !event.locals.session.twoFactorVerified) {
		passwordForm.errors.newPassword = ['Forbidden'];
		return fail(403, passwordForm);
	}

	if (!passwordUpdateBucket.check(event.locals.session.id, 1)) {
		passwordForm.errors.newPassword = ['Too many requests'];
		return fail(429, passwordForm);
	}

	if (!passwordUpdateBucket.consume(event.locals.session.id, 1)) {
		passwordForm.errors.newPassword = ['Too many requests'];
		return fail(429, passwordForm);
	}

	const passwordHash = await getUserPasswordHash(event.locals.user.id);
	const validPassword = await verifyPasswordHash(passwordHash, passwordForm.data.currPassword);
	if (!validPassword) {
		passwordForm.errors.currPassword = ['Incorrect password'];
		return fail(400, passwordForm);
	}

	passwordUpdateBucket.reset(event.locals.session.id);
	await invalidateUserSessions(event.locals.user.id);
	await updateUserPassword(event.locals.user.id, passwordForm.data.newPassword);

	const sessionToken = generateSessionToken();
	const sessionFlags: SessionFlags = {
		twoFactorVerified: event.locals.session.twoFactorVerified
	};
	const session = await createSession(sessionToken, event.locals.user.id, sessionFlags);
	setSessionTokenCookie(event, sessionToken, session.expiresAt);

	return message(passwordForm, {
		type: 'success',
		text: 'Successfully updated password'
	});
}

async function updateEmailAction(event: any) {
	const emailForm = await superValidate(event, zod4(emailSchema));
	if (event.locals.session === null || event.locals.user === null) {
		emailForm.errors.email = ['Not authenticated'];
		return fail(401, emailForm);
	}

	if (event.locals.user.registered2FA && !event.locals.session.twoFactorVerified) {
		emailForm.errors.email = ['Forbidden'];
		return fail(403, emailForm);
	}

	if (!sendVerificationEmailBucket.check(event.locals.user.id, 1)) {
		emailForm.errors.email = ['Too many requests'];
		return fail(429, emailForm);
	}

	const emailAvailable = await checkEmailAvailability(emailForm.data.email);
	if (!emailAvailable) {
		emailForm.errors.email = ['This email is already used'];
		return fail(400, emailForm);
	}

	if (!sendVerificationEmailBucket.consume(event.locals.user.id, 1)) {
		emailForm.errors.email = ['Too many requests'];
		return fail(429, emailForm);
	}

	const verificationRequest = await createEmailVerificationRequest(
		event.locals.user.id,
		emailForm.data.email
	);
	sendVerificationEmail(verificationRequest.email, verificationRequest.code);
	setEmailVerificationRequestCookie(event, verificationRequest);

	return redirect(302, '/verify-email');
}
