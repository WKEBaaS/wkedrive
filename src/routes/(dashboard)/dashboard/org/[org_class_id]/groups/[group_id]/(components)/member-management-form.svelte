<script lang="ts">
	import { Button, buttonVariants } from '$lib/components/ui/button/index.js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import type { AddMembersToGroupPayload, OrganizationGroupMember } from '$lib/schemas';
	import type { SuperForm } from 'sveltekit-superforms';
	import { OrgMemberSelector } from '$lib/components/org-member-selector/index.js';

	interface MemberManagementFormProps {
		members: OrganizationGroupMember[];
		form: SuperForm<AddMembersToGroupPayload>;
	}

	let { members, form }: MemberManagementFormProps = $props();
	const { form: formData, errors, enhance } = form;
</script>

<Dialog.Root>
	<Dialog.Trigger type="button" class={buttonVariants({ variant: 'outline' })}>Add Members</Dialog.Trigger>
	<Dialog.Content>
		<form method="POST" action="?/addMembersToGroup" use:enhance>
			<input type="hidden" name="p_org_class_id" value={$formData.p_org_class_id} />
			<input type="hidden" name="p_group_id" value={$formData.p_group_id} />
			<div class="space-y-2">
				<Dialog.Header>
					<Dialog.Title>Add Members to Group</Dialog.Title>
				</Dialog.Header>
				<OrgMemberSelector {members} bind:selected={$formData.p_user_ids} />
				<Dialog.Footer>
					<Dialog.Close>
						<Button disabled={!!$errors.p_user_ids} type="submit">Add Members</Button>
					</Dialog.Close>
				</Dialog.Footer>
			</div>
		</form>
	</Dialog.Content>
</Dialog.Root>
