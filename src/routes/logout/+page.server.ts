import { deleteSessionTokenCookie, invalidateSession } from '$lib/server/session';
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	// Not logged in
	if (event.locals.session === null || event.locals.user === null) {
		return redirect(302, '/login');
	}

	await invalidateSession(event.locals.session.id);
	deleteSessionTokenCookie(event);

	throw redirect(302, '/login');
};
