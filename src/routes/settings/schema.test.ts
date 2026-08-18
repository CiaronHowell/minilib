import { describe, expect, it } from 'vitest';
import { emailSchema, passwordSchema } from './schema';

describe('settings emailSchema', () => {
	it('accepts a valid email', () => {
		expect(emailSchema.safeParse({ email: 'user@example.com' }).success).toBe(true);
	});

	it('rejects an empty email', () => {
		expect(emailSchema.safeParse({ email: '' }).success).toBe(false);
	});

	it('rejects a malformed email', () => {
		expect(emailSchema.safeParse({ email: 'not-an-email' }).success).toBe(false);
	});
});

describe('settings passwordSchema', () => {
	const valid = { currPassword: 'oldpassword1', newPassword: 'newpassword1' };

	it('accepts valid current and new passwords', () => {
		expect(passwordSchema.safeParse(valid).success).toBe(true);
	});

	it('rejects an empty current password', () => {
		expect(passwordSchema.safeParse({ ...valid, currPassword: '' }).success).toBe(false);
	});

	it('rejects a new password shorter than 8 characters', () => {
		expect(passwordSchema.safeParse({ ...valid, newPassword: 'short' }).success).toBe(false);
	});

	it('rejects a new password longer than 255 characters', () => {
		expect(passwordSchema.safeParse({ ...valid, newPassword: 'a'.repeat(256) }).success).toBe(
			false
		);
	});
});
