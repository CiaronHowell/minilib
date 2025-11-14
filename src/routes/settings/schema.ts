import z from 'zod';

export const emailSchema = z.object({
	email: z
		.email({ error: 'Please provide a valid email' })
		.nonempty({ error: 'Please provide an email' })
});

export const passwordSchema = z.object({
	// TODO: Needs to match old password
	currPassword: z.string().nonempty({
		error: 'Please provide your current password'
	}),
	newPassword: z
		.string()
		.nonempty({
			error: 'Please provide your new password'
		})
		.min(8, { error: 'Password is less than 8 characters long' })
		.max(255, { error: 'Password is too long, make it below 255 characters' }) // TODO: add password strength validation later on, for now we'll just check length
});

export type EmailSchema = typeof emailSchema;
export type PasswordSchema = typeof passwordSchema;
