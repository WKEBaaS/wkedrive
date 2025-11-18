<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { PlusIcon, SearchIcon, UploadIcon } from '@lucide/svelte';
	import { CurrentPath } from './(components)/current-path/index.js';
	import { ViewModeSwitch } from './(components)/view-mode-switch/index.js';
	import * as Tabs from '$lib/components/ui/tabs/index.js';
	import { ObjectListView } from './(components)/object-list/index.js';
	import ObjectGridView from './(components)/object-list/object-grid-view.svelte';

	let { data } = $props();
	let viewMode = $state<'list' | 'grid'>('list');
</script>

<div class="p-2">
	<Card.Root class="w-full max-w-6xl mx-auto shadow-md">
		<Card.Header class="border-b">
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

					<Button variant="outline" size="sm">
						<PlusIcon class="mr-2 size-4" />
						New Folder
					</Button>

					<Button size="sm">
						<UploadIcon class="mr-2 size-4" />
						Upload
					</Button>

					<ViewModeSwitch bind:viewMode />
				</div>
			</div>
		</Card.Header>
		<Card.Content>
			<Tabs.Root value={viewMode}>
				<ObjectListView objects={data.objects} />
				<ObjectGridView objects={data.objects} />
			</Tabs.Root>
		</Card.Content>
	</Card.Root>
</div>
