<script lang="ts">
	import * as Form from '$lib/components/ui/form';
	import { schema, type Schema } from './schema';

	import type { ActionData } from './$types';
	import { superForm, type Infer, type SuperValidated } from 'sveltekit-superforms';
	import { zod4Client } from 'sveltekit-superforms/adapters';
	import { Control } from 'formsnap';
	import Input from '$lib/components/ui/input/input.svelte';

	let { data }: { data: { form: SuperValidated<Infer<Schema>> } } = $props();

	const form = superForm(data.form, {
		validators: zod4Client(schema)
	});
	const message = form.message;

	const { form: formData, enhance } = form;
</script>

<div class="m-auto flex flex-col gap-3 rounded-xl border p-5">
	<h1 class="font-2xl font-bold">Two-factor authentication</h1>
	<p>Enter the code from your authenticator app.</p>
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
			<Form.Description>{$message}</Form.Description>
		{/if}
		<Form.Button>Verify</Form.Button>
		<Form.Button href="/2fa/reset">Use recovery code</Form.Button>
	</form>
</div>
