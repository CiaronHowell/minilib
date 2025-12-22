import { db } from '.';
import { books } from './schema/books';

type NewBook = typeof books.$inferInsert;

async function addBook(book: NewBook) {
	return db.insert(books).values(book);
}

async function getBooks() {
	return db.select().from(books);
}

export { type NewBook, addBook, getBooks };
