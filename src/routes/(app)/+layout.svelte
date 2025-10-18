<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { LayoutData } from './$types';
	import HomeFooter from './(components)/home-footer.svelte';
	import HomeHeader from './(components)/home-header.svelte';
	let { children, data }: { children: Snippet; data: LayoutData } = $props();
</script>

<div class="flex flex-col w-full min-h-screen">
	<main class="flex-1">
		<HomeHeader session={data.session} />
		{@render children()}
	</main>
	<HomeFooter />
</div>
