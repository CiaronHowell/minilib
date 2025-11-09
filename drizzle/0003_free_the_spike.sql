ALTER TABLE `email_verification_request` RENAME TO `email_verification_requests`;--> statement-breakpoint
ALTER TABLE `password_reset_session` RENAME TO `password_reset_sessions`;--> statement-breakpoint
ALTER TABLE `session` RENAME TO `sessions`;--> statement-breakpoint
ALTER TABLE `user` RENAME TO `users`;--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_email_verification_requests` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` integer NOT NULL,
	`email` text NOT NULL,
	`code` text NOT NULL,
	`expires_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_email_verification_requests`("id", "user_id", "email", "code", "expires_at") SELECT "id", "user_id", "email", "code", "expires_at" FROM `email_verification_requests`;--> statement-breakpoint
DROP TABLE `email_verification_requests`;--> statement-breakpoint
ALTER TABLE `__new_email_verification_requests` RENAME TO `email_verification_requests`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE TABLE `__new_password_reset_sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` integer NOT NULL,
	`email` text NOT NULL,
	`code` text NOT NULL,
	`expires_at` integer NOT NULL,
	`email_verified` integer DEFAULT 0 NOT NULL,
	`two_factor_verified` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_password_reset_sessions`("id", "user_id", "email", "code", "expires_at", "email_verified", "two_factor_verified") SELECT "id", "user_id", "email", "code", "expires_at", "email_verified", "two_factor_verified" FROM `password_reset_sessions`;--> statement-breakpoint
DROP TABLE `password_reset_sessions`;--> statement-breakpoint
ALTER TABLE `__new_password_reset_sessions` RENAME TO `password_reset_sessions`;--> statement-breakpoint
CREATE TABLE `__new_sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` integer NOT NULL,
	`expires_at` integer NOT NULL,
	`two_factor_verified` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_sessions`("id", "user_id", "expires_at", "two_factor_verified") SELECT "id", "user_id", "expires_at", "two_factor_verified" FROM `sessions`;--> statement-breakpoint
DROP TABLE `sessions`;--> statement-breakpoint
ALTER TABLE `__new_sessions` RENAME TO `sessions`;--> statement-breakpoint
DROP INDEX `user_email_unique`;--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);