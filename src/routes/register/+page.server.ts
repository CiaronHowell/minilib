import { superValidate } from 'sveltekit-superforms';
import { schema } from '$lib/components/ui/register-form';
import { zod4 } from 'sveltekit-superforms/adapters';
import { fail, redirect, type Actions } from '@sveltejs/kit';
import type { PageServerLoadEvent } from './$types.js';
import { checkEmailAvailability } from '$lib/server/email.js';
import { RefillingTokenBucket } from '$lib/server/rate-limit.js';
import { createUser } from '$lib/server/user.js';
import {
	createEmailVerificationRequest,
	sendVerificationEmail,
	setEmailVerificationRequestCookie
} from '$lib/server/email-verification.js';
import {
	createSession,
	generateSessionToken,
	setSessionTokenCookie,
	type SessionFlags
} from '$lib/server/session.js';

const ipBucket = new RefillingTokenBucket<string>(3, 10);

export const load = async (event: PageServerLoadEvent) => {
	if (event.locals.session && event.locals.user) {
		if (!event.locals.user.emailVerified) {
			return redirect(302, '/verify-email');
		}

		if (!event.locals.user.registered2FA) {
			return redirect(302, '/2fa/setup');
		}

		if (!event.locals.session.twoFactorVerified) {
			return redirect(302, '/2fa');
		}

		return redirect(302, '/');
	}

	return { form: await superValidate(zod4(schema)) };
};

export const actions: Actions = {
	default: async (event) => {
		const form = await superValidate(event.request, zod4(schema));

		// TODO: Assumes X-Forwarded-For is always included.
		const clientIP = event.request.headers.get('X-Forwarded-For');
		if (clientIP !== null && !ipBucket.check(clientIP, 1)) {
			form.message = 'Too many requests';
			return fail(429, {
				form
			});
		}

		if (!form.valid) {
			return fail(400, {
				form
			});
		}

		const emailAvailable = await checkEmailAvailability(form.data.email);
		if (!emailAvailable) {
			form.errors.email = ['Email already in use'];

			return fail(400, {
				form
			});
		}

		if (clientIP !== null && !ipBucket.consume(clientIP, 1)) {
			form.message = 'Too many requests';
			return fail(429, {
				form
			});
		}

		const user = await createUser(
			form.data.firstName,
			form.data.lastName,
			form.data.email,
			form.data.password
		);
		const emailVerificationRequest = await createEmailVerificationRequest(user.id, user.email);
		sendVerificationEmail(emailVerificationRequest.email, emailVerificationRequest.code);
		setEmailVerificationRequestCookie(event, emailVerificationRequest);

		const sessionFlags: SessionFlags = {
			twoFactorVerified: false
		};
		const sessionToken = generateSessionToken();
		console.log(sessionToken);
		const session = await createSession(sessionToken, user.id, sessionFlags);
		console.log(session);
		setSessionTokenCookie(event, sessionToken, session.expiresAt);

		console.log('hit register');

		throw redirect(303, '/2fa/setup');
	}
};
