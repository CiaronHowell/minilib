<script lang="ts">
	import { Separator } from '$lib/components/ui/separator';

	let { text }: { text: string } = $props();
</script>

<div class="flex items-center gap-2">
	<div class="w-full">
		<Separator />
	</div>
	<p class="text-sm text-gray-500">{text}</p>
	<div class="w-full">
		<Separator />
	</div>
</div>
