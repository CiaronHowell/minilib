import { describe, expect, it, vi } from 'vitest';

vi.mock('$env/dynamic/private', () => ({
	env: { ENCRYPTION_KEY: 'AAAAAAAAAAAAAAAAAAAAAA==' }
}));

const { decrypt, decryptToString, encrypt, encryptString } = await import('./encryption');

describe('encrypt/decrypt', () => {
	it('round-trips arbitrary bytes', () => {
		const data = new Uint8Array([1, 2, 3, 4, 250, 0, 255]);
		expect(decrypt(encrypt(data))).toEqual(data);
	});

	it('round-trips strings, including empty and unicode', () => {
		for (const s of ['', 'hello world', '日本語', 'a'.repeat(1000)]) {
			expect(decryptToString(encryptString(s))).toBe(s);
		}
	});

	it('produces different ciphertext for the same plaintext (random IV)', () => {
		const data = new TextEncoder().encode('same input');
		const a = encrypt(data);
		const b = encrypt(data);
		expect(a).not.toEqual(b);
	});

	it('rejects data shorter than iv+tag length', () => {
		expect(() => decrypt(new Uint8Array(31))).toThrow('Invalid data');
	});

	it('rejects tampered ciphertext (auth tag mismatch)', () => {
		const encrypted = encrypt(new TextEncoder().encode('secret'));
		const tampered = new Uint8Array(encrypted);
		tampered[tampered.length - 1] ^= 0xff;
		expect(() => decrypt(tampered)).toThrow();
	});
});
