<script lang="ts">
	import { Root as LabelRoot } from '$lib/components/ui/label';
	import * as InputGroup from '$lib/components/ui/input-group';
	import * as Form from '$lib/components/ui/form';
	import { Input } from '$lib/components/ui/input';
	import { superForm, type SuperValidated, type Infer } from 'sveltekit-superforms';
	import { zod4Client } from 'sveltekit-superforms/adapters';
	import { schema, type Schema } from './schema.js';
	import { CircleUserIcon } from 'lucide-svelte';

	let { data }: { data: SuperValidated<Infer<Schema>> } = $props();

	const form = superForm(data, {
		validators: zod4Client(schema)
	});

	const { form: formData, enhance } = form;
	const message = form.message;
</script>

<form method="POST" class="space-y-4" action="?/manual" use:enhance>
	<div>
		<h class="text-sm text-gray-600">
			Fields marked with <span class="text-red-600">*</span> are required.
		</h>
	</div>

	<Form.Field {form} name="title">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label>Book title<span class="text-red-600">*</span></Form.Label>
				<Input
					{...props}
					bind:value={$formData.title}
					placeholder="The Horus Heresy: Horus Rising"
				/>
			{/snippet}
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>

	<Form.Field {form} name="author">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label>Author</Form.Label>
				<Input {...props} bind:value={$formData.author} placeholder="Dan Abnett" />
			{/snippet}
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>

	<Form.Field {form} name="isbn">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label>ISBN-13</Form.Label>
				<Input {...props} bind:value={$formData.isbn} placeholder="123-1-123-12345-1" />
			{/snippet}
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>

	<Form.Field {form} name="owner">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label>Book Owner<span class="text-red-600">*</span></Form.Label>
				<Form.Description>Who bought the book?</Form.Description>
				<InputGroup.Root>
					<!-- TODO: Could make the default the current user -->
					<InputGroup.Input {...props} bind:value={$formData.owner} placeholder="Ciaron Howell" />
					<InputGroup.Addon>
						<LabelRoot><CircleUserIcon size={16} /></LabelRoot>
					</InputGroup.Addon>
				</InputGroup.Root>
			{/snippet}
		</Form.Control>
		<Form.FieldErrors />
		{#if $message}
			<Form.Description class={$message.type == 'success' ? 'text-green-600' : 'text-red-600'}>
				{$message.text}
			</Form.Description>
		{/if}
	</Form.Field>

	<Form.Button>Add Book</Form.Button>
	<Form.Button type="reset" onclick={() => ($message = undefined)}>Clear</Form.Button>
</form>
