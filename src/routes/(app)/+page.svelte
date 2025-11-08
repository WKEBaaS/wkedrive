<script lang="ts">
	import { resolve } from '$app/paths';
	import { authClient } from '$lib/auth-client.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { displaySize, FileDropZone, MEGABYTE } from '$lib/components/ui/file-drop-zone/index.js';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import { UseClipboard } from '$lib/hooks/use-clipboard.svelte.js';
	import XIcon from '@lucide/svelte/icons/x';
	import { toast } from 'svelte-sonner';
	import SuperDebug, { filesProxy, superForm } from 'sveltekit-superforms';
	import { valibotClient } from 'sveltekit-superforms/adapters';
	import { uploadFileSchema } from './schema.js';

	let { data } = $props();
	const clipboard = new UseClipboard();

	const uploadFileForm = superForm(data.uploadFileForm, {
		validators: valibotClient(uploadFileSchema),
		onResult({ result }) {
			if (result.type === 'success') {
				toast.success('Files uploaded successfully!');
			}
		},
		onError({ result }) {
			toast.error('Failed to upload files.', { description: result.error.message });
		},
	});

	const { form: formData, enhance } = uploadFileForm;

	const files = filesProxy(uploadFileForm, 'files');
</script>

<div>
	<Button
		onclick={async () => {
			const { data, error } = await authClient.token();
			if (error) {
				toast.error('Failed to get JWT.', { description: error.message });
				return;
			}
			await clipboard.copy(data.token);
			toast.success('JWT copied to clipboard!');
		}}
	>Copy JWT (Debug)</Button>
	<form method="POST" action="?/uploadFile" enctype="multipart/form-data" use:enhance>
		<FileDropZone
			onUpload={async (uploadedFiles) => {
				files.set([...Array.from($files), ...uploadedFiles]);
			}}
			maxFileSize={10 * MEGABYTE}
			fileCount={$files.length}
			maxFiles={2}
		>Upload Files</FileDropZone>
		<input name="files" type="file" bind:files={$files} class="hidden" />
		<div class="flex flex-col gap-2 mt-4">
			{#each Array.from($files) as file, i (file.name)}
				<div class="flex place-items-center justify-between gap-2">
					<div class="flex flex-col">
						<span>{file.name}</span>
						<span class="text-muted-foreground text-xs">{displaySize(file.size)}</span>
					</div>
					<Button
						variant="outline"
						size="icon"
						onclick={() => {
							// we use set instead of an assignment since it accepts a File[]
							files.set([...Array.from($files).slice(0, i), ...Array.from($files).slice(i + 1)]);
						}}
					>
						<XIcon />
					</Button>
				</div>
			{/each}
		</div>
		<Button type="submit">Submit</Button>
		<Separator class="my-4" />
		<div class="mb-1 font-bold">Debug:</div>
		<SuperDebug data={$formData} />
	</form>
	<Button class="mt-5" href={resolve('/dashboard/organizations')}>Go to Org.</Button>
</div>
