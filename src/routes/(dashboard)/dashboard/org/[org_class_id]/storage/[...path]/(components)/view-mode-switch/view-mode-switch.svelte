<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Grid3x3Icon, ListIcon } from '@lucide/svelte';

	interface ViewModeSwitchProps {
		viewMode: 'list' | 'grid';
	}

	let { viewMode = $bindable('list') }: ViewModeSwitchProps = $props();
</script>
<div class="hidden md:flex border rounded-md">
	<Button
		variant={viewMode === 'list' ? 'secondary' : 'ghost'}
		size="icon"
		class="h-8 w-8 rounded-r-none"
		onclick={() => viewMode = 'list'}
	>
		<ListIcon class="h-4 w-4" />
		<span class="sr-only">List view</span>
	</Button>
	<Button
		variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
		size="icon"
		class="h-8 w-8 rounded-l-none"
		onclick={() => viewMode = 'grid'}
	>
		<Grid3x3Icon class="h-4 w-4" />
		<span class="sr-only">Grid view</span>
	</Button>
</div>
