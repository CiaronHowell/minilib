import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { lookupIsbn } from '$lib/server/isbn';
import { RefillingTokenBucket } from '$lib/server/auth/rate-limit';

const ipBucket = new RefillingTokenBucket<string>(20, 10);

export const GET: RequestHandler = async (event) => {
	if (event.locals.session === null || event.locals.user === null) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const isbn = event.url.searchParams.get('isbn');
	if (!isbn) {
		return json({ error: 'Missing isbn parameter' }, { status: 400 });
	}

	const clientIP = event.request.headers.get('X-Forwarded-For');
	if (clientIP !== null && !ipBucket.consume(clientIP, 1)) {
		return json({ error: 'Too many requests' }, { status: 429 });
	}

	const result = await lookupIsbn(isbn);
	if (result === null) {
		return json({ error: 'No book found for that ISBN' }, { status: 404 });
	}

	return json(result);
};
