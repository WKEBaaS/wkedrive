<script lang="ts">
	import { page } from '$app/state';
	import * as Dialog from '$lib/components/ui/dialog';
	import * as Field from '$lib/components/ui/field/index.js';
	import { Button, buttonVariants } from '$src/lib/components/ui/button/index.js';
	import { Input } from '$src/lib/components/ui/input/index.js';
	import { inviteToOrganization } from '$src/lib/remotes/index.js';
	import { UserPlusIcon } from '@lucide/svelte';
	import { toast } from 'svelte-sonner';

	let open = $state(false);
</script>

<Dialog.Root bind:open>
	<Dialog.Trigger class={buttonVariants({ variant: 'default', size: 'sm' })}>
		<UserPlusIcon />
		Invite User
	</Dialog.Trigger>
	<Dialog.Content>
		<form
			{...inviteToOrganization.enhance(async ({ submit, form }) => {
				await submit();
				form.reset();

				if (inviteToOrganization.result?.success) {
					toast.success('Invitation sent successfully!');
					open = false;
				}
			})}
			oninput={() => inviteToOrganization.validate()}
		>
			<input {...inviteToOrganization.fields.p_org_class_id.as('hidden', page.params.org_class_id ?? '')} />
			<Field.Group>
				<Field.Set>
					<Field.Legend>Invite User to Organization</Field.Legend>
					<Field.Description>
						Enter the email address of the user you want to invite to your organization.
					</Field.Description>
					<Field.Group>
						<Field.Field>
							<Field.Label for="email">User Email</Field.Label>
							<Input
								id="email"
								placeholder="Enter user email"
								{...inviteToOrganization.fields.p_invitee_email.as('text')}
							/>
							{#each inviteToOrganization.fields.p_invitee_email.issues() ?? [] as issue, index (index)}
								<Field.Error>{issue.message}</Field.Error>
							{/each}
						</Field.Field>
						<Field.Field>
							<Field.Label for="expires_in_days">Expiration (Days)</Field.Label>
							<Input id="expires_in_days" {...inviteToOrganization.fields.p_expires_in_days.as('number')} />
						</Field.Field>
					</Field.Group>
				</Field.Set>
				<Field.Field orientation="horizontal" class="justify-end gap-2 mt-4">
					<Button variant="outline" type="button" onclick={() => open = false}>Cancel</Button>
					<Button type="submit">Submit</Button>
				</Field.Field>
			</Field.Group>
		</form>
	</Dialog.Content>
</Dialog.Root>
