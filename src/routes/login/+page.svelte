<script lang="ts">
	import { LoginForm } from '$lib/components/ui/login-form';
	import type { PageData } from './$types.js';

	let { data }: { data: PageData } = $props();
</script>

<div class="m-auto flex w-2/5 flex-col rounded-xl border p-7">
	<h1 class="pb-4 text-2xl font-medium">Login</h1>
	<!-- <SuperDebug class="truncate" data={form} /> -->
	<LoginForm {data} />
</div>
