<script lang='ts'>
	import { page } from '$app/state';
  import * as AlertDialog from '$lib/components/ui/alert-dialog/index.js';
  import * as Field from '$lib/components/ui/field/index.js';
  import { buttonVariants } from '$src/lib/components/ui/button';
  import { displaySize, FileDropZone, MEGABYTE } from '$src/lib/components/ui/file-drop-zone/index.js';
  import { Input } from '$src/lib/components/ui/input/index.js';
  import { uploadStorageFile } from '$src/lib/remotes/index.js';
  import { getStoragePathStore } from '$src/lib/stores';
  import { UploadIcon } from '@lucide/svelte';
  import { toast } from 'svelte-sonner';

  const pathStore = getStoragePathStore();
  let open = $state(false);

  $effect(() => {
    const file = uploadStorageFile.fields.p_file.value();
    if (file) {
      // validate here since FileDropZone's onUpload is asynchronous
      uploadStorageFile.fields.p_name.set(file.name);
      uploadStorageFile.validate();
    }
  });
</script>

<AlertDialog.Root bind:open>
	<AlertDialog.Trigger class={buttonVariants({ variant: 'default', size: 'sm' })}>
		<UploadIcon class='mr-2 size-4' />
		Upload File
	</AlertDialog.Trigger>
	<AlertDialog.Content>
		<AlertDialog.Header>
			<AlertDialog.Title>Create New File</AlertDialog.Title>
		</AlertDialog.Header>
		<form
			{...uploadStorageFile.enhance(async ({ submit, form }) => {
			  await submit();
			  // if successful, close the dialog
			  if (uploadStorageFile.result?.success) {
			    form.reset();
			    open = false;
			    toast.success('File uploaded successfully.');
			  } else {
			    toast.error(uploadStorageFile.result?.message || 'Failed to upload file.', {
			      description: uploadStorageFile.result?.description,
			    });
			  }
			})}
			oninput={() => uploadStorageFile.validate()}
			enctype='multipart/form-data'
		>
			{#each uploadStorageFile.fields.allIssues() ?? [] as issue, index (index)}
				<Field.Error class='mb-2'>{issue.message}</Field.Error>
			{/each}
			<input {...uploadStorageFile.fields.p_org_class_id.as('hidden', page.params.org_class_id ?? '')} />
			<input {...uploadStorageFile.fields.p_path.as('hidden', pathStore.getPath())} />
			<Field.Group>
				<Field.Set>
					<Field.Field>
						<Field.Label for='storage-folder-name'>Custom File Name</Field.Label>
						<Input
							id='storage-folder-name'
							{...uploadStorageFile.fields.p_name.as('text')}
						/>
						{#each uploadStorageFile.fields.p_name.issues() ?? [] as issue, index (index)}
							<Field.Error>{issue.message}</Field.Error>
						{/each}
					</Field.Field>
					<Field.Field>
						<Field.Label for='storage-folder-description'>Description</Field.Label>
						<Input id='storage-folder-description' {...uploadStorageFile.fields.p_description.as('text')} />
					</Field.Field>
					<Field.Field>
						<input hidden {...uploadStorageFile.fields.p_file.as('file')} />
						{#each uploadStorageFile.fields.p_file.issues() ?? [] as issue, index (index)}
							<Field.Error>{issue.message}</Field.Error>
						{/each}
						<FileDropZone
							onUpload={async (files) => {
							  if (files.length === 0) return;
							  uploadStorageFile.fields.p_file.set(files[0]);
							}}
							maxFiles={1}
							maxFileSize={10 * MEGABYTE}
						/>
						{#if uploadStorageFile.fields.p_file.value()}
							{@const file = uploadStorageFile.fields.p_file.value()}
							<div class='mb-2 flex items-center gap-2'>
								<strong>{file.name}</strong>
								({displaySize(file.size)})
							</div>
						{/if}
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
