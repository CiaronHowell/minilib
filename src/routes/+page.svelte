<script lang="ts">
	import DataTable from './data-table.svelte';
	import { columns } from './columns.js';

	let { data } = $props();
</script>

<div class="flex grow justify-center">
	<div class="flex w-2/3 flex-col p-5">
		<h1 class="text-2xl font-bold">Your Library</h1>
		<DataTable data={data.books} onlyOwner={true} {columns} />
	</div>
</div>
