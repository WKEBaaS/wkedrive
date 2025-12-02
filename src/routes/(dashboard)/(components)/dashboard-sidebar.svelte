<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import type { ResolvedPathname } from '$app/types';
	import { authClient } from '$lib/auth-client';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import type { Icon } from '@lucide/svelte';
	import { Building2Icon, InboxIcon, LogOutIcon, SettingsIcon } from '@lucide/svelte';

	type Item = {
		title: string;
		url: ResolvedPathname;
		icon: typeof Icon;
	};
	// Menu items.
	const mainItems = [
		{
			title: 'Organizations',
			url: resolve('/dashboard/organizations'),
			icon: Building2Icon,
		},
		{
			title: 'Invitations',
			url: resolve('/dashboard/invitations'),
			icon: InboxIcon,
		},
	] satisfies Item[];

	const accountItems = [
		// 	{
		// 		title: 'Profile',
		// 		url: '#',
		// 		icon: UserPen,
		// 	},
		{
			title: 'Settings',
			url: '#',
			icon: SettingsIcon,
		},
	];
</script>

<Sidebar.Root collapsible="icon">
	<Sidebar.Content>
		<Sidebar.Group>
			<Sidebar.GroupLabel>Dashboard</Sidebar.GroupLabel>
			<Sidebar.GroupContent>
				<Sidebar.Menu>
					{#each mainItems as item (item.title)}
						<Sidebar.MenuItem>
							<Sidebar.MenuButton>
								{#snippet child({ props })}
									<a href={item.url} {...props}>
										<item.icon />
										<span>{item.title}</span>
									</a>
								{/snippet}
							</Sidebar.MenuButton>
						</Sidebar.MenuItem>
					{/each}
				</Sidebar.Menu>
			</Sidebar.GroupContent>
		</Sidebar.Group>
		<Sidebar.Group>
			<Sidebar.GroupLabel>Account</Sidebar.GroupLabel>
			<Sidebar.GroupContent class="group-data-[collapsible=icon]:hidden">
				<Sidebar.Menu>
					{#each accountItems as item (item.title)}
						<Sidebar.MenuItem>
							<Sidebar.MenuButton>
								{#snippet child({ props })}
									<a href={item.url} {...props}>
										<item.icon />
										<span>{item.title}</span>
									</a>
								{/snippet}
							</Sidebar.MenuButton>
						</Sidebar.MenuItem>
					{/each}
				</Sidebar.Menu>
			</Sidebar.GroupContent>
		</Sidebar.Group>
		<Sidebar.Separator />
		<Sidebar.Group>
			<Sidebar.GroupContent class="group-data-[collapsible=icon]:hidden">
				<Sidebar.Menu>
					<Sidebar.MenuItem>
						<Sidebar.MenuButton
							onclick={async () => {
								await authClient.signOut();
								goto(resolve('/'));
							}}
						>
							<LogOutIcon />
							<span>Logout</span>
						</Sidebar.MenuButton>
					</Sidebar.MenuItem>
				</Sidebar.Menu>
			</Sidebar.GroupContent>
		</Sidebar.Group>
	</Sidebar.Content>
</Sidebar.Root>
