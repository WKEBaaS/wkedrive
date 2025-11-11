<script lang="ts">
	import { page } from '$app/state';
	import ThemeSwitcher from '$lib/components/theme-switch.svelte';
	import * as Breadcrumb from '$lib/components/ui/breadcrumb';
	import { Separator } from '$lib/components/ui/separator';
	import * as Sidebar from '$lib/components/ui/sidebar';
	import { getOrgHeaderStore } from './org-header-store.svelte';

	let store = getOrgHeaderStore();
</script>

<header
	class="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12"
>
	<div class="flex w-full items-center gap-2 px-4">
		<Sidebar.Trigger />
		<Separator orientation="vertical" class="mr-2 data-[orientation=vertical]:h-4" />
		<Breadcrumb.Root>
			<Breadcrumb.List>
				<Breadcrumb.Item class="hidden md:block">
					<Breadcrumb.Link href={`/dashboard/org/${page.params.org_class_id}`}>{store.orgName}</Breadcrumb.Link>
				</Breadcrumb.Item>
				{#each store.navItems as { name, href } (name)}
					<Breadcrumb.Separator class="md:block" />
					<Breadcrumb.Item class="md:block">
						<Breadcrumb.Link {href}>{name}</Breadcrumb.Link>
					</Breadcrumb.Item>
				{/each}
			</Breadcrumb.List>
		</Breadcrumb.Root>
		<div class="ml-auto flex items-center gap-2">
			<ThemeSwitcher />
		</div>
	</div>
</header>
