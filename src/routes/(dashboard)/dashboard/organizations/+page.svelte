<script>
	import { resolve } from '$app/paths';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Empty from '$lib/components/ui/empty/index.js';
	import { ArrowUpRightIcon, FolderCodeIcon } from '@lucide/svelte';
	import * as Card from '$lib/components/ui/card/index.js';
	import dayjs from 'dayjs';

	let { data } = $props();
</script>

<div class="min-h-screen mt-4 mx-3 space-y-2">
	<Button href={resolve('/dashboard/organizations/new')}>Create Organization</Button>
	{#if data.orgs.length > 0}
		<div class="flex flex-wrap gap-2">
			{#each data.orgs as org (org.class_id)}
				<Card.Root class="p-4 mb-4 w-96">
					<Card.Header>
						<Card.Title class="text-xl font-bold">{org.name}</Card.Title>
					</Card.Header>
					<Card.Content>
						<p class="text-muted-foreground">{org.description}</p>
						<p class="text-xs text-gray-500 mt-2">
							Created: {dayjs(org.created_at).format('YYYY-MM-DD HH:mm')}
							<br>
							Updated: {dayjs(org.updated_at).format('YYYY-MM-DD HH:mm')}
						</p>
					</Card.Content>
					<Card.Footer>
						<Button href={resolve(`/dashboard/organizations/${org.class_id}`)} class="mt-2">View Organization</Button>
					</Card.Footer>
				</Card.Root>
			{/each}
		</div>
	{:else}
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
	{/if}
</div>
