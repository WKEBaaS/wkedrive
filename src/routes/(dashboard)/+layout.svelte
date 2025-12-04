<script lang="ts">
	import { DashboardHeader } from './(components)/dashboard-header/index.js';
	import DashboardSidebar from './(components)/dashboard-sidebar.svelte';

	let { children } = $props();
</script>

<DashboardSidebar />
<section class="w-full">
	<DashboardHeader />
	{@render children?.()}
</section>
