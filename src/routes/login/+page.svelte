<script lang="ts">
	import { LoginForm } from '$lib/components/custom/login-form/index.js';
	import type { PageData } from './$types.js';

	let { data }: { data: PageData } = $props();
</script>

<div class="m-auto flex w-[calc(100%-2rem)] max-w-md flex-col rounded-xl border p-6 sm:p-7">
	<h1 class="pb-4 text-2xl font-medium">Login</h1>
	<!-- <SuperDebug class="truncate" data={form} /> -->
	<LoginForm {data} />
</div>
