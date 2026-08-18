import { describe, expect, it } from 'vitest';
import { schema } from './schema';

describe('verify-email schema', () => {
	it('accepts an 8-character code', () => {
		expect(schema.safeParse({ code: '12345678' }).success).toBe(true);
	});

	it('rejects a code shorter than 8 characters', () => {
		expect(schema.safeParse({ code: '1234567' }).success).toBe(false);
	});

	it('rejects a code longer than 8 characters', () => {
		expect(schema.safeParse({ code: '123456789' }).success).toBe(false);
	});

	it('rejects an empty code', () => {
		expect(schema.safeParse({ code: '' }).success).toBe(false);
	});
});
