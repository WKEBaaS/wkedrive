<script lang='ts'>
	import { page } from '$app/state';
  import * as AlertDialog from '$lib/components/ui/alert-dialog/index.js';
  import * as Field from '$lib/components/ui/field/index.js';
  import { buttonVariants } from '$src/lib/components/ui/button';
  import { Input } from '$src/lib/components/ui/input/index.js';
  import { createStorageFolder } from '$src/lib/remotes/index.js';
  import { getStoragePathStore } from '$src/lib/stores';
  import { PlusIcon } from '@lucide/svelte';
  import { toast } from 'svelte-sonner';

  const pathStore = getStoragePathStore();
  let open = $state(false);
</script>

<AlertDialog.Root bind:open>
	<AlertDialog.Trigger class={buttonVariants({ variant: 'outline', size: 'sm' })}>
		<PlusIcon class='mr-2 size-4' />
		New Folder
	</AlertDialog.Trigger>
	<AlertDialog.Content>
		<AlertDialog.Header>
			<AlertDialog.Title>Create New Folder</AlertDialog.Title>
		</AlertDialog.Header>
		<form
			{...createStorageFolder.enhance(async ({ submit, form }) => {
			  await submit();
			  // if successful, close the dialog
			  if (createStorageFolder.result?.success) {
			    form.reset();
			    toast.success('Folder created successfully.');
			    open = false;
			  } else {
			    toast.error(createStorageFolder.result?.message || 'Failed to create folder.', {
			      description: createStorageFolder.result?.description,
			    });
			  }
			})}
			oninput={() => createStorageFolder.validate()}
		>
			<input {...createStorageFolder.fields.p_org_class_id.as('hidden', page.params.org_class_id ?? '')} />
			<input {...createStorageFolder.fields.p_path.as('hidden', pathStore.getPath())} />
			<Field.Group>
				<Field.Set>
					<Field.Field>
						<Field.Label for='storage-folder-name'>Folder Name</Field.Label>
						<Input id='storage-folder-name' {...createStorageFolder.fields.p_name.as('text')} />
						{#each createStorageFolder.fields.p_name.issues() ?? [] as issue, index (index)}
							<Field.Error>{issue.message}</Field.Error>
						{/each}
					</Field.Field>
					<Field.Field>
						<Field.Label for='storage-folder-description'>Description</Field.Label>
						<Input id='storage-folder-description' {...createStorageFolder.fields.p_description.as('text')} />
					</Field.Field>
				</Field.Set>
				<Field.Field class='justify-end' orientation='horizontal'>
					<AlertDialog.Cancel type='button'>Cancel</AlertDialog.Cancel>
					<AlertDialog.Action type='submit'>Create</AlertDialog.Action>
				</Field.Field>
			</Field.Group>
		</form>
	</AlertDialog.Content>
</AlertDialog.Root>
