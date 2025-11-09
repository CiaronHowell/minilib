import { z } from 'zod';

export const schema = z.object({
	code: z.string().length(8, {
		error: 'Your one-time password should be exactly 8 characters.'
	})
});

export type Schema = typeof schema;
