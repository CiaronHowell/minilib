import { describe, expect, it } from 'vitest';
import { generateRandomOTP, generateRandomRecoveryCode } from './utils';

const BASE32_UPPER_NO_PADDING = /^[A-Z2-7]+$/;

describe('generateRandomOTP', () => {
	it('returns an 8-character base32 string (5 bytes, unpadded)', () => {
		const code = generateRandomOTP();
		expect(code).toHaveLength(8);
		expect(code).toMatch(BASE32_UPPER_NO_PADDING);
	});

	it('generates different codes across calls', () => {
		const codes = new Set(Array.from({ length: 50 }, () => generateRandomOTP()));
		expect(codes.size).toBeGreaterThan(1);
	});
});

describe('generateRandomRecoveryCode', () => {
	it('returns a 16-character base32 string (10 bytes, unpadded)', () => {
		const code = generateRandomRecoveryCode();
		expect(code).toHaveLength(16);
		expect(code).toMatch(BASE32_UPPER_NO_PADDING);
	});

	it('generates different codes across calls', () => {
		const codes = new Set(Array.from({ length: 50 }, () => generateRandomRecoveryCode()));
		expect(codes.size).toBeGreaterThan(1);
	});
});
