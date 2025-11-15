import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad, RequestEvent } from './$types';
import { deleteSessionTokenCookie, invalidateSession } from '$lib/server/auth/session';
import type { Book } from './columns';

export const load: PageServerLoad = async (event: RequestEvent) => {
	// Not logged in
	if (event.locals.session === null || event.locals.user === null) {
		return redirect(302, '/login');
	}

	// User needs to verify their email
	if (!event.locals.user.emailVerified) {
		return redirect(302, '/verify-email');
	}

	// User doesn't have 2FA set up
	if (!event.locals.user.registered2FA) {
		return redirect(302, '/2fa/setup');
	}

	// User needs to verify their 2FA
	if (!event.locals.session.twoFactorVerified) {
		return redirect(302, '/2fa');
	}

	const books: Book[] = [
		{
			id: '728ed52f',
			title: 'foo',
			author: 'jimbob',
			status: 'reading',
			owner: 'Ciaron'
		},
		{
			id: '489e1d42',
			title: 'bar',
			author: 'jimbob',
			status: 'read',
			owner: 'Ciaron'
		},
		{
			id: '728ed52f',
			title: 'foo',
			author: 'jimbob',
			status: 'reading',
			owner: 'Ciaron'
		},
		{
			id: '489e1d42',
			title: 'bar',
			author: 'jimbob',
			status: 'read',
			owner: 'Ciaron'
		},
		{
			id: '728ed52f',
			title: 'foo',
			author: 'jimbob',
			status: 'reading',
			owner: 'Ciaron'
		},
		{
			id: '489e1d42',
			title: 'bar',
			author: 'jimbob',
			status: 'read',
			owner: 'Ciaron'
		},
		{
			id: '728ed52f',
			title: 'foo',
			author: 'jimbob',
			status: 'reading',
			owner: 'Ciaron'
		},
		{
			id: '489e1d42',
			title: 'bar',
			author: 'jimbob',
			status: 'read',
			owner: 'Ciaron'
		}
		// ...
	];

	// User is logged in already
	return {
		user: event.locals.user,
		books
	};
};

export const actions: Actions = {
	default: async (event) => {
		if (event.locals.session === null) {
			return fail(401, {
				message: 'Not authenticated'
			});
		}

		await invalidateSession(event.locals.session.id);
		deleteSessionTokenCookie(event);

		return redirect(302, '/login');
	}
};
