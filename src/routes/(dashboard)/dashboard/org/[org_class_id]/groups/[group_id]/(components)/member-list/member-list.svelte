<script lang="ts">
	import { page } from '$app/state';
	import { Avatar, AvatarFallback } from '$lib/components/ui/avatar/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Checkbox } from '$lib/components/ui/checkbox/index.js';
	import * as Table from '$lib/components/ui/table/index.js';
	import type { OrganizationGroupMember } from '$lib/schemas';
	import { getInitials } from '$lib/utils';
	import { removeMembersFromGroup } from '$src/lib/remotes/index.js';
	import { Trash2Icon } from '@lucide/svelte';
	import dayjs from 'dayjs';

	interface MemberListProps {
		members: OrganizationGroupMember[];
	}

	let { members }: MemberListProps = $props();

	const toggleAll = () => {
		const selectedIds = removeMembersFromGroup.fields.p_user_ids.value() || [];
		if (selectedIds.length === members.length) {
			removeMembersFromGroup.fields.p_user_ids.set([]);
		} else {
			removeMembersFromGroup.fields.p_user_ids.set(members.map((member) => member.id));
		}
	};
</script>

<form {...removeMembersFromGroup} oninput={() => removeMembersFromGroup.validate()}>
	<input {...removeMembersFromGroup.fields.p_org_class_id.as('hidden', page.params.org_class_id ?? '')} />
	<input {...removeMembersFromGroup.fields.p_group_id.as('hidden', page.params.group_id ?? '')} />
	<div class="rounded-md border space-y-4">
		{#if removeMembersFromGroup.fields.p_user_ids.value()?.length > 0}
			<div class="flex items-center justify-between rounded-md border bg-muted/50 p-3">
				<span class="text-sm font-medium">
					{removeMembersFromGroup.fields.p_user_ids.value()?.length} member{
						removeMembersFromGroup.fields.p_user_ids.value()?.length > 1 ? 's' : ''
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
							checked={members.length > 0 &&
								removeMembersFromGroup.fields.p_user_ids.value()?.length === members.length}
							onCheckedChange={toggleAll}
						/>
					</Table.Head>
					<Table.Head>Name</Table.Head>
					<Table.Head>Email</Table.Head>
					<Table.Head class="text-right">Joined At</Table.Head>
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{#if members.length === 0}
					<Table.Row>
						<Table.Cell colspan={4} class="h-24 text-center text-muted-foreground">
							No members found.
						</Table.Cell>
					</Table.Row>
				{:else}
					{#each members as member (member.id)}
						<Table.Row>
							<Table.Cell class="w-12 space-y-2">
								{@const 							{ name, value, checked } = removeMembersFromGroup.fields.p_user_ids.as(
								'checkbox',
								member.id,
							)}
								<Checkbox {name} {value} {checked} />
							</Table.Cell>
							<Table.Cell>
								<div class="flex items-center gap-3">
									<Avatar>
										<AvatarFallback>{getInitials(member.name)}</AvatarFallback>
									</Avatar>
									<span class="font-medium">{member.name}</span>
								</div>
							</Table.Cell>
							<Table.Cell class="text-muted-foreground">{member.email}</Table.Cell>
							<Table.Cell class="text-right text-muted-foreground">
								{dayjs(member.joined_at).format('YYYY-MM-DD')}
							</Table.Cell>
						</Table.Row>
					{/each}
				{/if}
			</Table.Body>
		</Table.Root>
	</div>
</form>
