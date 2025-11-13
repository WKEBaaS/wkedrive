<script lang="ts">
	import { resolve } from '$app/paths';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Table from '$lib/components/ui/table/index.js';
	import { createOrganizationGroupSchema } from '$lib/schemas/inputs.js';
	import dayjs from 'dayjs';
	import { superForm } from 'sveltekit-superforms';
	import { valibotClient } from 'sveltekit-superforms/adapters';
	import { CreateGroupForm } from './(components)/create-group/index.js';

	let { data } = $props();
	const createOrganizationGroupForm = superForm(data.createOrganizationGroupForm, {
		id: 'create-organization-group-form',
		validators: valibotClient(createOrganizationGroupSchema),
		dataType: 'json',
		delayMs: 100,
	});
</script>

<div class="space-y-6 p-4">
	<div class="flex items-center justify-between">
		<div class="text-2xl font-bold">Organization Groups</div>
		<CreateGroupForm members={data.members} form={createOrganizationGroupForm} />
	</div>

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
				{#if data.groups.length === 0}
					<Table.Row>
						<Table.Cell colspan={2} class="h-24 text-center text-muted-foreground">
							No groups found.
						</Table.Cell>
					</Table.Row>
				{:else}
					{#each data.groups as group (group.id)}
						<Table.Row>
							<Table.Cell>
								<span class="font-medium">{group.display_name}</span>
							</Table.Cell>
							<Table.Cell class="text-muted-foreground">{group.description}</Table.Cell>
							<Table.Cell class="text-right text-muted-foreground">
								{dayjs(group.created_at).format('YYYY-MM-DD')}
							</Table.Cell>
							<Table.Cell class="text-right text-muted-foreground">
								<Button
									variant="link"
									href={resolve('/(dashboard)/dashboard/org/[org_class_id]/groups/[group_id]', {
										org_class_id: data.org.class_id,
										group_id: group.id,
									})}
								>
									View
								</Button>
							</Table.Cell>
						</Table.Row>
					{/each}
				{/if}
			</Table.Body>
		</Table.Root>
	</div>
</div>
