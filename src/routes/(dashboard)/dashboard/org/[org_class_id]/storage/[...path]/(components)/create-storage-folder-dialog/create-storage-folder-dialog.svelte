<script lang="ts">
	import { page } from '$app/state';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import * as Field from '$lib/components/ui/field/index.js';
	import { buttonVariants } from '$src/lib/components/ui/button';
	import { Input } from '$src/lib/components/ui/input/index.js';
	import { createStorageFolder } from '$src/lib/remotes/index.js';
	import { PlusIcon } from '@lucide/svelte';

	const path = $derived.by(() => {
		if (page.params.path === '' || page.params.path === undefined) {
			return '/';
		}
		return page.params.path;
	});
</script>

<Dialog.Root>
	<Dialog.Trigger class={buttonVariants({ variant: 'outline', size: 'sm' })}>
		<PlusIcon class="mr-2 size-4" />
		New Folder
	</Dialog.Trigger>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Create New Folder</Dialog.Title>
		</Dialog.Header>
		<form {...createStorageFolder} oninput={() => createStorageFolder.validate()}>
			<input {...createStorageFolder.fields.p_org_class_id.as('hidden', page.params.org_class_id ?? '')} />
			<input {...createStorageFolder.fields.p_path.as('hidden', path)} />
			<Field.Group>
				<Field.Set>
					<Field.Field>
						<Field.Label for="storage-folder-name">Folder Name</Field.Label>
						<Input id="storage-folder-name" {...createStorageFolder.fields.p_name.as('text')} />
						{#each createStorageFolder.fields.p_name.issues() ?? [] as issue, index (index)}
							<Field.Error>{issue.message}</Field.Error>
						{/each}
					</Field.Field>
					<Field.Field>
						<Field.Label for="storage-folder-description">Description</Field.Label>
						<Input id="storage-folder-description" {...createStorageFolder.fields.p_description.as('text')} />
					</Field.Field>
				</Field.Set>
				<Field.Field orientation="horizontal">
					<Dialog.Close type="submit" class={buttonVariants()}>Create</Dialog.Close>
					<Dialog.Close type="button" class={buttonVariants({ variant: 'outline' })}>Cancel</Dialog.Close>
				</Field.Field>
			</Field.Group>
		</form>
	</Dialog.Content>
</Dialog.Root>
