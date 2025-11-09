import type { ColumnDef } from '@tanstack/table-core';

export type Book = {
	id: string;
	title: string;
	author: string;
	status: 'reading' | 'read' | 'loaned_out';
	owner: string; // TODO: Hide this column if view is "Your Library"
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
