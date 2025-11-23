<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { SearchIcon, UploadIcon } from '@lucide/svelte';
	import { CreateStorageFolderDialog } from './(components)/create-storage-folder-dialog/index.js';
	import { CurrentPath } from './(components)/current-path/index.js';
	import { ObjectGridView, ObjectListView } from './(components)/object-list/index.js';
	import { ViewModeSwitch } from './(components)/view-mode-switch/index.js';

	let { data } = $props();
	let viewMode: 'list' | 'grid' = $state('list');
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
						/>
					</div>

					<CreateStorageFolderDialog />

					<Button size="sm">
						<UploadIcon class="mr-2 size-4" />
						Upload
					</Button>

					<ViewModeSwitch bind:viewMode />
				</div>
			</div>
		</Card.Header>
		<Card.Content class="p-0">
			{#if viewMode === 'list'}
				<ObjectListView objects={data.objects} />
			{:else if viewMode === 'grid'}
				<ObjectGridView objects={data.objects} />
			{/if}
		</Card.Content>
	</Card.Root>
</div>
