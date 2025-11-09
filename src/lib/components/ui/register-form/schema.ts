import { z } from 'zod';

export const schema = z
	.object({
		firstName: z.string().nonempty({ error: 'Please enter your first name' }).max(50),
		lastName: z.string().nonempty({ error: 'Please enter your last name' }).max(50),
		email: z.email({ error: 'Please provide a valid email address' }),
		password: z
			.string()
			.min(8, { error: 'Password is less than 8 characters long' })
			.max(255, { error: 'Password is too long, make it below 255 characters' }), // TODO: add password strength validation later on, for now we'll just check length
		reenteredPassword: z.string()
	})
	.refine((data) => data.password === data.reenteredPassword, {
		error: "Passwords don't match",
		path: ['reenteredPassword']
	});

export type Schema = typeof schema;
