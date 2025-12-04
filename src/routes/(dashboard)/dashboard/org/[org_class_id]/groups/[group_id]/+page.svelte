<script lang="ts">
	import { MemberList } from './(components)/member-list/index.js';
	import MemberManagement from './(components)/member-management.svelte';

	let { data } = $props();
	let notInGroupMembers = $derived.by(() => {
		const groupMemberIds = new Set(data.groupMembers.map((m) => m.id));
		return data.members.filter((m) => !groupMemberIds.has(m.id));
	});
</script>

<div class="space-y-6 p-4">
	<div class="flex items-center justify-between">
		<div class="text-2xl font-bold">{data.group.display_name} Members</div>
		<MemberManagement members={notInGroupMembers} />
	</div>

	<div class="rounded-md border">
		<MemberList members={data.groupMembers} />
	</div>
</div>
