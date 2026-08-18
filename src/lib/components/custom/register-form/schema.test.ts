import { describe, expect, it } from 'vitest';
import { schema } from './schema';

const valid = {
	firstName: 'Jane',
	lastName: 'Doe',
	email: 'jane@example.com',
	password: 'password1',
	reenteredPassword: 'password1'
};

describe('register-form schema', () => {
	it('accepts valid, matching input', () => {
		expect(schema.safeParse(valid).success).toBe(true);
	});

	it('rejects an empty first name', () => {
		expect(schema.safeParse({ ...valid, firstName: '' }).success).toBe(false);
	});

	it('rejects an empty last name', () => {
		expect(schema.safeParse({ ...valid, lastName: '' }).success).toBe(false);
	});

	it('rejects a first name over 50 characters', () => {
		expect(schema.safeParse({ ...valid, firstName: 'a'.repeat(51) }).success).toBe(false);
	});

	it('rejects an invalid email', () => {
		expect(schema.safeParse({ ...valid, email: 'not-an-email' }).success).toBe(false);
	});

	it('rejects a password shorter than 8 characters', () => {
		expect(
			schema.safeParse({ ...valid, password: 'short', reenteredPassword: 'short' }).success
		).toBe(false);
	});

	it('rejects mismatched passwords and flags the reentered field', () => {
		const result = schema.safeParse({ ...valid, reenteredPassword: 'different1' });
		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error.issues[0].path).toEqual(['reenteredPassword']);
		}
	});
});
