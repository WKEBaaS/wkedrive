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
	import { deleteStorageObjects } from '$src/lib/remotes/index.js';

	dayjs.extend(relativeTime);

	interface ObjectListProps {
		objects: StorageObject[];
		onFileAction?: (action: string, object: StorageObject) => void;
	}

	let { objects, onFileAction }: ObjectListProps = $props();

	const toggleAll = () => {
		const selected = deleteStorageObjects.fields.p_names.value() || [];
		if (selected.length === objects.length) {
			deleteStorageObjects.fields.p_names.set([]);
		} else {
			deleteStorageObjects.fields.p_names.set(objects.map((object) => object.name));
		}
	};

	const toggleSelected = (name: string) => {
		const selected = deleteStorageObjects.fields.p_names.value() || [];
		if (selected.includes(name)) {
			deleteStorageObjects.fields.p_names.set(selected.filter((n) => n !== name));
		} else {
			deleteStorageObjects.fields.p_names.set([...selected, name]);
		}
	};

	const isSelected = (name: string) => {
		const selected = deleteStorageObjects.fields.p_names.value() || [];
		return selected.includes(name);
	};
</script>

{#if objects.length === 0}
	<ObjectEmpty />
{:else}
	<form {...deleteStorageObjects}>
		{#if deleteStorageObjects.fields.p_names.value()?.length > 0}
			<div class="flex items-center justify-between rounded-md border bg-muted/50 p-3">
				<span class="text-sm font-medium">
					{deleteStorageObjects.fields.p_names.value()?.length} member{
						deleteStorageObjects.fields.p_names.value()?.length > 1 ? 's' : ''
					} selected
				</span>
				<Button type="submit" variant="destructive" size="sm">
					<Trash2Icon class="mr-2 h-4 w-4" />
					Delete Selected
				</Button>
			</div>
		{/if}
		<Table.Root>
			<Table.Header>
				<Table.Row>
					<Table.Head class="w-12">
						<Checkbox
							checked={objects.length > 0 &&
								deleteStorageObjects.fields.p_names.value()?.length === objects.length}
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
					<Table.Row class={isSelected(object.id) ? 'bg-muted/50' : ''}>
						<Table.Cell>
							{@const f = deleteStorageObjects.fields.p_names.as('checkbox', object.name)}
							<Checkbox
								name={f.name}
								value={f.value}
								checked={f.checked}
								onCheckedChange={() => toggleSelected(object.name)}
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
	</form>
{/if}
