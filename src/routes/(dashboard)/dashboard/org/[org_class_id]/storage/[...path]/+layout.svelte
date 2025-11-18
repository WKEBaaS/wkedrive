<script lang="ts">
	let { children, data } = $props();
	import { getOrgHeaderStore } from '$lib/components/org-header/index.js';
	let store = getOrgHeaderStore();

	store.setNavItems([
		{
			name: 'Storage',
			href: `/dashboard/org/${data.org.class_id}/storage`,
		},
	]);
</script>

{@render children?.()}
