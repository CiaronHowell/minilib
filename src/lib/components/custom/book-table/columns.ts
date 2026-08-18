import type { ColumnDef } from '@tanstack/table-core';

export type Book = {
	id: number;
	title: string;
	author: string;
	// TODO: not yet populated by getBooks() - book_status tracking isn't wired up yet
	status?: 'reading' | 'read' | 'loaned_out';
	owner: number; // TODO: Hide this column if view is "Your Library"; resolve to a display name
};

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
		accessorKey: 'status',
		header: 'Status'
	},
	{
		accessorKey: 'owner',
		header: 'Owner'
	}
];
