<script lang="ts">
	import { Button, buttonVariants } from '$lib/components/ui/button/index.js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import type { OrganizationGroupMember } from '$lib/schemas';
	import MemberSelector from './member-selector.svelte';

	interface MemberManagementFormProps {
		members: OrganizationGroupMember[];
	}

	let { members }: MemberManagementFormProps = $props();
</script>

<form>
	<Dialog.Root>
		<Dialog.Trigger class={buttonVariants({ variant: 'outline' })}>Add Members</Dialog.Trigger>
		<Dialog.Content>
			<Dialog.Header>
				<Dialog.Title>Add Members to Group</Dialog.Title>
			</Dialog.Header>
			<MemberSelector {members} name="p_user_ids" />
			<Dialog.Footer>
				<Dialog.Close>
					<Button type="submit">Add Members</Button>
				</Dialog.Close>
			</Dialog.Footer>
		</Dialog.Content>
	</Dialog.Root>
</form>
