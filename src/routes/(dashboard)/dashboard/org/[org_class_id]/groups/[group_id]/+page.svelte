<script lang="ts">
	import { addMembersToGroupSchema, removeMembersFromGroupSchema } from '$lib/schemas';
	import { superForm } from 'sveltekit-superforms';
	import { valibotClient } from 'sveltekit-superforms/adapters';
	import { MemberList } from './(components)/member-list/index.js';
	import MemberManagementForm from './(components)/member-management-form.svelte';

	let { data } = $props();
	let notInGroupMembers = $derived.by(() => {
		const groupMemberIds = new Set(data.groupMembers.map((m) => m.id));
		return data.members.filter((m) => !groupMemberIds.has(m.id));
	});

	let addMembersToGroupForm = superForm(data.addMembersToGroupForm, {
		id: 'add-members-to-group-form',
		validators: valibotClient(addMembersToGroupSchema),
		dataType: 'json',
		delayMs: 100,
	});
	let removeMembersFromGroupForm = superForm(data.removeMembersFromGroupForm, {
		id: 'remove-members-from-group-form',
		validators: valibotClient(removeMembersFromGroupSchema),
		dataType: 'json',
		delayMs: 100,
	});
</script>

<div class="space-y-6 p-4">
	<div class="flex items-center justify-between">
		<div class="text-2xl font-bold">{data.group.display_name} Members</div>
		<MemberManagementForm members={notInGroupMembers} form={addMembersToGroupForm} />
	</div>

	<div class="rounded-md border">
		<MemberList members={data.groupMembers} form={removeMembersFromGroupForm} />
	</div>
</div>
