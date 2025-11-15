PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_book_activity` (
	`id` integer PRIMARY KEY NOT NULL,
	`book` text NOT NULL,
	`user_id` integer NOT NULL,
	`status` text NOT NULL,
	FOREIGN KEY (`book`) REFERENCES `books`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_book_activity`("id", "book", "user_id", "status") SELECT "id", "book", "user_id", "status" FROM `book_activity`;--> statement-breakpoint
DROP TABLE `book_activity`;--> statement-breakpoint
ALTER TABLE `__new_book_activity` RENAME TO `book_activity`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE TABLE `__new_book_status` (
	`id` integer PRIMARY KEY NOT NULL,
	`book` text NOT NULL,
	`user` integer NOT NULL,
	`status` text NOT NULL,
	FOREIGN KEY (`book`) REFERENCES `books`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_book_status`("id", "book", "user", "status") SELECT "id", "book", "user", "status" FROM `book_status`;--> statement-breakpoint
DROP TABLE `book_status`;--> statement-breakpoint
ALTER TABLE `__new_book_status` RENAME TO `book_status`;--> statement-breakpoint
CREATE TABLE `__new_books` (
	`id` integer PRIMARY KEY NOT NULL,
	`isbn` integer,
	`title` text NOT NULL,
	`author` text NOT NULL,
	`owner` integer NOT NULL,
	`loaned_to` integer,
	FOREIGN KEY (`owner`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`loaned_to`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_books`("id", "isbn", "title", "author", "owner", "loaned_to") SELECT "id", "isbn", "title", "author", "owner", "loaned_to" FROM `books`;--> statement-breakpoint
DROP TABLE `books`;--> statement-breakpoint
ALTER TABLE `__new_books` RENAME TO `books`;