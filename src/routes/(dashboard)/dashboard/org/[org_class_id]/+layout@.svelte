<script lang="ts">
	import OrgSidebar from './(components)/org-sidebar.svelte';
	import { OrgHeader, OrgHeaderStore, setOrgHeaderStore } from '$lib/components/org-header/index.js';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';

	let { children, data } = $props();

	const orgHeaderStore = new OrgHeaderStore(data.org.name);
	setOrgHeaderStore(orgHeaderStore);
</script>

<OrgSidebar />
<Sidebar.Inset>
	<OrgHeader />
	{@render children?.()}
</Sidebar.Inset>
