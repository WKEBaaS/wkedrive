<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { Button, buttonVariants } from '$lib/components/ui/button/index.js';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
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
	import { deleteStorageObjects } from '$src/lib/remotes/index.js';
	import { getStoragePathStore } from '$src/lib/stores';
	import * as AlertDialog from '$lib/components/ui/alert-dialog/index.js';
	import * as Field from '$src/lib/components/ui/field/index.js';

	dayjs.extend(relativeTime);

	interface ObjectGridProps {
		objects: StorageObject[];
		onFileAction?: (action: string, object: StorageObject) => void;
	}

	let { objects, onFileAction }: ObjectGridProps = $props();

	const pathStore = getStoragePathStore();
	let deleteObjectOpen = $state(false);
	let objectToDelete: StorageObject | null = $state(null);

	function toggleSelection(name: string) {
		const selected = deleteStorageObjects.fields.p_names.value() || [];
		if (selected.includes(name)) {
			deleteStorageObjects.fields.p_names.set(
				selected.filter((n) => n !== name),
			);
		} else {
			deleteStorageObjects.fields.p_names.set([...selected, name]);
		}
	}

	const isSelected = (name: string) => {
		const selected = deleteStorageObjects.fields.p_names.value() || [];
		return selected.includes(name);
	};
</script>

