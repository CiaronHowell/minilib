import type { User } from '$lib/server/auth/user';
import type { Session } from '$lib/server/auth/session';
// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		interface Locals {
			user: User | null;
			session: Session | null;
		}

		namespace Superforms {
			type Message = {
				type: 'success' | 'error' | 'info';
				text: string;
			};
		}
	} // interface Error {}
	// interface Locals {}
} // interface PageData {}
// interface PageState {}

// interface Platform {}
export {};
