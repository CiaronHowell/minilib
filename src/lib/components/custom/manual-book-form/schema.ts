import { z } from 'zod';

export const schema = z.object({
	title: z.string().nonempty({ error: 'Please provide the title of the book' }).max(100),
	author: z.string().nonempty({ error: 'Please provide the author of the book' }).max(75),
	isbn: z.nullable(z.string().length(17)), // TODO: For now we will only allow ISBN-13 (includes 4 hyphens)
	owner: z.string().nonempty({ error: 'Please select an owner for the book' })
});

export type Schema = typeof schema;
