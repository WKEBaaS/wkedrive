<script lang="ts">
	import * as AlertDialog from '$lib/components/ui/alert-dialog/index.js';
	import { buttonVariants } from '$lib/components/ui/button';
	import { page } from '$app/state';
	import type { SuperForm } from 'sveltekit-superforms';
	import type { DeleteOrganizationGroupPayload } from '$src/lib/schemas';

	interface DeleteGroupDialogProps {
		groupID: string;
		form: SuperForm<DeleteOrganizationGroupPayload>;
	}

	let { groupID, form }: DeleteGroupDialogProps = $props();
	const { enhance } = form;
</script>

<AlertDialog.Root>
	<AlertDialog.Trigger class={buttonVariants({ 'variant': 'outline' })}>Delete Group</AlertDialog.Trigger>
	<AlertDialog.Content>
		<AlertDialog.Header>
			<AlertDialog.Title>Are you sure you want to delete this group?</AlertDialog.Title>
			<AlertDialog.Description>
				This action cannot be undone. All members will be removed from this group.
			</AlertDialog.Description>
		</AlertDialog.Header>
		<AlertDialog.Footer>
			<form method="POST" action="?/deleteOrganizationGroup" use:enhance>
				<input type="hidden" name="p_org_class_id" value={page.params.org_class_id} />
				<input type="hidden" name="p_group_id" value={groupID} />
				<div class="mt-4 flex justify-end space-x-2">
					<AlertDialog.Cancel type="button">Cancel</AlertDialog.Cancel>
					<AlertDialog.Action type="submit">Delete</AlertDialog.Action>
				</div>
			</form>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>
