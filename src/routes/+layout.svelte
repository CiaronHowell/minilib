<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import { Button } from '$lib/components/ui/button';
	import { LibraryBig } from 'lucide-svelte';
	import type { LayoutProps } from './$types';
	import { Separator } from '$lib/components/ui/separator/index';
	import { ModeWatcher, toggleMode } from 'mode-watcher';
	import ThemeToggleButton from '$lib/components/custom/theme-toggle-button/theme-toggle-button.svelte';
	import { AvatarDropdown } from '$lib/components/custom/avatar-dropdown';

	let { data, children }: LayoutProps = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<link rel="apple-touch-icon" href="/apple-touch-icon.png" />
	<link rel="manifest" href="/manifest.webmanifest" />
	<meta name="theme-color" content="#0f172a" />
</svelte:head>

<nav>
	<div class="flex items-center justify-between p-2">
		<div class="flex">
			<Button variant="ghost" href="/">
				<LibraryBig class="size-[2lh]" />
				<h1 class="text-2xl font-bold">MiniLib</h1>
			</Button>
		</div>
		<div class="flex items-center gap-2">
			<ThemeToggleButton onclick={toggleMode} />
			<!-- Only show avatar when user has fully logged in -->
			{#if data.user && data.session?.twoFactorVerified}
				<AvatarDropdown user={data.user} />
			{/if}
		</div>
	</div>

	<Separator />
</nav>

<ModeWatcher />
<main class="flex flex-1">
	{@render children?.()}
</main>

<footer>
	<Separator />
	<div class="p-5">
		<p class="text-right text-gray-500">
			Made with 💙 by <a
				href="https://github.com/ciaronhowell"
				target="_blank"
				class="font-bold underline">Ciaron Howell</a
			>
		</p>
	</div>
</footer>
