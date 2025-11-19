import { createTOTPKeyURI, verifyTOTP } from '@oslojs/otp';
import { fail, redirect } from '@sveltejs/kit';
import { decodeBase64, encodeBase64 } from '@oslojs/encoding';
import { updateUserTOTPKey } from '$lib/server/auth/user';
import { setSessionAs2FAVerified } from '$lib/server/auth/session';
import { RefillingTokenBucket } from '$lib/server/auth/rate-limit';
import { renderSVG } from 'uqr';
import type { Actions } from './$types';
import { superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { schema } from './schema';

const totpUpdateBucket = new RefillingTokenBucket<number>(3, 60 * 10);

export async function load(event) {
	if (event.locals.session === null || event.locals.user === null) {
		return redirect(302, '/login');
	}
	if (!event.locals.user.emailVerified) {
		return redirect(302, '/verify-email');
	}
	if (event.locals.user.registered2FA && !event.locals.session.twoFactorVerified) {
		return redirect(302, '/2fa');
	}

	const totpKey = new Uint8Array(20);
	crypto.getRandomValues(totpKey);
	const encodedTOTPKey = encodeBase64(totpKey);
	const keyURI = createTOTPKeyURI('MiniLib', event.locals.user.email, totpKey, 30, 6);
	const qrcode = renderSVG(keyURI);
	const form = await superValidate(zod4(schema));
	form.data.key = encodedTOTPKey;
	return {
		qrcode,
		form
	};
}

export const actions: Actions = {
	default: action
};

async function action(event: any) {
	const form = await superValidate(event.request, zod4(schema));

	if (event.locals.session === null || event.locals.user === null) {
		form.message = {
			type: 'error',
			text: 'Not authenticated'
		};
		return fail(401, {
			form
		});
	}
	if (!event.locals.user.emailVerified) {
		form.message = {
			type: 'error',
			text: 'Forbidden'
		};
		return fail(403, {
			form
		});
	}
	if (event.locals.user.registered2FA && !event.locals.session.twoFactorVerified) {
		form.message = {
			type: 'error',
			text: 'Forbidden'
		};
		return fail(403, {
			form
		});
	}
	if (!totpUpdateBucket.check(event.locals.user.id, 1)) {
		form.message = {
			type: 'error',
			text: 'Too many requests'
		};
		return fail(429, {
			form
		});
	}

	let key: Uint8Array;
	try {
		key = decodeBase64(form.data.key);
	} catch {
		form.errors.key = ['Invalid key'];
		return fail(400, {
			form
		});
	}

	if (!totpUpdateBucket.consume(event.locals.user.id, 1)) {
		form.message = {
			type: 'error',
			text: 'Too many requests'
		};
		return fail(429, {
			form
		});
	}

	if (!verifyTOTP(key, 30, 6, form.data.code)) {
		form.errors.code = ['Invalid code'];
		return fail(400, { form });
	}

	await updateUserTOTPKey(event.locals.session.userId, key);
	await setSessionAs2FAVerified(event.locals.session.id);

	return redirect(302, '/recovery-code');
}
