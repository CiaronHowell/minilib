import { afterEach, describe, expect, it, vi } from 'vitest';
import { hashPassword, verifyPasswordHash, verifyPasswordStrength } from './password';

describe('hashPassword / verifyPasswordHash', () => {
	it('produces a hash that verifies against the original password', async () => {
		const hash = await hashPassword('correct horse battery staple');
		await expect(verifyPasswordHash(hash, 'correct horse battery staple')).resolves.toBe(true);
	});

	it('rejects an incorrect password against a given hash', async () => {
		const hash = await hashPassword('correct horse battery staple');
		await expect(verifyPasswordHash(hash, 'wrong password')).resolves.toBe(false);
	});

	it('produces different hashes for the same password (random salt)', async () => {
		const a = await hashPassword('same password');
		const b = await hashPassword('same password');
		expect(a).not.toBe(b);
	});
});

describe('verifyPasswordStrength', () => {
	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it('rejects passwords shorter than 8 characters without calling the network', async () => {
		const fetchSpy = vi.fn();
		vi.stubGlobal('fetch', fetchSpy);
		await expect(verifyPasswordStrength('short')).resolves.toBe(false);
		expect(fetchSpy).not.toHaveBeenCalled();
	});

	it('rejects passwords longer than 255 characters without calling the network', async () => {
		const fetchSpy = vi.fn();
		vi.stubGlobal('fetch', fetchSpy);
		await expect(verifyPasswordStrength('a'.repeat(256))).resolves.toBe(false);
		expect(fetchSpy).not.toHaveBeenCalled();
	});

	it('rejects a password whose hash suffix appears in the pwned-passwords range response', async () => {
		// sha1("password123") = cbfdac6008f9cab4083784cbd1874f76618d2a97
		// prefix "CBFDA", suffix "C6008F9CAB4083784CBD1874F76618D2A97"
		vi.stubGlobal(
			'fetch',
			vi.fn().mockResolvedValue({
				text: () =>
					Promise.resolve(
						'C6008F9CAB4083784CBD1874F76618D2A97:5\r\nOTHERSUFFIX00000000000000000000000:1'
					)
			})
		);
		await expect(verifyPasswordStrength('password123')).resolves.toBe(false);
	});

	it('accepts a password whose hash does not appear in the pwned-passwords range response', async () => {
		vi.stubGlobal(
			'fetch',
			vi.fn().mockResolvedValue({
				text: () => Promise.resolve('DOESNOTMATCHANYTHING000000000000000:1')
			})
		);
		await expect(verifyPasswordStrength('some unique passphrase')).resolves.toBe(true);
	});

	it('queries the HIBP range endpoint using only the first 5 hash characters', async () => {
		const fetchSpy = vi.fn().mockResolvedValue({ text: () => Promise.resolve('') });
		vi.stubGlobal('fetch', fetchSpy);
		await verifyPasswordStrength('password123');
		expect(fetchSpy).toHaveBeenCalledWith('https://api.pwnedpasswords.com/range/cbfda');
	});
});
