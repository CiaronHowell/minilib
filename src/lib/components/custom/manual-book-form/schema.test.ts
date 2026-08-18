import { describe, expect, it } from 'vitest';
import { schema } from './schema';

const valid = {
	title: 'The Book',
	author: 'The Author',
	isbn: '9780306406157',
	owner: '1'
};

describe('manual-book-form schema', () => {
	it('accepts valid input with a plain 13-digit ISBN', () => {
		expect(schema.safeParse(valid).success).toBe(true);
	});

	it('accepts a hyphenated ISBN-13 that is 13 digits once hyphens are stripped', () => {
		expect(schema.safeParse({ ...valid, isbn: '978-0-306-40615-7' }).success).toBe(true);
	});

	it('accepts a null ISBN (book without a known ISBN)', () => {
		expect(schema.safeParse({ ...valid, isbn: null }).success).toBe(true);
	});

	it('rejects an ISBN-10 (only 10 digits)', () => {
		expect(schema.safeParse({ ...valid, isbn: '0306406152' }).success).toBe(false);
	});

	it('rejects an ISBN with the wrong digit count after stripping hyphens', () => {
		expect(schema.safeParse({ ...valid, isbn: '978-0-306-4061' }).success).toBe(false);
	});

	it('rejects an empty title', () => {
		expect(schema.safeParse({ ...valid, title: '' }).success).toBe(false);
	});

	it('rejects a title over 100 characters', () => {
		expect(schema.safeParse({ ...valid, title: 'a'.repeat(101) }).success).toBe(false);
	});

	it('rejects an empty author', () => {
		expect(schema.safeParse({ ...valid, author: '' }).success).toBe(false);
	});

	it('rejects an author over 75 characters', () => {
		expect(schema.safeParse({ ...valid, author: 'a'.repeat(76) }).success).toBe(false);
	});

	it('rejects an empty owner', () => {
		expect(schema.safeParse({ ...valid, owner: '' }).success).toBe(false);
	});
});
