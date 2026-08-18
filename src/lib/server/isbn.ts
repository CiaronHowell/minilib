export interface IsbnLookupResult {
	title: string;
	author: string;
}

interface OpenLibraryBook {
	title?: string;
	authors?: { name: string }[];
}

export async function lookupIsbn(isbn: string): Promise<IsbnLookupResult | null> {
	const cleaned = isbn.replaceAll('-', '');
	if (!/^\d{10}(\d{3})?$/.test(cleaned)) {
		return null;
	}

	try {
		const res = await fetch(
			`https://openlibrary.org/api/books?bibkeys=ISBN:${cleaned}&format=json&jscmd=data`
		);
		if (!res.ok) {
			return null;
		}

		const data = (await res.json()) as Record<string, OpenLibraryBook>;
		const book = data[`ISBN:${cleaned}`];
		if (!book?.title) {
			return null;
		}

		return {
			title: book.title,
			author: book.authors?.[0]?.name ?? ''
		};
	} catch {
		return null;
	}
}
