import z from 'zod';

export const schema = z.object({
	key: z
		.string()
		.length(28, {
			error: 'Key is invalid'
		})
		.nonempty(),
	code: z.string().nonempty()
});

export type Schema = typeof schema;
