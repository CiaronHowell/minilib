import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad, RequestEvent } from './$types';
import type { Book } from '$lib/components/custom/book-table';
import { message, superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { schema as manualBookFormSchema } from '$lib/components/custom/manual-book-form';
import { RefillingTokenBucket } from '$lib/server/auth/rate-limit';
import { addBook, getBooks } from '$lib/server/db/books';

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

	// TODO: Look into server pagination rather than client - client will do for now
	// 			https://tanstack.com/table/latest/docs/guide/pagination#should-you-use-client-side-pagination
	const books = await getBooks();

	// User is logged in already
	return {
		user: event.locals.user,
		manualBookForm: await superValidate(zod4(manualBookFormSchema)),
		books
	};
};

const ipBucket = new RefillingTokenBucket<string>(3, 10);

export const actions: Actions = {
	manual: async (event) => {
		if (event.locals.session === null || event.locals.user === null) {
			return redirect(302, '/login');
		}
		if (!event.locals.user.emailVerified) {
			return redirect(302, '/verify-email');
		}
		if (!event.locals.user.registered2FA) {
			return redirect(302, '/2fa/setup');
		}
		if (!event.locals.session.twoFactorVerified) {
			return redirect(302, '/2fa');
		}

		const form = await superValidate(event.request, zod4(manualBookFormSchema));

		const clientIP = event.request.headers.get('X-Forwarded-For');
		if (clientIP !== null && !ipBucket.check(clientIP, 1)) {
			form.message = {
				type: 'error',
				text: 'Too many requests'
			};
			return fail(429, {
				form
			});
		}

		if (!form.valid) {
			return fail(400, {
				form
			});
		}

		if (clientIP !== null && !ipBucket.consume(clientIP, 1)) {
			form.message = {
				type: 'error',
				text: 'Too many requests'
			};
			return fail(429, {
				form
			});
		}

		const isbnStr = form.data.isbn;
		let isbn: number | null = null;
		if (isbnStr) {
			isbn = parseInt(isbnStr.replaceAll('-', ''));
		}

		await addBook({
			title: form.data.title,
			author: form.data.author,
			isbn: isbn,
			owner: event.locals.user.id
		});

		return message(form, { type: 'success', text: 'Successfully stored book in your library!' });
	}
};
