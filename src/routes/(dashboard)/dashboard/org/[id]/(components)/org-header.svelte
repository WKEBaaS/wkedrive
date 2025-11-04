<script lang="ts">
	import { page } from '$app/state';
	import ThemeSwitcher from '$lib/components/theme-switch.svelte';
	import * as Breadcrumb from '$lib/components/ui/breadcrumb';
	import { Separator } from '$lib/components/ui/separator';
	import * as Sidebar from '$lib/components/ui/sidebar';

	interface OrgHeaderProps {
		// The name of the organization.
		name: string;
	}

	let { name }: OrgHeaderProps = $props();

	let currentPage = $derived.by(() => {
		switch (page.route.id) {
			case '/(dashboard)/dashboard/org/[id]':
				return 'Organization Overview';
			case '/(dashboard)/dashboard/org/[id]/members':
				return 'Members';
			default:
				return 'Dashboard';
		}
	});
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
					<Breadcrumb.Link href={`/dashboard/org/${page.params.id}`}>{name}</Breadcrumb.Link>
				</Breadcrumb.Item>
				<Breadcrumb.Separator class="hidden md:block" />
				<Breadcrumb.Item>
					<Breadcrumb.Page>{currentPage}</Breadcrumb.Page>
				</Breadcrumb.Item>
			</Breadcrumb.List>
		</Breadcrumb.Root>
		<div class="ml-auto flex items-center gap-2">
			<ThemeSwitcher />
		</div>
	</div>
</header>
