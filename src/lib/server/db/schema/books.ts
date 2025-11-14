import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { users } from './users';

export const books = sqliteTable('books', {
	id: text('id').primaryKey(),
	// TODO: decide whether to enforce an isbn, people might want to add books without
	isbn: integer('isbn'),
	title: text('title').notNull(),
	author: text('author').notNull(),
	owner: integer('owner')
		.notNull()
		.references(() => users.id),
	loanedTo: integer('loaned_to').references(() => users.id)
});
export type Books = typeof books.$inferSelect;

// Current status
// Want to track the activity history for each book. Who's set it as a todo, who's finished it, etc.

enum status {
	Finished = 'finished',
	Reading = 'reading',
	Todo = 'todo',
	LoanedOut = 'loaned out',
	NoStatus = ''
}

const bookStatusList = Object.values(status) as [string, ...string[]];
export const bookStatus = sqliteTable('book_status', {
	id: text('id').primaryKey(),
	book: text('book')
		.notNull()
		.references(() => books.id),
	user: integer('user')
		.notNull()
		.references(() => users.id),
	status: text('status', {
		enum: bookStatusList
	}).notNull()
});
export type BookStatus = typeof bookStatus.$inferSelect;

export const bookActivity = sqliteTable('book_activity', {
	id: text('id').primaryKey(),
	book: text('book')
		.notNull()
		.references(() => books.id),
	user: integer('user_id')
		.notNull()
		.references(() => users.id),
	action: text('status', {
		enum: bookStatusList
	}).notNull()
});
export type BookActivity = typeof bookActivity.$inferSelect;
