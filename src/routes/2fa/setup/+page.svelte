<script lang="ts">
	import * as Form from '$lib/components/ui/form';
	import { superForm, type Infer, type SuperValidated } from 'sveltekit-superforms';
	import { zod4Client } from 'sveltekit-superforms/adapters';
	import { Input } from '$lib/components/ui/input';
	import { schema, type Schema } from './schema';

	let { data }: { data: { qrcode: any; form: SuperValidated<Infer<Schema>> } } = $props();

	const form = superForm(data.form, {
		validators: zod4Client(schema)
	});
	const message = form.message;
	const { form: formData, enhance } = form;
</script>

<div class="m-auto flex flex-col gap-5 rounded-xl border p-5">
	<h1 class="text-2xl font-medium">Set up two-factor authentication</h1>
	<div class="flex w-full justify-center">
		<div class="size-2/3">
			{@html data.qrcode}
		</div>
	</div>
	<form method="post" use:enhance>
		<Form.Field {form} name="key">
			<Form.Control>
				{#snippet children({ props })}
					<Input {...props} bind:value={$formData.key} hidden />
				{/snippet}
			</Form.Control>
			<Form.FieldErrors />
		</Form.Field>
		<Form.Field {form} name="code">
			<Form.Control>
				{#snippet children({ props })}
					<Form.Label>Verify the code from the app</Form.Label>
					<Input
						{...props}
						bind:value={$formData.code}
						placeholder="Code from an auth app of your choice"
					/>
				{/snippet}
			</Form.Control>
			<Form.FieldErrors />
		</Form.Field>
		{#if $message}
			<Form.Description class={$message.type == 'success' ? 'text-green-500' : 'text-red-500'}>
				{$message.text}
			</Form.Description>
		{/if}
		<div class="flex justify-end gap-2">
			<Form.Button>Save</Form.Button>
			<!-- TODO: Set 2FA as an option -->
			<Form.Button>Skip</Form.Button>
		</div>
	</form>
</div>
