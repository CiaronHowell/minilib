DROP INDEX `emailIdx`;--> statement-breakpoint
CREATE INDEX `email_idx` ON `user` (`email`);