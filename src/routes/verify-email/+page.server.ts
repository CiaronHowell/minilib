import { fail, redirect } from '@sveltejs/kit';
import {
	createEmailVerificationRequest,
	deleteEmailVerificationRequestCookie,
	deleteUserEmailVerificationRequest,
	getUserEmailVerificationRequestFromRequest,
	sendVerificationEmail,
	sendVerificationEmailBucket,
	setEmailVerificationRequestCookie
} from '$lib/server/auth/email-verification';
import { invalidateUserPasswordResetSessions } from '$lib/server/auth/password-reset';
import { updateUserEmailAndSetEmailAsVerified } from '$lib/server/auth/user';
import { ExpiringTokenBucket } from '$lib/server/auth/rate-limit';
import type { RequestEvent } from './$types';
import { message, superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { schema } from './schema';

export async function load(event) {
	if (event.locals.user === null) {
		return redirect(302, '/login');
	}

	let verificationRequest = await getUserEmailVerificationRequestFromRequest(event);
	if (verificationRequest === null || Date.now() >= verificationRequest.expiresAt.getTime()) {
		if (event.locals.user.emailVerified) {
			return redirect(302, '/');
		}

		// Note: We don't need rate limiting since it takes time before requests expire
		verificationRequest = await createEmailVerificationRequest(
			event.locals.user.id,
			event.locals.user.email
		);
		sendVerificationEmail(verificationRequest.email, verificationRequest.code);
		setEmailVerificationRequestCookie(event, verificationRequest);
	}

	return {
		resend: null,
		email: verificationRequest.email,
		form: await superValidate(zod4(schema))
	};
}

const bucket = new ExpiringTokenBucket<number>(5, 60 * 30);

export const actions = {
	verify: verifyCode,
	resend: resendEmail
};

async function verifyCode(event: RequestEvent) {
	const form = await superValidate(event.request, zod4(schema));
	if (event.locals.session === null || event.locals.user === null) {
		form.errors.code = ['Not authenticated'];
		return fail(401, {
			form
		});
	}
	if (event.locals.user.registered2FA && !event.locals.session.twoFactorVerified) {
		form.errors.code = ['Forbidden'];
		return fail(403, {
			form
		});
	}
	if (!bucket.check(event.locals.user.id, 1)) {
		form.errors.code = ['Too many requests'];
		return fail(429, {
			form
		});
	}

	let verificationRequest = await getUserEmailVerificationRequestFromRequest(event);
	if (verificationRequest === null) {
		form.errors.code = ['Not authenticated'];
		return fail(401, {
			form
		});
	}

	if (!bucket.consume(event.locals.user.id, 1)) {
		form.errors.code = ['Too many requests'];
		return fail(400, {
			form
		});
	}

	if (!form.valid) {
		return fail(400, {
			form
		});
	}

	if (Date.now() >= verificationRequest.expiresAt.getTime()) {
		verificationRequest = await createEmailVerificationRequest(
			verificationRequest.userId,
			verificationRequest.email
		);

		sendVerificationEmail(verificationRequest.email, verificationRequest.code);

		form.errors.code = ['The verification code was expired. We sent another code to your inbox.'];
		return {
			form
		};
	}

	if (verificationRequest.code !== form.data.code) {
		form.errors.code = ['Incorrect code.'];
		return fail(400, {
			form
		});
	}

	await deleteUserEmailVerificationRequest(event.locals.user.id);
	await invalidateUserPasswordResetSessions(event.locals.user.id);
	await updateUserEmailAndSetEmailAsVerified(event.locals.user.id, verificationRequest.email);
	deleteEmailVerificationRequestCookie(event);

	if (!event.locals.user.registered2FA) {
		return redirect(302, '/2fa/setup');
	}

	return redirect(302, '/');
}

async function resendEmail(event: RequestEvent) {
	const form = await superValidate(event.request, zod4(schema));
	if (form.errors.code) {
		form.errors.code = [];
	}
	if (event.locals.session === null || event.locals.user === null) {
		return fail(401, {
			form,
			resend: {
				message: 'Not authenticated'
			}
		});
	}

	if (event.locals.user.registered2FA && !event.locals.session.twoFactorVerified) {
		return fail(403, {
			form,
			resend: {
				message: 'Forbidden'
			}
		});
	}

	if (!sendVerificationEmailBucket.check(event.locals.user.id, 1)) {
		return fail(429, {
			form,
			resend: {
				message: 'Too many requests'
			}
		});
	}

	let verificationRequest = await getUserEmailVerificationRequestFromRequest(event);
	if (verificationRequest === null) {
		if (event.locals.user.emailVerified) {
			return fail(403, {
				form,
				resend: {
					message: 'Forbidden'
				}
			});
		}
		if (!sendVerificationEmailBucket.consume(event.locals.user.id, 1)) {
			return fail(429, {
				form,
				resend: {
					message: 'Too many requests'
				}
			});
		}
		verificationRequest = await createEmailVerificationRequest(
			event.locals.user.id,
			event.locals.user.email
		);
	} else {
		if (!sendVerificationEmailBucket.consume(event.locals.user.id, 1)) {
			return fail(429, {
				form,
				resend: {
					message: 'Too many requests'
				}
			});
		}
		verificationRequest = await createEmailVerificationRequest(
			event.locals.user.id,
			verificationRequest.email
		);
	}
	sendVerificationEmail(verificationRequest.email, verificationRequest.code);
	setEmailVerificationRequestCookie(event, verificationRequest);

	return message(form, 'A new code was sent to your inbox.');
}
