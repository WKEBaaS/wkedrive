<script lang="ts">
	import OrgSidebar from './(components)/org-sidebar.svelte';
	import OrgHeader from './(components)/org-header.svelte';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';

	let { children, data } = $props();
</script>

<OrgSidebar />
<Sidebar.Inset>
	<OrgHeader name={data.org.name} />
	{@render children?.()}
</Sidebar.Inset>
