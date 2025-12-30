<script lang='ts'>
	import '@fontsource/noto-sans-tc';
  import '@fontsource/open-sans';
  import * as Sidebar from '$lib/components/ui/sidebar/index.js';
  import { Toaster } from '$lib/components/ui/sonner';
  import { ModeWatcher } from 'mode-watcher';
  import '../app.css';

  let { children } = $props();
</script>

<svelte:head>
	<title>WKE Drive</title>
	<meta name='description' content='WKE BaaS Case Study' />
</svelte:head>

<ModeWatcher />
<Toaster />
<Sidebar.Provider>
	{@render children()}
</Sidebar.Provider>
