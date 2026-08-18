import { describe, expect, it } from 'vitest';
import { schema } from './schema';

describe('2fa schema', () => {
	it('accepts any non-empty code', () => {
		expect(schema.safeParse({ code: '1' }).success).toBe(true);
		expect(schema.safeParse({ code: 'ABCDEFGH' }).success).toBe(true);
	});

	it('rejects an empty code', () => {
		expect(schema.safeParse({ code: '' }).success).toBe(false);
	});

	it('rejects a missing code', () => {
		expect(schema.safeParse({}).success).toBe(false);
	});
});
