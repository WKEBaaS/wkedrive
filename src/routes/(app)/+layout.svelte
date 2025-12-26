<script lang='ts'>
	import type { Snippet } from 'svelte';
  import HomeFooter from './(components)/home-footer.svelte';
  import HomeHeader from './(components)/home-header.svelte';
  let { children }: { children: Snippet } = $props();
</script>

<div class='flex flex-col w-full min-h-screen'>
	<main class='flex-1'>
		<HomeHeader />
		{@render children()}
	</main>
	<HomeFooter />
</div>
