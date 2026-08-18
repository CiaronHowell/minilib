<script lang="ts">
	import { enhance } from '$app/forms';

	import type { ActionData } from './$types';

	export let form: ActionData;
</script>

<div class="m-auto flex w-[calc(100%-2rem)] max-w-md flex-col gap-4 rounded-xl border p-6 sm:p-7">
	<div>
		<h1 class="text-2xl font-medium">Two-factor authentication</h1>
		<p class="text-sm font-light">Enter the code from your authenticator app.</p>
	</div>
	<form method="post" use:enhance action="?/totp" class="flex flex-col gap-2">
		<label for="form-totp.code" class="text-sm font-light">Code</label>
		<input
			id="form-totp.code"
			name="code"
			required
			class="flex h-9 w-full min-w-0 rounded-md border border-input bg-background px-3 py-1 text-base outline-none md:text-sm"
		/>
		<button
			class="mt-2 flex h-9 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
			>Verify</button
		>
		{#if form?.totp?.message}<p class="text-sm">{form.totp.message}</p>{/if}
	</form>
	<section class="flex flex-col gap-2 border-t pt-4">
		<h2 class="font-semibold">Use your recovery code instead</h2>
		<form method="post" use:enhance action="?/recovery_code" class="flex flex-col gap-2">
			<label for="form-recovery-code.code" class="text-sm font-light">Recovery code</label>
			<input
				id="form-recovery-code.code"
				name="code"
				required
				class="flex h-9 w-full min-w-0 rounded-md border border-input bg-background px-3 py-1 text-base outline-none md:text-sm"
			/>
			<button
				class="mt-2 flex h-9 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
				>Verify</button
			>
			{#if form?.recoveryCode?.message}<p class="text-sm">{form.recoveryCode.message}</p>{/if}
		</form>
	</section>
</div>
