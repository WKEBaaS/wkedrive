<script lang="ts">
	import type { StorageObject } from '$src/lib/schemas';
	import * as Tabs from '$lib/components/ui/tabs/index.js';
	import * as Table from '$lib/components/ui/table/index.js';
	import ObjectEmpty from './object-empty.svelte';
	import { Checkbox } from '$src/lib/components/ui/checkbox/index.js';
	import dayjs from 'dayjs';
	import relativeTime from 'dayjs/plugin/relativeTime.js';
	import { FileIcon } from '$src/lib/components/icons';
	import { FolderIcon } from '@lucide/svelte';
	import { Button } from '$src/lib/components/ui/button/index.js';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	dayjs.extend(relativeTime);

	interface ObjectListProps {
		objects: StorageObject[];
		selected?: string[];
		toggleSelectAll?: () => void;
	}

	let { objects, selected = $bindable([]), toggleSelectAll }: ObjectListProps = $props();
</script>

<Tabs.Content value="list">
	{#if objects.length === 0}
		<ObjectEmpty />
	{:else}
		<Table.Root>
			<Table.Header>
				<Table.Row>
					<Table.Head class="w-[40px]">
						<Checkbox
							aria-label="Select all"
							checked={selected.length === objects.length}
							onchange={toggleSelectAll}
						/>
					</Table.Head>
					<Table.Head class="w-[300px]">Name</Table.Head>
					<Table.Head>Size</Table.Head>
					<Table.Head>Modified</Table.Head>
					<Table.Head class="w-[80px]">Actions</Table.Head>
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{#each objects as object (object.id)}
					<Table.Row>
						<Table.Cell class="w-[40px]">
							<Checkbox
								checked={selected.includes(object.id)}
								onchange={() => {
									if (selected.includes(object.id)) {
										selected = selected.filter((id) => id !== object.id);
									} else {
										selected = [...selected, object.id];
									}
								}}
								aria-label="Select object"
							/>
						</Table.Cell>
						<Table.Cell class="w-[300px]">
							<Button
								variant="ghost"
								class="flex justify-start items-center space-x-2 cursor-pointer"
								href={object.type === 'folder'
									? resolve('/(dashboard)/dashboard/org/[org_class_id]/storage/[...path]', {
										org_class_id: page.params.org_class_id!,
										path: page.params.path ? `${page.params.path}/${object.name}` : object.name,
									})
									: undefined}
							>
								{#if object.type === 'folder'}
									<FolderIcon class="size-5 text-blue-400" />
								{:else}
									<FileIcon name={object.name} class="size-5" />
								{/if}
								<span>{object.name}</span>
							</Button>
						</Table.Cell>
						<Table.Cell>{object.size}</Table.Cell>
						<Table.Cell>{dayjs(object.updated_at).fromNow()}</Table.Cell>
						<Table.Cell class="w-[80px]">
							<!-- Actions such as download, delete can be added here -->
							<button>Download</button>
						</Table.Cell>
					</Table.Row>
				{/each}
			</Table.Body>
		</Table.Root>
	{/if}
</Tabs.Content>
