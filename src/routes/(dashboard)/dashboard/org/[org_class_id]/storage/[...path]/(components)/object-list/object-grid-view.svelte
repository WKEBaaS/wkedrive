<script lang="ts">
	import type { StorageObject } from '$src/lib/schemas';
	import * as Tabs from '$lib/components/ui/tabs/index.js';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import ObjectEmpty from './object-empty.svelte';
	import { Checkbox } from '$src/lib/components/ui/checkbox/index.js';
	import dayjs from 'dayjs';
	import relativeTime from 'dayjs/plugin/relativeTime.js';
	import { FileIcon } from '$src/lib/components/icons';
	import {
		DownloadIcon,
		EllipsisVerticalIcon,
		EyeIcon,
		FolderIcon,
		MoveIcon,
		SquarePenIcon,
		Trash2Icon,
	} from '@lucide/svelte';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';

	dayjs.extend(relativeTime);

	interface ObjectGridProps {
		objects: StorageObject[];
		selected?: string[];
		onFileAction?: (action: string, object: StorageObject) => void;
	}

	let { objects, selected = $bindable([]), onFileAction }: ObjectGridProps = $props();

	function handleFileClick(object: StorageObject) {
		if (object.type === 'folder') {
			window.location.href = resolve('/(dashboard)/dashboard/org/[org_class_id]/storage/[...path]', {
				org_class_id: page.params.org_class_id!,
				path: page.params.path ? `${page.params.path}/${object.name}` : object.name,
			});
		} else if (onFileAction) {
			onFileAction('open', object);
		}
	}

	function toggleSelection(id: string) {
		if (selected.includes(id)) {
			selected = selected.filter((selectedId) => selectedId !== id);
		} else {
			selected = [...selected, id];
		}
	}
</script>

<Tabs.Content value="grid" class="m-0">
	{#if objects.length === 0}
		<ObjectEmpty />
	{:else}
		<div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 p-4">
			{#each objects as object (object.id)}
				<div
					class="relative group rounded-lg border bg-card p-2 transition-all hover:shadow-md {selected.includes(object.id) ? 'ring-2 ring-primary' : ''}"
				>
					<!-- Checkbox in top-right corner -->
					<div class="absolute top-2 right-2 z-10">
						<Checkbox
							checked={selected.includes(object.id)}
							onchange={() => toggleSelection(object.id)}
							aria-label="Select {object.name}"
						/>
					</div>

					<!-- File/Folder content -->
					<button
						class="flex flex-col items-center p-4 cursor-pointer w-full border-0 bg-transparent"
						onclick={() => handleFileClick(object)}
						type="button"
					>
						<div class="mb-2">
							{#if object.type === 'folder'}
								<FolderIcon class="size-12 text-blue-400" />
							{:else}
								<FileIcon name={object.name} class="size-12" />
							{/if}
						</div>
						<div class="text-center w-full">
							<p class="font-medium truncate w-full max-w-[120px] mx-auto">
								{object.name}
							</p>
							<p class="text-xs text-muted-foreground">
								{object.size}
							</p>
							<p class="text-xs text-muted-foreground">
								{dayjs(object.updated_at).fromNow()}
							</p>
						</div>
					</button>

					<!-- Actions dropdown menu -->
					<div class="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
						<DropdownMenu.Root>
							<DropdownMenu.Trigger>
								<EllipsisVerticalIcon class="h-4 w-4" />
								<span class="sr-only">Actions</span>
							</DropdownMenu.Trigger>
							<DropdownMenu.Content align="end">
								<DropdownMenu.Item onclick={() => onFileAction?.('open', object)}>
									{#if object.type === 'folder'}
										<FolderIcon class="h-4 w-4 mr-2" />
										Open
									{:else}
										<EyeIcon class="h-4 w-4 mr-2" />
										Preview
									{/if}
								</DropdownMenu.Item>

								<DropdownMenu.Item onclick={() => onFileAction?.('download', object)}>
									<DownloadIcon class="h-4 w-4 mr-2" />
									{object.type === 'folder' ? 'DownloadIcon as ZIP' : 'Download'}
								</DropdownMenu.Item>

								<DropdownMenu.Separator />

								<DropdownMenu.Item onclick={() => onFileAction?.('rename', object)}>
									<SquarePenIcon class="h-4 w-4 mr-2" />
									Rename
								</DropdownMenu.Item>

								<DropdownMenu.Item onclick={() => onFileAction?.('move', object)}>
									<MoveIcon class="h-4 w-4 mr-2" />
									MoveIcon
								</DropdownMenu.Item>

								<DropdownMenu.Separator />

								<DropdownMenu.Item
									onclick={() => onFileAction?.('delete', object)}
									class="text-destructive focus:text-destructive"
								>
									<Trash2Icon class="h-4 w-4 mr-2" />
									Delete
								</DropdownMenu.Item>
							</DropdownMenu.Content>
						</DropdownMenu.Root>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</Tabs.Content>
