import z from 'zod';

export const schema = z.object({
	code: z.string().nonempty({
        error: "Please enter your code"
    })
});

export type Schema = typeof schema;
