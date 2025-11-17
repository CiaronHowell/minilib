<script lang="ts">
	import { BookTable, columns } from '$lib/components/custom/book-table';
	import AddBook from './add-book.svelte';

	let { data } = $props();
</script>

<div class="flex grow justify-center">
	<div class="flex w-2/3 flex-col p-5">
		<h1 class="text-2xl font-bold">Your Library</h1>
		<BookTable data={data.books} onlyOwner={true} {columns}>
			{#snippet buttons()}
				<AddBook />
			{/snippet}
		</BookTable>
	</div>
</div>
