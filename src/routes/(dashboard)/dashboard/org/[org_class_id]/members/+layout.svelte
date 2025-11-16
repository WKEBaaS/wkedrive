<script lang="ts">
	let { children, data } = $props();
	import { getOrgHeaderStore } from '../(components)/org-header/index.js';
	let store = getOrgHeaderStore();

	store.setNavItems([
		{
			name: 'Members',
			href: `/dashboard/org/${data.org.class_id}/members`,
		},
	]);
</script>

{@render children?.()}
