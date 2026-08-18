import { describe, expect, it } from 'vitest';
import { schema } from './schema';

describe('2fa setup schema', () => {
	const validKey = 'a'.repeat(28);

	it('accepts a 28-character key and non-empty code', () => {
		expect(schema.safeParse({ key: validKey, code: '12345678' }).success).toBe(true);
	});

	it('rejects a key shorter than 28 characters', () => {
		expect(schema.safeParse({ key: 'a'.repeat(27), code: '12345678' }).success).toBe(false);
	});

	it('rejects a key longer than 28 characters', () => {
		expect(schema.safeParse({ key: 'a'.repeat(29), code: '12345678' }).success).toBe(false);
	});

	it('rejects an empty code', () => {
		expect(schema.safeParse({ key: validKey, code: '' }).success).toBe(false);
	});
});
