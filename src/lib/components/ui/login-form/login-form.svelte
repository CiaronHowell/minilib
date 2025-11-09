<script lang="ts">
	import * as Form from '$lib/components/ui/form';
	import { Input } from '$lib/components/ui/input';
	import { superForm, type SuperValidated, type Infer } from 'sveltekit-superforms';
	import { zod4Client } from 'sveltekit-superforms/adapters';
	import { schema, type Schema } from './schema.js';

	let { data }: { data: { form: SuperValidated<Infer<Schema>> } } = $props();

	const form = superForm(data.form, {
		validators: zod4Client(schema)
	});

	const { form: formData, enhance } = form;
</script>

<form method="POST" class="space-y-5" use:enhance>
	<Form.Field {form} name="email">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label>Email</Form.Label>
				<Input {...props} bind:value={$formData.email} />
			{/snippet}
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>

	<Form.Field {form} name="password">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label>Password</Form.Label>
				<Input {...props} type="password" bind:value={$formData.password} />
			{/snippet}
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>
	<Form.Button>Login</Form.Button>
	<Form.Button href="/register">Register</Form.Button>
</form>
