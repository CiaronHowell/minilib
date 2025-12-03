<script lang="ts">
	import { BookTable, columns } from '$lib/components/custom/book-table';
	import { ManualBookForm } from '$lib/components/custom/manual-book-form';
	import type { PageData } from './$types';
	import AddBookSheet from './add-book-sheet.svelte';

	let { data }: { data: PageData } = $props();
</script>

<div class="flex grow justify-center">
	<div class="flex w-2/3 flex-col p-5">
		<h1 class="text-2xl font-bold">Your Library</h1>
		<BookTable data={data.books} onlyOwner={true} {columns}>
			{#snippet buttons()}
				<!-- Buttons above the data table -->
				<AddBookSheet>
					{#snippet manualBookForm()}
						<ManualBookForm data={data.manualBookForm} />
					{/snippet}
				</AddBookSheet>
			{/snippet}
		</BookTable>
	</div>
</div>
