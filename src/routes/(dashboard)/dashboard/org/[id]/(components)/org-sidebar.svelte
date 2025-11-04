<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import { HardDrive, House, Users } from '@lucide/svelte';
	import type { ComponentProps } from 'svelte';

	if (!page.params.id) {
		throw new Error('Organization ID is required in the URL parameters.');
	}

	// Menu items.
	const items = [
		{
			title: 'Overview',
			url: resolve('/(dashboard)/dashboard/org/[id]', { id: page.params.id }),
			icon: House,
		},
		{
			title: 'Members',
			url: resolve('/(dashboard)/dashboard/org/[id]/members', { id: page.params.id }),
			icon: Users,
		},
	];

	let { ...restProps }: ComponentProps<typeof Sidebar.Root> = $props();
</script>

<Sidebar.Root collapsible="icon" {...restProps}>
	<Sidebar.Header>
		<Sidebar.Menu>
			<Sidebar.MenuItem>
				<Sidebar.MenuButton class="data-[slot=sidebar-menu-button]:!p-1.5">
					{#snippet child({ props })}
						<a href={resolve('/dashboard/organizations')} {...props}>
							<HardDrive class="" />
							<span class="text-base font-semibold">Organizations</span>
						</a>
					{/snippet}
				</Sidebar.MenuButton>
			</Sidebar.MenuItem>
		</Sidebar.Menu>
	</Sidebar.Header>
	<Sidebar.Content>
		<Sidebar.Group>
			<Sidebar.GroupLabel>Organizations</Sidebar.GroupLabel>
			<Sidebar.GroupContent>
				<Sidebar.Menu>
					{#each items as item (item.title)}
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
	</Sidebar.Content>
</Sidebar.Root>
