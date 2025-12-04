<script lang="ts">
	import * as Empty from '$lib/components/ui/empty/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { ArrowUpRightIcon, FolderIcon } from '@lucide/svelte';
	import { CreateStorageFolder } from '../create-storage-folder/index.js';
</script>

<Empty.Root>
	<Empty.Header>
		<Empty.Media variant="icon">
			<FolderIcon />
		</Empty.Media>
		<Empty.Title>No Files Yet</Empty.Title>
		<Empty.Description>
			This folder is empty. Upload a file or create a new folder.
		</Empty.Description>
	</Empty.Header>
	<Empty.Content>
		<div class="flex gap-2">
			<CreateStorageFolder />
			<Button>Upload File</Button>
		</div>
	</Empty.Content>
	<Button variant="link" class="text-muted-foreground" size="sm">
		<a href="#/">
			Learn More <ArrowUpRightIcon class="inline" />
		</a>
	</Button>
</Empty.Root>
