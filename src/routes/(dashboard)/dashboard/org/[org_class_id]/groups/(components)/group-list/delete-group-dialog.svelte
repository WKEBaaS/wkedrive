<script lang='ts'>
	import { page } from '$app/state';
  import * as AlertDialog from '$lib/components/ui/alert-dialog/index.js';
  import { buttonVariants } from '$lib/components/ui/button';
  import { deleteOrgGroup } from '$src/lib/remotes/index.js';
  import { toastError } from '$src/lib/utils';
  import { toast } from 'svelte-sonner';

  interface DeleteGroupDialogProps {
    groupID: string;
  }

  let { groupID }: DeleteGroupDialogProps = $props();
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
			<form
				{...deleteOrgGroup.enhance(async ({ submit, form }) => {
				  try {
				    await submit();
				    if (deleteOrgGroup.result?.success) {
				      toast.success('Group deleted successfully.');
				      form.reset();
				    } else {
				      toast.error(deleteOrgGroup.result?.message || 'Failed to delete group.', {
				        description: deleteOrgGroup.result?.description,
				      });
				    }
				  } catch (err) {
				    toastError(err);
				  }
				})}
			>
				<input {...deleteOrgGroup.fields.p_org_class_id.as('hidden', page.params.org_class_id ?? '')} />
				<input {...deleteOrgGroup.fields.p_group_id.as('hidden', groupID)} />
				<div class='mt-4 flex justify-end space-x-2'>
					<AlertDialog.Cancel type='button'>Cancel</AlertDialog.Cancel>
					<AlertDialog.Action type='submit'>Delete</AlertDialog.Action>
				</div>
			</form>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>
