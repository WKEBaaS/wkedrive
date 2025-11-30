<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { Button, buttonVariants } from '$lib/components/ui/button/index.js';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import * as Table from '$lib/components/ui/table/index.js';
	import { FileIcon } from '$src/lib/components/icons';
	import { Checkbox } from '$src/lib/components/ui/checkbox/index.js';
	import * as AlertDialog from '$lib/components/ui/alert-dialog/index.js';
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
	import { deleteStorageObjects, getStorageFile } from '$src/lib/remotes/index.js';
	import { getStoragePathStore } from '$src/lib/stores';
	import { SvelteMap } from 'svelte/reactivity';
	dayjs.extend(relativeTime);

	interface ObjectListProps {
		objects: StorageObject[];
		onFileAction?: (action: string, object: StorageObject) => void;
	}

	let { objects, onFileAction }: ObjectListProps = $props();

	const pathStore = getStoragePathStore();
	let selected = new SvelteMap<string, Pick<StorageObject, 'name' | 'type'>>();
	let deleteObjectOpen = $state(false);
	let objectToDelete: StorageObject | null = $state(null);

	const toggleAll = () => {
		if (selected.size === objects.length) {
			selected.clear();
		} else {
			objects.forEach((obj) => selected.set(obj.id, { name: obj.name, type: obj.type }));
		}
	};

	const toggleSelected = (id: string) => {
		if (selected.has(id)) {
			selected.delete(id);
		} else {
			const obj = objects.find((o) => o.id === id);
			if (obj) {
				selected.set(id, { name: obj.name, type: obj.type });
			}
		}
	};
</script>

{#if objects.length === 0}
	<ObjectEmpty />
{:else}
	{#if selected.size > 0}
		<div class="flex items-center justify-between rounded-md border bg-muted/50 p-3">
			<span class="text-sm font-medium">
				{selected.size} member{selected.size > 1 ? 's' : ''} selected
			</span>
			<Button variant="destructive" size="sm" onclick={() => (deleteObjectOpen = true)}>
				<Trash2Icon class="mr-2 size-4" />
				Delete Selected
			</Button>
		</div>
	{/if}
	<Table.Root>
		<Table.Header>
			<Table.Row>
				<Table.Head class="w-12">
					<Checkbox
						checked={objects.length > 0 && selected.size === objects.length}
						onCheckedChange={toggleAll}
					/>
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
				<Table.Row class={selected.has(object.id) ? 'bg-muted/50' : ''}>
					<Table.Cell>
						<Checkbox
							name={object.name}
							checked={selected.has(object.id)}
							onCheckedChange={() => toggleSelected(object.id)}
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

								<DropdownMenu.Item
									onclick={async () => {
										const link = await getStorageFile({
											p_org_class_id: page.params.org_class_id!,
											p_path: pathStore.getPath(),
											p_name: object.name,
										});
										window.open(link, '_blank');
									}}
								>
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
									onclick={() => {
										deleteObjectOpen = true;
										objectToDelete = object;
									}}
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

	<!-- Action: Delete Object -->
	<AlertDialog.Root bind:open={deleteObjectOpen}>
		<AlertDialog.Content>
			<AlertDialog.Title>Confirm Deletion</AlertDialog.Title>
			<AlertDialog.Description>
				Are you sure you want to delete "{objectToDelete?.name}"?
			</AlertDialog.Description>
			<AlertDialog.Footer>
				<AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
				<AlertDialog.Action
					onclick={async () => {
						if (objectToDelete) {
							await deleteStorageObjects({
								p_org_class_id: page.params.org_class_id!,
								p_path: pathStore.getPath(),
								p_objects: [{ name: objectToDelete.name, type: objectToDelete.type }],
							});
							selected.delete(objectToDelete.id);
						} else {
							await deleteStorageObjects({
								p_org_class_id: page.params.org_class_id!,
								p_path: pathStore.getPath(),
								p_objects: Array.from(selected.values()),
							});
							selected.clear();
						}
						deleteObjectOpen = false;
					}}
				>Delete</AlertDialog.Action>
			</AlertDialog.Footer>
		</AlertDialog.Content>
	</AlertDialog.Root>
{/if}
