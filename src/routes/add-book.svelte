<script lang="ts">
	import * as Sheet from '$lib/components/ui/sheet';
	import { Button, buttonVariants } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label, Root as LabelRoot } from '$lib/components/ui/label';
	import { BookIcon, CircleUserIcon, PlusIcon, SearchIcon, XIcon } from 'lucide-svelte';
	import * as Tabs from '$lib/components/ui/tabs';
	import * as InputGroup from '$lib/components/ui/input-group';
	import { Separator } from '$lib/components/ui/separator';
	import { TextSeparator } from '$lib/components/custom/text-separator';
	import type { Snippet } from 'svelte';

	let isbnInput = $state(['']);

	$effect(() => {
		if (isbnInput.length > 0 && isbnInput[isbnInput.length - 1].trim() !== '') {
			isbnInput.push('');
		}
	});

	const addInput = () => {
		if (isbnInput.length > 0 && isbnInput[isbnInput.length - 1].trim() !== '') {
			isbnInput = [...isbnInput, ''];
		}
	};

	const removeInput = (index: number) => {
		if (isbnInput.length <= 1) {
			return;
		}

		isbnInput = isbnInput.filter((_, i) => {
			return i != index;
		});
		if (isbnInput.length > 1) {
			isbnInput.splice(index, 1); // $state makes this reactive
		}
	};

	const handleKeydown = (e: any, index: number) => {
		if (e.key !== 'Enter') {
			return;
		}
		e.preventDefault();

		const node = document.getElementById(`input-${index + 1}`);
		node?.focus();
	};

	let { manualBookForm }: { manualBookForm: Snippet } = $props();
</script>

<Sheet.Root>
	<Sheet.Trigger class={buttonVariants({ variant: 'outline' })}>
		<PlusIcon />
		Add
	</Sheet.Trigger>
	<Sheet.Content side="right">
		<Sheet.Header class="pb-3">
			<Sheet.Title>Add a new book!</Sheet.Title>
			<Sheet.Description>Add a new book to your library using the options below.</Sheet.Description>
		</Sheet.Header>
		<Separator />
		<div class="px-4 py-3">
			<!-- three options: search by isbn, search by title, or manual -->
			<!-- need to have multi-add for isbn -->

			<Tabs.Root value="isbn">
				<Tabs.List>
					<Tabs.Trigger value="isbn">By ISBN</Tabs.Trigger>
					<Tabs.Trigger value="title">By Title</Tabs.Trigger>
					<Tabs.Trigger value="manual">Manual</Tabs.Trigger>
				</Tabs.List>
				<Tabs.Content value="isbn">
					<div class="flex flex-col gap-3 py-3">
						<div class="flex flex-col gap-1">
							<Label for="isbn" class="text-right">ISBN</Label>
							<!-- TODO: This will be replaced by with a form description -->
							<p class="text-sm text-gray-500">
								You can use the ISBN to search for the details of the book. You may search for
								multiple ISBNs.
							</p>
						</div>
						<div class="flex flex-col gap-2">
							{#each isbnInput as _, index}
								<div class="flex gap-2">
									<Input
										id={`input-${index}`}
										placeholder="123-1-123-12345-1"
										onchange={() => addInput()}
										onkeydown={(e) => handleKeydown(e, index)}
										bind:value={isbnInput[index]}
									/>
									{#if isbnInput.length > 1 && isbnInput[index] != ''}
										<Button size="icon" onclick={() => removeInput(index)}>
											<XIcon />
										</Button>
									{/if}
								</div>
							{/each}
						</div>

						<div class="flex flex-col gap-1">
							<Label>Owner</Label>
							<p class="text-sm text-gray-500">Who to assign the books to.</p>
						</div>

						<InputGroup.Root>
							<!-- TODO: Could make the default the current user -->
							<InputGroup.Input id="owner" />
							<InputGroup.Addon>
								<LabelRoot for="owner"><CircleUserIcon size={16} /></LabelRoot>
							</InputGroup.Addon>
						</InputGroup.Root>

						<div class="flex gap-2">
							<!-- TODO: We will auto ingest any matched ISBNs -->
							<Button>Search and store</Button>
							<Button variant="secondary">Clear</Button>
						</div>

						<TextSeparator text="results" />

						<!-- TODO: Outline matched/ingested ISBNs and list any that have failed -->
						<div>A table of any failed ISBNs would be listed here in a table</div>
					</div>
				</Tabs.Content>

				<Tabs.Content value="title">
					<div class="flex flex-col gap-2">
						<div class="flex flex-col gap-1">
							<Label for="isbn" class="text-right">Book Title</Label>
							<!-- TODO: This will be replaced by with a form description -->
							<p class="text-sm text-gray-500">Search for your book by it's title.</p>
						</div>
						<div class="flex gap-2">
							<InputGroup.Root>
								<InputGroup.Input id="title" placeholder="Search by book title..." />
								<InputGroup.Addon>
									<LabelRoot for="title"><BookIcon size={16} /></LabelRoot>
								</InputGroup.Addon>
							</InputGroup.Root>
							<Button size="icon"><SearchIcon /></Button>
						</div>

						<TextSeparator text="results" />

						<div>Table of search results with the ability to select which book...</div>

						<div>
							A manual book form autofilled by the information fetched based on the book selected...
						</div>
					</div>
				</Tabs.Content>

				<Tabs.Content value="manual">
					<!-- <ManualBookForm data={manualBookFormData} /> -->
					{@render manualBookForm()}
				</Tabs.Content>
			</Tabs.Root>
		</div>
	</Sheet.Content>
</Sheet.Root>
