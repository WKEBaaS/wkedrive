<script lang="ts">
	import { page } from '$app/state';
	import * as AlertDialog from '$lib/components/ui/alert-dialog/index.js';
	import { buttonVariants } from '$lib/components/ui/button';
	import type { DeleteOrganizationPayload } from '$lib/schemas';
	import type { SuperForm } from 'sveltekit-superforms';

	interface DeleteOrgProps {
		form: SuperForm<DeleteOrganizationPayload>;
	}

	let { form }: DeleteOrgProps = $props();
	const { enhance } = form;
</script>

<div class="border-b pb-6">
	<div class="flex items-start justify-between">
		<div class="space-y-1">
			<h3 class="text-lg font-medium">Delete Organization</h3>
			<p class="text-sm text-muted-foreground">
				Permanently delete this organization and all of its data. This action cannot be undone.
			</p>
			<p class="text-sm text-muted-foreground">
				Please be certain before proceeding with deletion.
			</p>
		</div>
		<AlertDialog.Root>
			<AlertDialog.Trigger class={buttonVariants({ variant: 'destructive' })}>
				Delete Organization
			</AlertDialog.Trigger>
			<AlertDialog.Content>
				<AlertDialog.Header>
					<AlertDialog.Title>Are you sure you want to delete this organization?</AlertDialog.Title>
					<AlertDialog.Description>
						This action cannot be undone. All data associated with this organization will be permanently deleted.
					</AlertDialog.Description>
				</AlertDialog.Header>
				<AlertDialog.Footer>
					<AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
					<form method="POST" action="?/deleteOrganization" use:enhance class="inline">
						<input type="hidden" name="p_org_class_id" value={page.params.org_class_id} />
						<AlertDialog.Action type="submit">Delete</AlertDialog.Action>
					</form>
				</AlertDialog.Footer>
			</AlertDialog.Content>
		</AlertDialog.Root>
	</div>
</div>
