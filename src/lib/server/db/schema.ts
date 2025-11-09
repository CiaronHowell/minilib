import { blob, index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

// Implemented from lucia

export const users = sqliteTable(
	'users',
	{
		id: integer('id').primaryKey(),
		firstName: text('first_name').notNull(),
		lastName: text('last_name').notNull(),
		email: text('email').notNull().unique(),
		passwordHash: text('password_hash').notNull(),
		emailVerified: integer('email_verified').notNull().default(0),
		totpKey: blob('totp_key', { mode: 'buffer' }),
		recoveryCode: blob('recovery_code', { mode: 'buffer' }).notNull()
	},
	(table) => [index('email_idx').on(table.email)]
);

export type Users = typeof users.$inferSelect;

export const sessions = sqliteTable('sessions', {
	id: text('id').primaryKey(),
	userId: integer('user_id')
		.notNull()
		.references(() => users.id),
	expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
	twoFactorVerified: integer('two_factor_verified').notNull().default(0)
});

export type Sessions = typeof sessions.$inferSelect;

export const emailVerificationRequests = sqliteTable('email_verification_requests', {
	id: text('id').primaryKey(),
	userId: integer('user_id')
		.notNull()
		.references(() => users.id),
	email: text('email').notNull(),
	code: text('code').notNull(),
	expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull()
});

export type EmailVerificationRequests = typeof emailVerificationRequests.$inferSelect;

export const passwordResetSessions = sqliteTable('password_reset_sessions', {
	id: text('id').primaryKey(),
	userId: integer('user_id')
		.notNull()
		.references(() => users.id),
	email: text('email').notNull(),
	code: text('code').notNull(),
	expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
	emailVerified: integer('email_verified').notNull().default(0),
	twoFactorVerified: integer('two_factor_verified').notNull().default(0)
});

export type PasswordResetSessions = typeof passwordResetSessions.$inferSelect;
