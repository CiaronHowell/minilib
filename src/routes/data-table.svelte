<script lang="ts" generics="TData, TValue">
	import {
		type ColumnDef,
		type PaginationState,
		getCoreRowModel,
		getPaginationRowModel,
		getFilteredRowModel,
		type ColumnFiltersState
	} from '@tanstack/table-core';
	import { createSvelteTable, FlexRender } from '$lib/components/ui/data-table/index.js';
	import * as Table from '$lib/components/ui/table/index.js';
	import { Button } from '$lib/components/ui/button';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { Input } from '$lib/components/ui/input';
	import * as Select from '$lib/components/ui/select';
	import { Separator } from '$lib/components/ui/separator';
	import AddBook from './add-book.svelte';

	type DataTableProps<TData, TValue> = {
		columns: ColumnDef<TData, TValue>[];
		data: TData[];
	};

	let { data, columns, onlyOwner }: DataTableProps<TData, TValue> & { onlyOwner: boolean } =
		$props();

	if (onlyOwner) {
		columns = columns.filter((col) => {
			return col.header?.toString().toLowerCase() != 'owner';
		});
	}

	const pageSizes = [5, 10, 15];

	let pagination = $state<PaginationState>({ pageIndex: 0, pageSize: pageSizes[0] });
	let columnFilters = $state<ColumnFiltersState>([]);

	const table = createSvelteTable({
		get data() {
			return data;
		},
		columns,
		state: {
			get pagination() {
				return pagination;
			},
			get columnFilters() {
				return columnFilters;
			}
		},
		onPaginationChange: (updater) => {
			if (typeof updater === 'function') {
				pagination = updater(pagination);
			} else {
				pagination = updater;
			}
		},
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		onColumnFiltersChange: (updater) => {
			if (typeof updater === 'function') {
				columnFilters = updater(columnFilters);
			} else {
				columnFilters = updater;
			}
		}
	});
</script>

<div class="flex flex-col gap-3 py-4">
	<div class="flex justify-between">
		<Input
			placeholder="Filter by title..."
			value={(table.getColumn('title')?.getFilterValue() as string) ?? ''}
			oninput={(e) => table.getColumn('title')?.setFilterValue(e.currentTarget.value)}
			onchange={(e) => table.getColumn('title')?.setFilterValue(e.currentTarget.value)}
			class="max-w-sm"
		/>
		<AddBook />
	</div>
	<div class="overflow-hidden rounded-md border">
		<Table.Root>
			<Table.Header class="text-md bg-muted font-bold">
				{#each table.getHeaderGroups() as headerGroup (headerGroup.id)}
					<Table.Row>
						{#each headerGroup.headers as header (header.id)}
							<Table.Head colspan={header.colSpan}>
								{#if !header.isPlaceholder}
									<FlexRender
										content={header.column.columnDef.header}
										context={header.getContext()}
									/>
								{/if}
							</Table.Head>
						{/each}
					</Table.Row>
				{/each}
			</Table.Header>
			<Table.Body>
				{#each table.getRowModel().rows as row (row.id)}
					<Table.Row>
						{#each row.getVisibleCells() as cell (cell.id)}
							<Table.Cell>
								<FlexRender content={cell.column.columnDef.cell} context={cell.getContext()} />
							</Table.Cell>
						{/each}
					</Table.Row>
				{:else}
					<Table.Row>
						<Table.Cell colspan={columns.length} class="h-24 text-center">No results.</Table.Cell>
					</Table.Row>
				{/each}
			</Table.Body>
		</Table.Root>
	</div>
	<div class="flex items-center justify-between space-x-2">
		<div class="flex items-center gap-3">
			<h1 class="text-sm font-light">Page {pagination.pageIndex + 1} of {table.getPageCount()}</h1>
			<div class="self-stretch">
				<Separator orientation="vertical" />
			</div>
			<div class="flex items-center gap-2">
				<h1 class="text-sm font-light">Number of rows:</h1>
				<Select.Root
					type="single"
					onValueChange={(size) => {
						table.setPageSize(parseInt(size));
					}}
				>
					<Select.Trigger>{pagination.pageSize}</Select.Trigger>
					<Select.Content>
						{#each pageSizes as pageSize}
							<Select.Item value={pageSize.toString()}>{pageSize}</Select.Item>
						{/each}
					</Select.Content>
				</Select.Root>
			</div>
		</div>
		<div>
			<DropdownMenu.Root></DropdownMenu.Root>
			<Button
				variant="outline"
				size="sm"
				onclick={() => table.previousPage()}
				disabled={!table.getCanPreviousPage()}
			>
				Previous
			</Button>
			<Button
				variant="outline"
				size="sm"
				onclick={() => table.nextPage()}
				disabled={!table.getCanNextPage()}
			>
				Next
			</Button>
		</div>
	</div>
</div>
