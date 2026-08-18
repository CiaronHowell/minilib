<script lang="ts">
	import { onDestroy } from 'svelte';
	import { BrowserMultiFormatReader } from '@zxing/browser';
	import { BarcodeFormat, DecodeHintType, NotFoundException } from '@zxing/library';
	import type { IScannerControls } from '@zxing/browser';
	import { Button } from '$lib/components/ui/button';
	import { CameraIcon, XIcon } from 'lucide-svelte';

	let { onScan }: { onScan: (isbn: string) => void } = $props();

	let scanning = $state(false);
	let error = $state<string | null>(null);
	let videoEl: HTMLVideoElement | undefined = $state();
	let controls: IScannerControls | undefined;

	const hints = new Map([[DecodeHintType.POSSIBLE_FORMATS, [BarcodeFormat.EAN_13]]]);

	function stopScan() {
		controls?.stop();
		controls = undefined;
		scanning = false;
	}

	async function startScan() {
		error = null;
		scanning = true;

		// Wait for the video element to mount before handing it to the reader.
		await new Promise((resolve) => setTimeout(resolve, 0));
		if (!videoEl) {
			return;
		}

		try {
			const reader = new BrowserMultiFormatReader(hints);
			controls = await reader.decodeFromVideoDevice(undefined, videoEl, (result, err) => {
				if (result) {
					onScan(result.getText());
					stopScan();
				} else if (err && !(err instanceof NotFoundException)) {
					error = 'Something went wrong while scanning — try again.';
				}
			});
		} catch {
			error = "Couldn't access the camera. Check permissions and try again.";
			scanning = false;
		}
	}

	onDestroy(() => stopScan());
</script>

{#if scanning}
	<div class="relative overflow-hidden rounded-md border bg-black">
		<video bind:this={videoEl} class="aspect-video w-full object-cover" muted playsinline></video>
		<Button
			type="button"
			size="icon"
			variant="secondary"
			class="absolute top-2 right-2"
			onclick={stopScan}
		>
			<XIcon />
		</Button>
	</div>
{:else}
	<Button type="button" variant="outline" onclick={startScan}>
		<CameraIcon />
		Scan barcode
	</Button>
{/if}

{#if error}
	<p class="text-sm text-red-600">{error}</p>
{/if}
