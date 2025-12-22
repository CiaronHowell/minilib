<script lang="ts">
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import * as Avatar from '$lib/components/ui/avatar/index.js';
	import { goto } from '$app/navigation';
	import type { User } from '$lib/server/auth/user';
	import { LogOut, Settings } from 'lucide-svelte';

	let { user }: { user: User } = $props();
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger>
		<span>
			<Avatar.Root class="size-10">
				<Avatar.Fallback>
					{#if user.firstName && user.lastName}
						{user.firstName.charAt(0).toUpperCase() + user.lastName.charAt(0).toUpperCase()}
					{:else}
						??
					{/if}
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
