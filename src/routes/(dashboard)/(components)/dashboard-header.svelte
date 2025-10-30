<script>
	import ThemeSwitcher from '$lib/components/theme-switch.svelte';
	import { HardDrive } from '@lucide/svelte';
	import { page } from '$app/state';
	import { resolve } from '$app/paths';

	let currentPage = $derived.by(() => {
		switch (page.url.pathname) {
			case '/dashboard/organizations':
				return 'Organizations';
			case '/dashboard/organizations/new':
				return 'New Organization';
		}
	});
</script>

<header
	class="border-border/40 bg-background/95 supports-backdrop-filter:bg-background/60 sticky top-0 z-50 inline-flex w-full items-center justify-between border-b backdrop-blur-sm"
>
	<div class="p-2 flex items-center">
		<a class="flex items-center justify-center" href={resolve('/')}>
			<HardDrive class="size-6" />
		</a>
		<span class="ml-2 text-lg font-semibold">{currentPage}</span>
	</div>
	<div>
		<ThemeSwitcher />
	</div>
</header>
