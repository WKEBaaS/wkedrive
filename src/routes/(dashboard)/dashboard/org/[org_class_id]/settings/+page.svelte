<script lang="ts">
	import { toastFormError } from '$src/lib/utils.js';
	import { superForm } from 'sveltekit-superforms';
	import { DeleteOrg } from './(components)/delete-org/index.js';

	let { data } = $props();

	const deleteOrgForm = superForm(data.deleteOrganizationForm, {
		id: 'delete-org-form',
		onError: ({ result }) => {
			toastFormError(result);
		},
	});
</script>

<div class="p-4 space-y-6">
	<DeleteOrg form={deleteOrgForm} />
</div>
