CREATE TABLE `book_status` (
	`id` text PRIMARY KEY NOT NULL,
	`book` text NOT NULL,
	`user_id` integer NOT NULL,
	`status` text NOT NULL,
	FOREIGN KEY (`book`) REFERENCES `books`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `books` (
	`id` text PRIMARY KEY NOT NULL,
	`owner` integer NOT NULL,
	`isbn` integer,
	`title` text NOT NULL,
	`author` text NOT NULL,
	`lent_to` integer,
	FOREIGN KEY (`owner`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`lent_to`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
