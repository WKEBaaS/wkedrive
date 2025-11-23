<script lang="ts">
	import { page } from '$app/state';
	import { OrgMemberSelector } from '$lib/components/org-member-selector/index.js';
	import { Button, buttonVariants } from '$lib/components/ui/button/index.js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import type { OrganizationGroupMember } from '$lib/schemas';
	import { addMembersToGroup } from '$src/lib/remotes/index.js';

	interface MemberManagementFormProps {
		members: OrganizationGroupMember[];
	}

	let { members }: MemberManagementFormProps = $props();
	let selected = $state<string[]>([]);
</script>

<Dialog.Root>
	<Dialog.Trigger type="button" class={buttonVariants({ variant: 'outline' })}>Add Members</Dialog.Trigger>
	<Dialog.Content>
		<div class="space-y-2">
			<Dialog.Header>
				<Dialog.Title>Add Members to Group</Dialog.Title>
			</Dialog.Header>
			<form {...addMembersToGroup} oninput={() => addMembersToGroup.validate()}>
				<div class="w-full space-y-2">
					<input {...addMembersToGroup.fields.p_org_class_id.as('hidden', page.params.org_class_id ?? '')} />
					<input {...addMembersToGroup.fields.p_group_id.as('hidden', page.params.group_id ?? '')} />

					{#each members as member (member.id)}
						<input
							{...addMembersToGroup.fields.p_user_ids.as('checkbox', member.id)}
							hidden
							checked={selected.includes(member.id)}
						/>
					{/each}
					<OrgMemberSelector {members} bind:selected />
					<Dialog.Close>
						<Button disabled={addMembersToGroup.fields.issues() !== undefined} type="submit">Add Members</Button>
					</Dialog.Close>
				</div>
			</form>
		</div>
	</Dialog.Content>
</Dialog.Root>
