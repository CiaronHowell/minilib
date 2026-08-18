<script lang="ts">
	import { enhance } from '$app/forms';

	import type { ActionData } from './$types';

	export let form: ActionData;
</script>

<div class="m-auto flex w-[calc(100%-2rem)] max-w-md flex-col gap-4 rounded-xl border p-6 sm:p-7">
	<h1 class="text-2xl font-medium">Forgot your password?</h1>
	<form method="post" use:enhance class="flex flex-col gap-2">
		<label for="form-forgot.email" class="text-sm font-light">Email</label>
		<input
			type="email"
			id="form-forgot.email"
			name="email"
			required
			value={form?.email ?? ''}
			class="flex h-9 w-full min-w-0 rounded-md border border-input bg-background px-3 py-1 text-base outline-none md:text-sm"
		/>
		<button
			class="mt-2 flex h-9 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
			>Send</button
		>
		{#if form?.message}<p class="text-sm">{form.message}</p>{/if}
	</form>
	<a href="/login" class="text-sm text-primary underline-offset-4 hover:underline">Sign in</a>
</div>
