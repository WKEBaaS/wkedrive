<script lang='ts'>
	let { children, data } = $props();
  import { getOrgHeaderStore } from '$lib/components/org-header/index.js';
  let store = getOrgHeaderStore();

  $effect(() => {
    store.setNavItems([
      {
        name: 'Settings',
        href: `/dashboard/org/${data.org.class_id}/settings`,
      },
    ]);
  });
</script>

{@render children?.()}
