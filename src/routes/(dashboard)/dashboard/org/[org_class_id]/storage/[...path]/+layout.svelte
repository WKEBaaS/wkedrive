<script lang="ts">
	import { page } from '$app/state';
	import { getOrgHeaderStore } from '$lib/components/org-header/index.js';
	import { getStorageObjects } from '$src/lib/remotes/index.js';
	import { getStoragePathStore, setStoragePathStore, StoragePathStore } from '$src/lib/stores/index.js';
	let { children, data } = $props();

	// Set up storage path store
	setStoragePathStore(new StoragePathStore(page.params.path));
	const pathStore = getStoragePathStore();

	$effect(() => {
		pathStore.setPath(page.params.path);
		getStorageObjects().refresh();
	});

	let orgHeaderStore = getOrgHeaderStore();
	orgHeaderStore.setNavItems([
		{
			name: 'Storage',
			href: `/dashboard/org/${data.org.class_id}/storage`,
		},
	]);
</script>

{@render children?.()}
