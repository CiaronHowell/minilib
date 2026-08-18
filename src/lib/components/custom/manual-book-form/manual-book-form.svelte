<script lang="ts">
	import { Root as LabelRoot } from '$lib/components/ui/label';
	import * as InputGroup from '$lib/components/ui/input-group';
	import * as Form from '$lib/components/ui/form';
	import { Input } from '$lib/components/ui/input';
	import { superForm, type SuperValidated, type Infer } from 'sveltekit-superforms';
	import { zod4Client } from 'sveltekit-superforms/adapters';
	import { schema, type Schema } from './schema.js';
	import { CircleUserIcon } from 'lucide-svelte';
	import { BarcodeScanner } from '$lib/components/custom/barcode-scanner';

	let { data }: { data: SuperValidated<Infer<Schema>> } = $props();

	const form = superForm(data, {
		validators: zod4Client(schema)
	});

	const { form: formData, enhance, submitting } = form;
	const message = form.message;

	let isbnLookupStatus = $state<'idle' | 'loading' | 'not-found' | 'error'>('idle');

	async function lookupIsbn() {
		const isbn = $formData.isbn;
		if (!isbn || isbn.replaceAll('-', '').length !== 13) {
			return;
		}

		isbnLookupStatus = 'loading';
		try {
			const res = await fetch(`/api/isbn-lookup?isbn=${encodeURIComponent(isbn)}`);
			if (!res.ok) {
				isbnLookupStatus = res.status === 404 ? 'not-found' : 'error';
				return;
			}

			const result: { title: string; author: string } = await res.json();
			if (!$formData.title) $formData.title = result.title;
			if (!$formData.author && result.author) $formData.author = result.author;
			isbnLookupStatus = 'idle';
		} catch {
			isbnLookupStatus = 'error';
		}
	}

	function handleScan(isbn: string) {
		$formData.isbn = isbn;
		lookupIsbn();
	}
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
				<Form.Label><span class="text-red-600">*</span>Book title</Form.Label>
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
				<Form.Label><span class="text-red-600">*</span>Author</Form.Label>
				<Input {...props} bind:value={$formData.author} placeholder="Dan Abnett" />
			{/snippet}
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>

	<Form.Field {form} name="isbn">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label>ISBN-13</Form.Label>
				<Form.Description>Scan or type an ISBN to auto-fill the title and author.</Form.Description>
				<Input
					{...props}
					bind:value={$formData.isbn}
					onblur={lookupIsbn}
					placeholder="123-1-123-12345-1"
				/>
				{#if isbnLookupStatus === 'loading'}
					<p class="text-sm text-gray-500">Looking up book details…</p>
				{:else if isbnLookupStatus === 'not-found'}
					<p class="text-sm text-gray-500">
						No book found for that ISBN — fill in the details manually.
					</p>
				{:else if isbnLookupStatus === 'error'}
					<p class="text-sm text-gray-500">
						Couldn't look up that ISBN right now — fill in the details manually.
					</p>
				{/if}
				<BarcodeScanner onScan={handleScan} />
			{/snippet}
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>

	<Form.Field {form} name="owner">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label><span class="text-red-600">*</span>Owner</Form.Label>
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

	<Form.Button disabled={$submitting}>{$submitting ? 'Adding…' : 'Add Book'}</Form.Button>
	<Form.Button type="reset" onclick={() => ($message = undefined)}>Clear</Form.Button>
</form>
