ALTER TABLE `book_status` RENAME COLUMN "user_id" TO "user";--> statement-breakpoint
CREATE TABLE `book_activity` (
	`id` text PRIMARY KEY NOT NULL,
	`book` text NOT NULL,
	`user_id` integer NOT NULL,
	`status` text NOT NULL,
	FOREIGN KEY (`book`) REFERENCES `books`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
ALTER TABLE `book_status` ALTER COLUMN "user" TO "user" integer NOT NULL REFERENCES users(id) ON DELETE no action ON UPDATE no action;