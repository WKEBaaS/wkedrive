<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import * as Table from '$lib/components/ui/table/index.js';
	import * as Popover from '$lib/components/ui/popover/index.js';
	import type { DeleteOrganizationGroupPayload, OrganizationGroup } from '$lib/schemas';
	import { EllipsisVerticalIcon } from '@lucide/svelte';
	import dayjs from 'dayjs';
	import DeleteGroupDialog from './delete-group-dialog.svelte';
	import type { SuperForm } from 'sveltekit-superforms';

	interface GroupListProps {
		groups: OrganizationGroup[];
		form: SuperForm<DeleteOrganizationGroupPayload>;
	}

	let { groups, form }: GroupListProps = $props();
</script>

<div class="rounded-md border">
	<Table.Root>
		<Table.Header>
			<Table.Row>
				<Table.Head class="">Group Name</Table.Head>
				<Table.Head class="">Description</Table.Head>
				<Table.Head class="text-right">Created At</Table.Head>
				<Table.Head class="text-right">Operation</Table.Head>
			</Table.Row>
		</Table.Header>
		<Table.Body>
			{#if groups.length === 0}
				<Table.Row>
					<Table.Cell colspan={4} class="h-24 text-center text-muted-foreground">
						No groups found.
					</Table.Cell>
				</Table.Row>
			{:else}
				{#each groups as group (group.id)}
					<Table.Row
						class="hover:cursor-pointer"
						onclick={() =>
							goto(resolve('/(dashboard)/dashboard/org/[org_class_id]/groups/[group_id]', {
								org_class_id: page.params.org_class_id!,
								group_id: group.id,
							}))}
					>
						<Table.Cell>
							<span class="font-medium">{group.display_name}</span>
						</Table.Cell>
						<Table.Cell class="text-muted-foreground">{group.description}</Table.Cell>
						<Table.Cell class="text-right text-muted-foreground">
							{dayjs(group.created_at).format('YYYY-MM-DD')}
						</Table.Cell>
						<Table.Cell class="text-right text-muted-foreground">
							<Popover.Root>
								<Popover.Trigger onclick={(e) => e.stopPropagation()}>
									<EllipsisVerticalIcon class="h-5 w-5 hover:text-primary" />
								</Popover.Trigger>
								<Popover.Content onclick={(e) => e.stopPropagation()}>
									<div class="grid gap-4">
										<div class="space-y-2">
											<h4 class="font-medium leading-none">Actions</h4>
											<p class="text-muted-foreground text-sm">
												Manage this group
											</p>
										</div>
										<DeleteGroupDialog groupID={group.id} {form} />
									</div>
								</Popover.Content>
							</Popover.Root>
						</Table.Cell>
					</Table.Row>
				{/each}
			{/if}
		</Table.Body>
	</Table.Root>
</div>
