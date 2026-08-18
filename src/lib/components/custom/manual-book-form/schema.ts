import { z } from 'zod';

export const schema = z.object({
	title: z.string().nonempty({ error: 'Please provide the title of the book' }).max(100),
	author: z.string().nonempty({ error: 'Please provide the author of the book' }).max(75),
	// Accepts ISBN-13 with or without hyphens (e.g. "123-1-123-12345-1" or "1231123123451"),
	// since scanned barcodes come through as plain digits.
	isbn: z.nullable(
		z.string().refine((val) => val.replaceAll('-', '').length === 13, {
			error: 'Please provide a valid ISBN-13'
		})
	),
	owner: z.string().nonempty({ error: 'Please select an owner for the book' })
});

export type Schema = typeof schema;
