<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { Button, buttonVariants } from '$lib/components/ui/button/index.js';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import * as Table from '$lib/components/ui/table/index.js';
	import { FileIcon } from '$src/lib/components/icons';
	import { Checkbox } from '$src/lib/components/ui/checkbox/index.js';
	import type { StorageObject } from '$src/lib/schemas';
	import {
		DownloadIcon,
		EllipsisVerticalIcon,
		EyeIcon,
		FolderIcon,
		MoveIcon,
		SquarePenIcon,
		Trash2Icon,
	} from '@lucide/svelte';
	import dayjs from 'dayjs';
	import relativeTime from 'dayjs/plugin/relativeTime.js';
	import ObjectEmpty from './object-empty.svelte';

	dayjs.extend(relativeTime);

	interface ObjectListProps {
		objects: StorageObject[];
		selected?: string[];
		onFileAction?: (action: string, object: StorageObject) => void;
	}

	let { objects, selected = $bindable([]), onFileAction }: ObjectListProps = $props();

	function toggleSelection(id: string) {
		if (selected.includes(id)) {
			selected = selected.filter((selectedId) => selectedId !== id);
		} else {
			selected = [...selected, id];
		}
	}
</script>

{#if objects.length === 0}
	<ObjectEmpty />
{:else}
	<div class="">
		<Table.Root>
			<Table.Header>
				<Table.Row>
					<Table.Head class="w-12">
						<span class="sr-only">Select</span>
					</Table.Head>
					<Table.Head>Name</Table.Head>
					<Table.Head>Size</Table.Head>
					<Table.Head>Modified</Table.Head>
					<Table.Head class="w-12">
						<span class="sr-only">Actions</span>
					</Table.Head>
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{#each objects as object (object.id)}
					<Table.Row class={selected.includes(object.id) ? 'bg-muted/50' : ''}>
						<Table.Cell>
							<Checkbox
								checked={selected.includes(object.id)}
								onchange={() => toggleSelection(object.id)}
								aria-label="Select {object.name}"
							/>
						</Table.Cell>
						<Table.Cell>
							<Button
								variant="ghost"
								class="flex justify-start items-center space-x-2 cursor-pointer"
								href={object.type === 'folder'
									? resolve('/(dashboard)/dashboard/org/[org_class_id]/storage/[...path]', {
										org_class_id: page.params.org_class_id!,
										path: object.path,
									})
									: undefined}
							>
								{#if object.type === 'folder'}
									<FolderIcon class="size-5 text-blue-400 shrink-0" />
								{:else}
									<FileIcon name={object.name} class="size-5 shrink-0" />
								{/if}
								<span class="font-medium">{object.name}</span>
							</Button>
						</Table.Cell>
						<Table.Cell>
							<span class="text-muted-foreground">{object.size}</span>
						</Table.Cell>
						<Table.Cell>
							<span class="text-muted-foreground">
								{dayjs(object.updated_at).fromNow()}
							</span>
						</Table.Cell>
						<Table.Cell>
							<DropdownMenu.Root>
								<DropdownMenu.Trigger class={buttonVariants({ variant: 'ghost', size: 'icon' })}>
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
										{object.type === 'folder' ? 'Download as ZIP' : 'Download'}
									</DropdownMenu.Item>

									<DropdownMenu.Separator />

									<DropdownMenu.Item onclick={() => onFileAction?.('rename', object)}>
										<SquarePenIcon class="h-4 w-4 mr-2" />
										Rename
									</DropdownMenu.Item>

									<DropdownMenu.Item onclick={() => onFileAction?.('move', object)}>
										<MoveIcon class="h-4 w-4 mr-2" />
										Move
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
						</Table.Cell>
					</Table.Row>
				{/each}
			</Table.Body>
		</Table.Root>
	</div>
{/if}
