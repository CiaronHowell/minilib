import { afterEach, describe, expect, it, vi } from 'vitest';
import { lookupIsbn } from './isbn';

afterEach(() => {
	vi.unstubAllGlobals();
});

describe('lookupIsbn', () => {
	it('rejects malformed ISBNs without calling the network', async () => {
		const fetchSpy = vi.fn();
		vi.stubGlobal('fetch', fetchSpy);
		await expect(lookupIsbn('not-an-isbn')).resolves.toBeNull();
		await expect(lookupIsbn('123')).resolves.toBeNull();
		await expect(lookupIsbn('12345678901234')).resolves.toBeNull();
		expect(fetchSpy).not.toHaveBeenCalled();
	});

	it('accepts a 10-digit ISBN and strips hyphens before querying', async () => {
		const fetchSpy = vi.fn().mockResolvedValue({
			ok: true,
			json: () =>
				Promise.resolve({ 'ISBN:0306406152': { title: 'A Book', authors: [{ name: 'A Author' }] } })
		});
		vi.stubGlobal('fetch', fetchSpy);
		const result = await lookupIsbn('0-306-40615-2');
		expect(result).toEqual({ title: 'A Book', author: 'A Author' });
		expect(fetchSpy).toHaveBeenCalledWith(expect.stringContaining('bibkeys=ISBN:0306406152'));
	});

	it('accepts a 13-digit ISBN and strips hyphens before querying', async () => {
		const fetchSpy = vi.fn().mockResolvedValue({
			ok: true,
			json: () =>
				Promise.resolve({
					'ISBN:9780306406157': { title: 'A Book', authors: [{ name: 'A Author' }] }
				})
		});
		vi.stubGlobal('fetch', fetchSpy);
		const result = await lookupIsbn('978-0-306-40615-7');
		expect(result).toEqual({ title: 'A Book', author: 'A Author' });
		expect(fetchSpy).toHaveBeenCalledWith(expect.stringContaining('bibkeys=ISBN:9780306406157'));
	});

	it('returns null when the API response is not ok', async () => {
		vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false }));
		await expect(lookupIsbn('0306406152')).resolves.toBeNull();
	});

	it('returns null when the ISBN is not found in the response', async () => {
		vi.stubGlobal(
			'fetch',
			vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve({}) })
		);
		await expect(lookupIsbn('0306406152')).resolves.toBeNull();
	});

	it('returns null when the book has no title', async () => {
		vi.stubGlobal(
			'fetch',
			vi.fn().mockResolvedValue({
				ok: true,
				json: () => Promise.resolve({ 'ISBN:0306406152': { authors: [{ name: 'A Author' }] } })
			})
		);
		await expect(lookupIsbn('0306406152')).resolves.toBeNull();
	});

	it('defaults author to an empty string when the book has no authors', async () => {
		vi.stubGlobal(
			'fetch',
			vi.fn().mockResolvedValue({
				ok: true,
				json: () => Promise.resolve({ 'ISBN:0306406152': { title: 'A Book' } })
			})
		);
		await expect(lookupIsbn('0306406152')).resolves.toEqual({ title: 'A Book', author: '' });
	});

	it('returns null when the fetch itself throws', async () => {
		vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network down')));
		await expect(lookupIsbn('0306406152')).resolves.toBeNull();
	});
});
