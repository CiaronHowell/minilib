import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/svelte';
import { superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import ManualBookForm from './manual-book-form.svelte';
import { schema } from './schema';

vi.mock('$lib/components/custom/barcode-scanner', () => ({
	BarcodeScanner: () => null
}));

afterEach(() => {
	vi.unstubAllGlobals();
});

async function renderForm() {
	const data = await superValidate(zod4(schema));
	return render(ManualBookForm, { data });
}

describe('ManualBookForm ISBN lookup', () => {
	it('does not call the lookup API while the ISBN is incomplete', async () => {
		const fetchSpy = vi.fn();
		vi.stubGlobal('fetch', fetchSpy);
		await renderForm();

		const isbnInput = screen.getByPlaceholderText('123-1-123-12345-1');
		await fireEvent.input(isbnInput, { target: { value: '123-1-123' } });
		await fireEvent.blur(isbnInput);

		expect(fetchSpy).not.toHaveBeenCalled();
	});

	it('looks up a complete ISBN on blur and auto-fills empty title/author fields', async () => {
		const fetchSpy = vi.fn().mockResolvedValue({
			ok: true,
			json: () => Promise.resolve({ title: 'A Book', author: 'A Author' })
		});
		vi.stubGlobal('fetch', fetchSpy);
		await renderForm();

		const isbnInput = screen.getByPlaceholderText('123-1-123-12345-1');
		await fireEvent.input(isbnInput, { target: { value: '978-0-306-40615-7' } });
		await fireEvent.blur(isbnInput);

		expect(fetchSpy).toHaveBeenCalledWith(
			expect.stringContaining('/api/isbn-lookup?isbn=978-0-306-40615-7')
		);

		const titleInput = await screen.findByPlaceholderText('The Horus Heresy: Horus Rising');
		const authorInput = screen.getByPlaceholderText('Dan Abnett');
		await waitFor(() => expect(titleInput).toHaveValue('A Book'));
		expect(authorInput).toHaveValue('A Author');
	});

	it('does not overwrite title/author fields the user already filled in', async () => {
		const fetchSpy = vi.fn().mockResolvedValue({
			ok: true,
			json: () => Promise.resolve({ title: 'Looked Up Title', author: 'Looked Up Author' })
		});
		vi.stubGlobal('fetch', fetchSpy);
		await renderForm();

		const titleInput = screen.getByPlaceholderText('The Horus Heresy: Horus Rising');
		await fireEvent.input(titleInput, { target: { value: 'My Own Title' } });

		const isbnInput = screen.getByPlaceholderText('123-1-123-12345-1');
		await fireEvent.input(isbnInput, { target: { value: '978-0-306-40615-7' } });
		await fireEvent.blur(isbnInput);

		await waitFor(() => expect(fetchSpy).toHaveBeenCalled());
		expect(titleInput).toHaveValue('My Own Title');
	});

	it('shows a not-found message for a 404 response instead of failing silently', async () => {
		vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 404 }));
		await renderForm();

		const isbnInput = screen.getByPlaceholderText('123-1-123-12345-1');
		await fireEvent.input(isbnInput, { target: { value: '978-0-306-40615-7' } });
		await fireEvent.blur(isbnInput);

		expect(await screen.findByText(/no book found for that isbn/i)).toBeInTheDocument();
	});

	it('shows an error message when the lookup request fails outright', async () => {
		vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network down')));
		await renderForm();

		const isbnInput = screen.getByPlaceholderText('123-1-123-12345-1');
		await fireEvent.input(isbnInput, { target: { value: '978-0-306-40615-7' } });
		await fireEvent.blur(isbnInput);

		expect(await screen.findByText(/couldn't look up that isbn/i)).toBeInTheDocument();
	});
});
