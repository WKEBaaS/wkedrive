<script lang="ts">
	import '@fontsource/noto-sans-tc';
	import '@fontsource/open-sans';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import { Toaster } from '$lib/components/ui/sonner';
	import { ModeWatcher } from 'mode-watcher';
	import '../app.css';

	let { children } = $props();
</script>

<ModeWatcher />
<Toaster />
<Sidebar.Provider>
	{@render children()}
</Sidebar.Provider>
