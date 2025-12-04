<script lang="ts">
	import { page } from '$app/state';
	import { OrgMemberSelector } from '$lib/components/org-member-selector/index.js';
	import { Button, buttonVariants } from '$lib/components/ui/button/index.js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import * as Field from '$lib/components/ui/field/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import type { OrganizationMember } from '$lib/schemas';
	import { createOrgGroup } from '$src/lib/remotes/index.js';
	import { toast } from 'svelte-sonner';

	interface CreateGroupFormProps {
		members: OrganizationMember[];
	}

	let { members }: CreateGroupFormProps = $props();
	let selected: string[] = $state([]);
	let open = $state(false);
</script>

<Dialog.Root bind:open>
	<Dialog.Trigger class={buttonVariants({ variant: 'outline' })}>
		Create Group
	</Dialog.Trigger>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Create New Group</Dialog.Title>
			<Dialog.Description>
				Fill out the form below to create a new group.
			</Dialog.Description>
		</Dialog.Header>
		<form
			{...createOrgGroup.enhance(async ({ submit }) => {
				try {
					await submit();
					if (createOrgGroup.result?.success) {
						open = false;
						toast.success('Group created successfully.');
					}
				} catch (err) {
					toast.error('Failed to create group. Please try again.', {
						description: err instanceof Error ? err.message : undefined,
					});
				}
			})}
			oninput={() => createOrgGroup.validate()}
		>
			{#each members as member (member.id)}
				<input
					{...createOrgGroup.fields.p_init_user_ids.as('checkbox', member.id)}
					hidden
					checked={selected.includes(member.id)}
				/>
			{/each}
			<input {...createOrgGroup.fields.p_org_class_id.as('hidden', page.params.org_class_id ?? '')} />
			<Field.Group>
				<Field.Set>
					<Field.Group>
						<Field.Field aria-invalid>
							<Field.Label for="org_group_name">Group Name</Field.Label>
							<Input id="org_group_name" {...createOrgGroup.fields.p_group_name.as('text')} />
							{#each createOrgGroup.fields.p_group_name.issues() ?? [] as issue, index (index)}
								<Field.Error>{issue.message}</Field.Error>
							{/each}
						</Field.Field>
						<Field.Field aria-invalid>
							<Field.Label for="org_group_description">Description</Field.Label>
							<Input id="org_group_description" {...createOrgGroup.fields.p_group_description.as('text')} />
							{#each createOrgGroup.fields.p_group_description.issues() ?? [] as issue, index (index)}
								<Field.Error>{issue.message}</Field.Error>
							{/each}
						</Field.Field>
						<Field.Field>
							<Field.Label for="org_group_members">Initial Members</Field.Label>
							<OrgMemberSelector {members} bind:selected />
							{#each createOrgGroup.fields.p_init_user_ids.issues() ?? [] as issue, index (index)}
								<Field.Error>{issue.message}</Field.Error>
							{/each}
						</Field.Field>
					</Field.Group>
				</Field.Set>
				<Field.Field orientation="horizontal">
					<Button type="submit">Create Group</Button>
					<Dialog.Close type="button" class={buttonVariants({ variant: 'outline' })}>
						Cancel
					</Dialog.Close>
				</Field.Field>
			</Field.Group>
		</form>
	</Dialog.Content>
</Dialog.Root>
