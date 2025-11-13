<script lang="ts">
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import { Button } from '$lib/components/ui/button';
	import { LibraryBig, LogOut, MoonIcon, Settings, SunIcon } from 'lucide-svelte';
	import type { LayoutProps } from './$types';
	import { Separator } from '$lib/components/ui/separator/index';
	import { ModeWatcher, toggleMode } from 'mode-watcher';
	import * as Avatar from '$lib/components/ui/avatar/index.js';
	import { goto } from '$app/navigation';

	let { data, children }: LayoutProps = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
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
			<!-- Only show avatar when user has fully logged in -->
			{#if data.user && data.session?.twoFactorVerified}
				<DropdownMenu.Root>
					<DropdownMenu.Trigger>
						<span>
							<Avatar.Root class="size-10">
								<Avatar.Fallback>
									{data.user.firstName.charAt(0).toUpperCase() +
										data.user.lastName.charAt(0).toUpperCase() || '??'}
								</Avatar.Fallback>
							</Avatar.Root>
						</span>
					</DropdownMenu.Trigger>
					<DropdownMenu.Content>
						<DropdownMenu.Group>
							<DropdownMenu.Item onSelect={() => goto('/settings')}>
								<Settings />
								User Settings
							</DropdownMenu.Item>
						</DropdownMenu.Group>
						<DropdownMenu.Separator />
						<DropdownMenu.Group>
							<DropdownMenu.Item onSelect={() => goto('/logout', { invalidateAll: true })}>
								<LogOut color="red" />
								Logout
							</DropdownMenu.Item>
						</DropdownMenu.Group>
					</DropdownMenu.Content>
				</DropdownMenu.Root>
			{/if}
			<Button variant="ghost" onclick={toggleMode} size="icon">
				<SunIcon
					class="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 !transition-all dark:scale-0 dark:-rotate-90"
				/>
				<MoonIcon
					class="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 !transition-all dark:scale-100 dark:rotate-0"
				/>
				<span class="sr-only">Toggle theme</span>
			</Button>
		</div>
	</div>

	<Separator />
</nav>

<ModeWatcher />
<main class="flex-1">
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
