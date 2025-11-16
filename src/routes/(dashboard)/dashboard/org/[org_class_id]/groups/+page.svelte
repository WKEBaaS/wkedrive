<script lang="ts">
	import { createOrganizationGroupSchema, deleteOrganizationGroupSchema } from '$lib/schemas/inputs.js';
	import { superForm } from 'sveltekit-superforms';
	import { valibotClient } from 'sveltekit-superforms/adapters';
	import { CreateGroupForm } from './(components)/create-group/index.js';
	import { GroupList } from './(components)/group-list/index.js';
	import { toastFormError } from '$src/lib/utils.js';

	let { data } = $props();
	const createOrgGroupForm = superForm(data.createOrganizationGroupForm, {
		id: 'create-organization-group-form',
		validators: valibotClient(createOrganizationGroupSchema),
		dataType: 'json',
		delayMs: 100,
		onError: ({ result }) => {
			toastFormError(result);
		},
	});
	const deleteOrgGroupForm = superForm(data.deleteOrganizationGroupForm, {
		id: 'delete-organization-group-form',
		validators: valibotClient(deleteOrganizationGroupSchema),
		delayMs: 100,
		onError: ({ result }) => {
			toastFormError(result);
		},
	});
</script>

<div class="space-y-6 p-4">
	<div class="flex items-center justify-between">
		<div class="text-2xl font-bold">Organization Groups</div>
		<CreateGroupForm members={data.members} form={createOrgGroupForm} />
	</div>

	<GroupList groups={data.groups} form={deleteOrgGroupForm} />
</div>
