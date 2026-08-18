import { describe, expect, it } from 'vitest';
import { schema } from './schema';

describe('login-form schema', () => {
	it('accepts a valid email and password', () => {
		const result = schema.safeParse({ email: 'user@example.com', password: 'password1' });
		expect(result.success).toBe(true);
	});

	it('rejects an invalid email', () => {
		const result = schema.safeParse({ email: 'not-an-email', password: 'password1' });
		expect(result.success).toBe(false);
	});

	it('rejects a password shorter than 8 characters', () => {
		const result = schema.safeParse({ email: 'user@example.com', password: 'short' });
		expect(result.success).toBe(false);
	});

	it('rejects a password longer than 255 characters', () => {
		const result = schema.safeParse({ email: 'user@example.com', password: 'a'.repeat(256) });
		expect(result.success).toBe(false);
	});

	it('accepts a password at the boundary lengths', () => {
		expect(schema.safeParse({ email: 'user@example.com', password: 'a'.repeat(8) }).success).toBe(
			true
		);
		expect(schema.safeParse({ email: 'user@example.com', password: 'a'.repeat(255) }).success).toBe(
			true
		);
	});
});
