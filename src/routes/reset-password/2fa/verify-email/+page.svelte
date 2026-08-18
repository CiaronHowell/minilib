<script lang="ts">
	import { enhance } from '$app/forms';

	import type { ActionData, PageData } from './$types';

	export let data: PageData;
	export let form: ActionData;
</script>

<div class="m-auto flex w-[calc(100%-2rem)] max-w-md flex-col gap-4 rounded-xl border p-6 sm:p-7">
	<div>
		<h1 class="text-2xl font-medium">Verify your email address</h1>
		<p class="text-sm font-light break-words">We sent an 8-digit code to {data.email}.</p>
	</div>
	<form method="post" use:enhance class="flex flex-col gap-2">
		<label for="form-verify.code" class="text-sm font-light">Code</label>
		<input
			id="form-verify.code"
			name="code"
			required
			class="flex h-9 w-full min-w-0 rounded-md border border-input bg-background px-3 py-1 text-base outline-none md:text-sm"
		/>
		<button
			class="mt-2 flex h-9 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
			>Verify</button
		>
		{#if form?.message}<p class="text-sm">{form.message}</p>{/if}
	</form>
</div>
