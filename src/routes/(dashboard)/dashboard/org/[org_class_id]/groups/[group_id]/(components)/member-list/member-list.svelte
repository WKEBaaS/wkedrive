<script lang="ts">
	import { Avatar, AvatarFallback } from '$lib/components/ui/avatar/index.js';
	import { Checkbox } from '$lib/components/ui/checkbox/index.js';
	import * as Table from '$lib/components/ui/table/index.js';
	import type { OrganizationGroupMember, RemoveMembersFromGroupPayload } from '$lib/schemas';
	import { getInitials } from '$lib/utils';
	import dayjs from 'dayjs';
	import { SvelteSet } from 'svelte/reactivity';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Trash2Icon } from '@lucide/svelte';
	import type { SuperForm } from 'sveltekit-superforms';

	interface MemberListProps {
		members: OrganizationGroupMember[];
		form: SuperForm<RemoveMembersFromGroupPayload>;
	}

	let { members, form }: MemberListProps = $props();
	let { form: formData, enhance, submit } = form;
	let selectedMap = new SvelteSet<string>();

	const toggleAll = () => {
		if (selectedMap.size === members.length) {
			selectedMap.clear();
		} else {
			members.forEach((member) => selectedMap.add(member.id));
		}
	};
	const toggleMember = (id: string) => {
		if (selectedMap.has(id)) {
			selectedMap.delete(id);
		} else {
			selectedMap.add(id);
		}
	};
</script>

<form method="POST" action="?/removeMembersFromGroup" use:enhance>
	<input type="hidden" name="p_org_class_id" value={$formData.p_org_class_id} />
	<input type="hidden" name="p_group_id" value={$formData.p_group_id} />
	<div class="rounded-md border space-y-4">
		{#if selectedMap.size > 0}
			<div class="flex items-center justify-between rounded-md border bg-muted/50 p-3">
				<span class="text-sm font-medium">
					{selectedMap.size} member{selectedMap.size > 1 ? 's' : ''} selected
				</span>
				<Button
					type="submit"
					variant="destructive"
					size="sm"
					onclick={() => {
						$formData.p_user_ids = Array.from(selectedMap);
						selectedMap.clear();
						submit();
					}}
				>
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
							checked={members.length > 0 && selectedMap.size === members.length}
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
						<Table.Row class={selectedMap.has(member.id) ? 'bg-muted/50' : ''}>
							<Table.Cell class="w-12">
								<Checkbox checked={selectedMap.has(member.id)} onCheckedChange={() => toggleMember(member.id)} />
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
