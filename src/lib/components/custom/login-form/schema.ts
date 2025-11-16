import { z } from 'zod';

export const schema = z.object({
	email: z.email(),
	password: z.string().min(8).max(255) // TODO: add password strength validation later on, for now we'll just check length
});

export type Schema = typeof schema;
