<script lang="ts">
	import { CreateGroupForm } from './(components)/create-group/index.js';
	import { GroupList } from './(components)/group-list/index.js';

	let { data } = $props();
</script>

<div class="space-y-6 p-4">
	<div class="flex items-center justify-between">
		<div class="text-2xl font-bold">Organization Groups</div>
		<CreateGroupForm members={data.members} />
	</div>

	<GroupList groups={data.groups} />
</div>
