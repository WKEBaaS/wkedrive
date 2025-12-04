<script lang="ts">
	let { children, data } = $props();
	import { getOrgHeaderStore } from '$lib/components/org-header/index.js';
	let store = getOrgHeaderStore();

	store.setNavItems([
		{
			name: 'Groups',
			href: `/dashboard/org/${data.org.class_id}/groups`,
		},
	]);
</script>

{@render children?.()}
