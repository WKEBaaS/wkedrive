<script lang="ts">
	import { OrgMemberSelector } from '$lib/components/org-member-selector/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import * as Field from '$lib/components/ui/field/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import type { CreateOrganizationGroupPayload, OrganizationMember } from '$lib/schemas';
	import type { SuperForm } from 'sveltekit-superforms';

	interface CreateGroupFormProps {
		form: SuperForm<CreateOrganizationGroupPayload>;
		members: OrganizationMember[];
	}

	let { members, form }: CreateGroupFormProps = $props();
	let { form: formData, errors, enhance } = form;
</script>

<Dialog.Root>
	<Dialog.Trigger>
		<Button variant="outline">Create Group</Button>
	</Dialog.Trigger>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Create New Group</Dialog.Title>
			<Dialog.Description>
				Fill out the form below to create a new group.
			</Dialog.Description>
		</Dialog.Header>
		<form method="POST" action="?/createOrganizationGroup" use:enhance>
			<input type="hidden" name="p_org_class_id" value={$formData.p_org_class_id} />
			<Field.Group>
				<Field.Set>
					<Field.Group>
						<Field.Field aria-invalid>
							<Field.Label for="org_group_name">Group Name</Field.Label>
							<Input id="org_group_name" name="p_group_name" bind:value={$formData.p_group_name} />
							{#if $errors.p_group_name}
								<Field.Error>{$errors.p_group_name}</Field.Error>
							{/if}
						</Field.Field>
						<Field.Field aria-invalid>
							<Field.Label for="org_group_description">Description</Field.Label>
							<Input id="org_group_description" name="p_group_description" bind:value={$formData.p_group_description} />
							{#if $errors.p_group_description}
								<Field.Error>{$errors.p_group_description}</Field.Error>
							{/if}
						</Field.Field>
						<Field.Field>
							<Field.Label for="org_group_members">Initial Members</Field.Label>
							<OrgMemberSelector {members} bind:selected={$formData.p_init_user_ids} />
						</Field.Field>
					</Field.Group>
				</Field.Set>
				<Field.Field orientation="horizontal">
					<Dialog.Close>
						<Button type="submit">Create Group</Button>
					</Dialog.Close>
					<Dialog.Close>
						<Button type="button" variant="outline">Cancel</Button>
					</Dialog.Close>
				</Field.Field>
			</Field.Group>
		</form>
	</Dialog.Content>
</Dialog.Root>
