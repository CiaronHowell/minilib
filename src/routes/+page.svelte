<script lang="ts">
	import DataTable from './data-table.svelte';
	import { columns } from './columns.js';

	let { data } = $props();
</script>

<div class="flex justify-center p-4">
	<div class="w-2/3 rounded-xl p-5">
		<div class="flex flex-col">
			<h1 class="text-2xl font-bold">Your Library</h1>
			<DataTable data={data.books} onlyOwner={true} {columns} />
		</div>
	</div>
</div>
