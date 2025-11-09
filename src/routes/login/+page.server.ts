import { message, superValidate } from 'sveltekit-superforms';
import { schema } from '$lib/components/ui/login-form';
import { zod4 } from 'sveltekit-superforms/adapters';
import { fail, redirect } from '@sveltejs/kit';
import type { PageServerLoadEvent } from './$types.js';
import { RefillingTokenBucket, Throttler } from '$lib/server/rate-limit.js';
import { getUserFromEmail, getUserPasswordHash } from '$lib/server/user.js';
import { verifyPasswordHash } from '$lib/server/password.js';
import {
	createSession,
	generateSessionToken,
	setSessionTokenCookie,
	type SessionFlags
} from '$lib/server/session.js';

export const load = async (event: PageServerLoadEvent) => {
	if (event.locals.session !== null && event.locals.user !== null) {
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

const throttler = new Throttler<number>([0, 1, 2, 4, 8, 16, 30, 60, 180, 300]);
const ipBucket = new RefillingTokenBucket<string>(20, 1);

export const actions = {
	default: async (event) => {
		const form = await superValidate(event.request, zod4(schema));

		const clientIP = event.request.headers.get('X-Forwarded-For');
		if (clientIP !== null && !ipBucket.check(clientIP, 1)) {
			return fail(429, {
				message: 'Too many requests',
				email: ''
			});
		}

		if (!form.valid) {
			return fail(400, {
				form
			});
		}

		const email = form.data.email;
		const password = form.data.password;

		const user = await getUserFromEmail(email);
		if (user === null) {
			form.message = 'email/password was incorrect';
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

		if (!throttler.consume(user.id)) {
			form.message = 'Too many requests';
			return fail(429, {
				form
			});
		}

		const passwordHash = await getUserPasswordHash(user.id);
		const validPassword = await verifyPasswordHash(passwordHash, password);
		if (!validPassword) {
			form.message = 'email/password was incorrect';
			return fail(400, {
				form
			});
		}
		throttler.reset(user.id);

		const sessionFlags: SessionFlags = {
			twoFactorVerified: false
		};
		const sessionToken = generateSessionToken();
		const session = await createSession(sessionToken, user.id, sessionFlags);
		setSessionTokenCookie(event, sessionToken, session.expiresAt);

		if (!user.emailVerified) {
			return redirect(302, '/verify-email');
		}

		if (!user.registered2FA) {
			return redirect(302, '/2fa/setup');
		}

		return redirect(302, '/2fa');
	}
};
