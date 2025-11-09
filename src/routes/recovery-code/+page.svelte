<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import type { PageData } from './$types';

	export let data: PageData;
</script>

<div class="m-auto flex flex-col gap-3 rounded rounded-xl border p-5">
	<h1 class="text-2xl font-medium">Recovery code</h1>
	<div>
		<p>Your <span class="underline">recovery code</span> is:</p>
		<div class="m-3 text-center"><span class="font-bold">{data.recoveryCode}</span></div>
		<p>You can use this recovery code if you lose access to your 2FA app.</p>
	</div>
	<div class="flex justify-center">
		<Button href="/">Next</Button>
	</div>
</div>
