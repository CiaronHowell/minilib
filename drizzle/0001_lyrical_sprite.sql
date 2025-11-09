CREATE TABLE `password_reset_session` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` integer NOT NULL,
	`email` text NOT NULL,
	`code` text NOT NULL,
	`expires_at` integer NOT NULL,
	`email_verified` integer DEFAULT 0 NOT NULL,
	`two_factor_verified` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
ALTER TABLE `email_verification_request` DROP COLUMN `email_verified`;--> statement-breakpoint
ALTER TABLE `email_verification_request` DROP COLUMN `two_factor_verified`;