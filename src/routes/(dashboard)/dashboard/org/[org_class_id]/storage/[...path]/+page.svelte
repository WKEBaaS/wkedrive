<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { SearchIcon } from '@lucide/svelte';
	import Fuse from 'fuse.js';
	import { CreateStorageFolder } from './(components)/create-storage-folder/index.js';
	import { CurrentPath } from './(components)/current-path/index.js';
	import { ObjectListView } from './(components)/object-list/index.js';
	import { UploadStorageFile } from './(components)/upload-storage-file/index.js';
	import { ViewModeSwitch } from './(components)/view-mode-switch/index.js';
	import { getStorageObjects } from '$src/lib/remotes/storage.remote.js';

	let searchQuery: string = $state('');

	const objects = $derived(await getStorageObjects());
	const fuse = $derived(
		new Fuse(objects, {
			keys: ['name', 'description'],
			threshold: 0.3,
		}),
	);

	const filteredObjects = $derived.by(() => {
		if (!fuse || !searchQuery) {
			return objects;
		}
		return fuse.search(searchQuery).map((result) => result.item);
	});
</script>

<div class="p-2 flex-1">
	<Card.Root class="w-full max-w-6xl mx-auto shadow-md gap-0 h-full">
		<Card.Header class="border-b p-4">
			<div class="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
				<CurrentPath />
				<div class="flex items-center space-x-2">
					<div class="relative w-full md:w-auto">
						<SearchIcon class="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
						<Input
							type="search"
							placeholder="Search files..."
							class="w-full pl-8 md:w-[200px] lg:w-[300px]"
							bind:value={searchQuery}
						/>
					</div>
					<CreateStorageFolder />
					<UploadStorageFile />
					<ViewModeSwitch />
				</div>
			</div>
		</Card.Header>
		<Card.Content class="p-0">
			<!-- {#if viewMode === 'list'} -->
			<ObjectListView objects={filteredObjects} />
			<!-- {:else if viewMode === 'grid'} -->
			<!-- <ObjectGridView objects={filteredObjects} /> -->
			<!-- {/if} -->
		</Card.Content>
	</Card.Root>
</div>
