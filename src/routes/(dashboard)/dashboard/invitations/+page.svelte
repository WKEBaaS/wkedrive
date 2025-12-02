<script lang="ts">
	import { getUserInvitations, updateInvitationStatus } from '$src/lib/remotes/index.js';
	import { ChevronRightIcon, LoaderCircleIcon, MailIcon, ShieldCheckIcon } from '@lucide/svelte';
	import { Badge } from '$src/lib/components/ui/badge/index.js';
	import * as Avatar from '$src/lib/components/ui/avatar/index.js';
	import { getInitials } from '$src/lib/utils';
	import * as Dialog from '$src/lib/components/ui/dialog/index.js';
	import * as Drawer from '$src/lib/components/ui/drawer/index.js';
	import { buttonVariants } from '$src/lib/components/ui/button';
	import { Button } from '$src/lib/components/ui/button/index.js';
	import type { GetUserInvitationsOutput } from '$src/lib/schemas';

	const invitations = $derived(await getUserInvitations({ status: 'PENDING' }));
	let open = $state(false);
	let selectedInvite = $state<GetUserInvitationsOutput | null>(null);
</script>

<div class="min-h-screen mt-4 mx-3 space-y-2">
	<div class="max-w-3xl mx-auto space-y-8">
		<header class="space-y-2">
			<h1 class="text-2xl font-semibold tracking-tight">Organization Invitations</h1>
			<p class="text-muted-foreground">Manage your pending invitations and request history.</p>
		</header>

		<!-- Pending Section -->
		<section class="space-y-4">
			<div class="flex items-center justify-between">
				<h2 class="text-sm font-medium uppercase tracking-wider text-muted-foreground">
					Pending ({invitations.length})
				</h2>
			</div>

			<div class="rounded-xl shadow-sm border overflow-hidden">
				{#if invitations.length === 0}
					<div class="p-8 text-center">
						<MailIcon class="size-10 mx-auto mb-3" />
						<p class="text-sm text-muted-foreground">You have no pending invitations.</p>
					</div>
				{:else}
					{#each invitations as invite (invite.id)}
						<button
							class="w-full group p-4 flex items-center justify-between hover:bg-muted cursor-pointer transition-colors"
							onclick={() => {
								selectedInvite = invite;
								open = true;
							}}
						>
							<div class="flex items-center gap-4">
								<Avatar.Root>
									<Avatar.Fallback>{getInitials(invite.organization_name)}</Avatar.Fallback>
								</Avatar.Root>
								<div class="text-left">
									<h3 class="font-medium">{invite.organization_name}</h3>
									<p class="text-sm text-muted-foreground">Invited by {invite.inviter_name}</p>
								</div>
							</div>
							<div class="flex items-center gap-4">
								<Badge class="bg-yellow-200 text-yellow-800">
									{invite.status}
								</Badge>
								<ChevronRightIcon class="size-5" />
							</div>
						</button>
					{/each}
				{/if}
			</div>
		</section>
	</div>
	<Dialog.Root bind:open>
		<Dialog.Content>
			{#if selectedInvite}
				<div class="grid">
					<Avatar.Root class="mx-auto mb-4">
						<Avatar.Fallback>
							{getInitials(selectedInvite.organization_name)}
						</Avatar.Fallback>
					</Avatar.Root>
				</div>
				<Dialog.Title class="text-center text-2xl font-bold mb-2">
					{selectedInvite.organization_name}
				</Dialog.Title>
				<Dialog.Description class="text-center text-muted-foreground mb-6">
					You have been invited by {selectedInvite.inviter_name} to join this organization.
				</Dialog.Description>
				<Dialog.Close
					class={buttonVariants({ variant: 'default' })}
					onclick={async () => {
						if (!selectedInvite) return;
						await updateInvitationStatus({
							p_invitation_id: selectedInvite.id,
							p_status: 'ACCEPTED',
						});
					}}
				>
					<ShieldCheckIcon class="size-5" />
					Accept Invitation
				</Dialog.Close>
				<Dialog.Close
					class={buttonVariants({ variant: 'outline' })}
					onclick={async () => {
						if (!selectedInvite) return;
						await updateInvitationStatus({
							p_invitation_id: selectedInvite.id,
							p_status: 'DECLINED',
						});
					}}
				>Decline</Dialog.Close>
			{/if}
		</Dialog.Content>
	</Dialog.Root>
</div>
