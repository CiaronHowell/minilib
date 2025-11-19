<script lang="ts">
	import * as Form from '$lib/components/ui/form';
	import { schema, type Schema } from './schema';

	import { superForm, type Infer, type SuperValidated } from 'sveltekit-superforms';
	import { zod4Client } from 'sveltekit-superforms/adapters';
	import Input from '$lib/components/ui/input/input.svelte';

	let { data }: { data: { form: SuperValidated<Infer<Schema>> } } = $props();

	const form = superForm(data.form, {
		validators: zod4Client(schema)
	});

	const { form: formData, message, enhance } = form;
</script>

<div
	class="m-auto flex flex-col gap-[var(--form-gap)] rounded-xl border p-5 [--form-gap:--spacing(4)]"
>
	<div>
		<h1 class="font-2xl font-bold">Two-factor authentication</h1>
		<p>Enter the code from your authenticator app.</p>
	</div>
	<form method="post" use:enhance>
		<Form.Field {form} name="code">
			<Form.Control>
				{#snippet children({ props })}
					<Form.Label>Code:</Form.Label>
					<Input {...props} bind:value={$formData.code} autocomplete="one-time-code" />
				{/snippet}
			</Form.Control>
		</Form.Field>
		{#if $message}
			<Form.Description class={$message.type == 'success' ? 'text-green-500' : 'text-red-500'}>
				{$message.text}
			</Form.Description>
		{/if}
		<div class="mt-[var(--form-gap)] flex justify-end gap-2">
			<Form.Button>Verify</Form.Button>
			<Form.Button href="/2fa/reset">Use recovery code</Form.Button>
		</div>
	</form>
</div>
