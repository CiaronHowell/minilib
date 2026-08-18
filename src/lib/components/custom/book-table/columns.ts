import type { ColumnDef } from '@tanstack/table-core';
import type { Books } from '$lib/server/db/schema/books';

// TODO: add a "status" column once per-user book status (see schema/books.ts) is wired into getBooks()
export type Book = Books;

export const columns: ColumnDef<Book>[] = [
	{
		accessorKey: 'title',
		header: 'Title'
	},
	{
		accessorKey: 'author',
		header: 'Author'
	},
	{
		accessorKey: 'owner',
		header: 'Owner' // TODO: Hide this column if view is "Your Library"
	}
];
