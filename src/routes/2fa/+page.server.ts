import { totpBucket } from '$lib/server/2fa';
import { fail, redirect } from '@sveltejs/kit';
import { getUserTOTPKey } from '$lib/server/user';
import { verifyTOTP } from '@oslojs/otp';
import { setSessionAs2FAVerified } from '$lib/server/session';

import type { Actions, RequestEvent } from './$types';
import { superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { schema } from './schema';

export async function load(event: RequestEvent) {
	if (event.locals.session === null || event.locals.user === null) {
		return redirect(302, '/login');
	}
	if (!event.locals.user.emailVerified) {
		return redirect(302, '/verify-email');
	}
	if (!event.locals.user.registered2FA) {
		return redirect(302, '/2fa/setup');
	}
	if (event.locals.session.twoFactorVerified) {
		return redirect(302, '/');
	}
	return {
		form: await superValidate(zod4(schema))
	};
}

export const actions: Actions = {
	default: action
};

async function action(event: RequestEvent) {
	const form = await superValidate(event.request, zod4(schema));

	if (event.locals.session === null || event.locals.user === null) {
		form.errors.code = ['Not authenticated'];
		return fail(401, {
			form
		});
	}
	if (
		!event.locals.user.emailVerified ||
		!event.locals.user.registered2FA ||
		event.locals.session.twoFactorVerified
	) {
		form.errors.code = ['Forbidden'];
		return fail(403, {
			form
		});
	}
	if (!totpBucket.check(event.locals.user.id, 1)) {
		form.errors.code = ['Too many requests'];
		return fail(429, {
			form
		});
	}

	if (!totpBucket.consume(event.locals.user.id, 1)) {
		form.errors.code = ['Too many requests'];
		return fail(429, {
			form
		});
	}

	const totpKey = await getUserTOTPKey(event.locals.user.id);
	if (totpKey === null) {
		form.errors.code = ['Forbidden'];
		return fail(403, {
			form
		});
	}

	if (!verifyTOTP(totpKey, 30, 6, form.data.code)) {
		form.errors.code = ['Invalid code'];
		return fail(400, {
			form
		});
	}

	totpBucket.reset(event.locals.user.id);
	await setSessionAs2FAVerified(event.locals.session.id);
	return redirect(302, '/');
}