{#if objects.length === 0}
	<ObjectEmpty />
{:else}
	{#each deleteStorageObjects.fields.allIssues() ?? [] as issue, index (index)}
		<Field.Error>{issue.message}</Field.Error>
	{/each}

	{#if deleteStorageObjects.fields.p_names.value()?.length > 0}
		<div
			class="flex items-center justify-between rounded-md border bg-muted/50 p-3 mb-4"
		>
			<span class="text-sm font-medium">
				{deleteStorageObjects.fields.p_names.value()?.length} member{
					deleteStorageObjects.fields.p_names.value()
							?.length > 1
						? 's'
						: ''
				} selected
			</span>
			<AlertDialog.Root>
				<AlertDialog.Trigger
					type="button"
					class={buttonVariants({
						variant: 'destructive',
						size: 'sm',
					})}
				>
					<Trash2Icon class="mr-2 size-4" />
					Delete Selected
				</AlertDialog.Trigger>
				<AlertDialog.Content>
					<AlertDialog.Title>Confirm Deletion</AlertDialog.Title>
					<AlertDialog.Description>
						Are you sure you want to delete the selected items?
					</AlertDialog.Description>
					<AlertDialog.Footer>
						<form {...deleteStorageObjects}>
							<input
								{...deleteStorageObjects.fields.p_org_class_id.as(
									'hidden',
									page.params.org_class_id ?? '',
								)}
							/>
							<input
								{...deleteStorageObjects.fields.p_path.as(
									'hidden',
									pathStore.getPath(),
								)}
							/>
							{#each deleteStorageObjects.fields.p_names.value() as name (name)}
								<input
									hidden
									{...deleteStorageObjects.fields.p_names.as(
										'checkbox',
										name,
									)}
								/>
							{/each}
							<AlertDialog.Cancel type="button">Cancel</AlertDialog.Cancel>
							<AlertDialog.Action type="submit">Delete</AlertDialog.Action>
						</form>
					</AlertDialog.Footer>
				</AlertDialog.Content>
			</AlertDialog.Root>
		</div>
	{/if}

	<div
		class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 p-4"
	>
		{#each objects as object (object.id)}
			{@const f = deleteStorageObjects.fields.p_names.as('checkbox', object.name)}
			<div
				class="
					relative group rounded-lg border bg-card p-2 transition-all hover:shadow-md {isSelected(
					object.name,
					)
					? 'ring-2 ring-primary'
					: ''}
				"
			>
				<!-- Checkbox in top-right corner -->
				<div class="absolute top-2 right-2 z-10">
					<Checkbox
						name={f.name}
						value={f.value}
						checked={f.checked}
						onCheckedChange={() => toggleSelection(object.name)}
						aria-label="Select {object.name}"
					/>
				</div>

				<!-- File/Folder content -->
				<Button
					variant="ghost"
					class="flex h-auto flex-col items-center p-4 cursor-pointer w-full border-0 hover:bg-transparent"
					href={object.type === 'folder'
						? resolve(
							'/(dashboard)/dashboard/org/[org_class_id]/storage/[...path]',
							{
								org_class_id: page.params.org_class_id!,
								path: object.path,
							},
						)
						: undefined}
				>
					<div class="mb-2">
						{#if object.type === 'folder'}
							<FolderIcon class="size-12 text-blue-400" />
						{:else}
							<FileIcon name={object.name} class="size-12" />
						{/if}
					</div>
					<div class="text-center w-full">
						<p
							class="font-medium truncate w-full max-w-[120px] mx-auto"
						>
							{object.name}
						</p>
						<p class="text-xs text-muted-foreground">
							{object.size}
						</p>
						<p class="text-xs text-muted-foreground">
							{dayjs(object.updated_at).fromNow()}
						</p>
					</div>
				</Button>

				<!-- Actions dropdown menu -->
				<div
					class="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10"
				>
					<DropdownMenu.Root>
						<DropdownMenu.Trigger
							class={buttonVariants({
								variant: 'ghost',
								size: 'icon',
							})}
						>
							<EllipsisVerticalIcon class="h-4 w-4" />
							<span class="sr-only">Actions</span>
						</DropdownMenu.Trigger>
						<DropdownMenu.Content align="end">
							<DropdownMenu.Item
								onclick={() => onFileAction?.('open', object)}
							>
								{#if object.type === 'folder'}
									<FolderIcon class="h-4 w-4 mr-2" />
									Open
								{:else}
									<EyeIcon class="h-4 w-4 mr-2" />
									Preview
								{/if}
							</DropdownMenu.Item>

							<DropdownMenu.Item
								onclick={() => onFileAction?.('download', object)}
							>
								<DownloadIcon class="h-4 w-4 mr-2" />
								{object.type === 'folder' ? 'DownloadIcon as ZIP' : 'Download'}
							</DropdownMenu.Item>

							<DropdownMenu.Separator />

							<DropdownMenu.Item
								onclick={() => onFileAction?.('rename', object)}
							>
								<SquarePenIcon class="h-4 w-4 mr-2" />
								Rename
							</DropdownMenu.Item>

							<DropdownMenu.Item
								onclick={() => onFileAction?.('move', object)}
							>
								<MoveIcon class="h-4 w-4 mr-2" />
								MoveIcon
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
				</div>
			</div>
		{/each}
	</div>

	<!-- Action: Delete Object -->
	<AlertDialog.Root bind:open={deleteObjectOpen}>
		<AlertDialog.Content>
			<AlertDialog.Title>Confirm Deletion</AlertDialog.Title>
			<AlertDialog.Description>
				Are you sure you want to delete "{objectToDelete?.name}"?
			</AlertDialog.Description>
			<AlertDialog.Footer>
				<form
					{...deleteStorageObjects.enhance(async ({ submit, form }) => {
						await submit();
						form.reset();
						deleteObjectOpen = false;
					})}
				>
					<input {...deleteStorageObjects.fields.p_org_class_id.as('hidden', page.params.org_class_id ?? '')} />
					<input {...deleteStorageObjects.fields.p_path.as('hidden', pathStore.getPath())} />
					{#if objectToDelete}
						<input hidden {...deleteStorageObjects.fields.p_names.as('checkbox', objectToDelete.name)} />
					{/if}
					<AlertDialog.Cancel type="button">Cancel</AlertDialog.Cancel>
					<AlertDialog.Action type="submit">Delete</AlertDialog.Action>
				</form>
			</AlertDialog.Footer>
		</AlertDialog.Content>
	</AlertDialog.Root>
{/if}
