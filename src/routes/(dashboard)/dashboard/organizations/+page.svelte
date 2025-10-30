<script>
	import { resolve } from '$app/paths';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Empty from '$lib/components/ui/empty/index.js';
	import { ArrowUpRightIcon, FolderCodeIcon } from '@lucide/svelte';
</script>

<div class="min-h-screen">
	<Empty.Root>
		<Empty.Header>
			<Empty.Media variant="icon">
				<FolderCodeIcon />
			</Empty.Media>
			<Empty.Title>No Organizations Yet</Empty.Title>
			<Empty.Description>
				You haven't created any organizations yet. Get started by creating your first organization.
			</Empty.Description>
		</Empty.Header>
		<Empty.Content>
			<div class="flex gap-2">
				<Button href={resolve('/dashboard/organizations/new')}>Create Organization</Button>
				<!-- <Button variant="outline">Import Organization</Button> -->
			</div>
		</Empty.Content>
		<Button variant="link" class="text-muted-foreground" size="sm">
			<a href="#/">
				Learn More <ArrowUpRightIcon class="inline" />
			</a>
		</Button>
	</Empty.Root>
</div>
