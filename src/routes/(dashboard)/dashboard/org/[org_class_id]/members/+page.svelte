<script lang="ts">
	import { page } from '$app/state';
	import { Avatar, AvatarFallback } from '$lib/components/ui/avatar';
	import * as Table from '$lib/components/ui/table';
	import { getOrganizationInvitations } from '$src/lib/remotes/index.js';
	import { cn } from '$src/lib/utils.js';
	import dayjs from 'dayjs';
	import relativeTime from 'dayjs/plugin/relativeTime.js';
	import { InviteUser } from './(components)/invite-user/index.js';
	dayjs.extend(relativeTime);

	let { data } = $props();
	let org_class_id = $derived(page.params.org_class_id ?? '');

	// --- Helper Functions ---

	/** 根據姓名獲取頭像的縮寫 */
	function getInitials(name: string) {
		return name
			.split(' ')
			.map((n) => n[0])
			.join('')
			.toUpperCase();
	}

	const invitations = $derived(
		await getOrganizationInvitations({ org_class_id, type: 'INVITATION', status: 'PENDING' }),
	);
</script>

<div class="space-y-6 p-4">
	<div class="flex items-center justify-between">
		<div class="text-2xl font-bold">Organization Members</div>
		<InviteUser />
	</div>

	<div class="rounded-md border">
		<div class="px-6 py-4 border-b bg-accent">
			<h2 class="text-lg font-semibold text-accent-foreground">Current Members</h2>
		</div>
		<Table.Root>
			<Table.Header>
				<Table.Row>
					<Table.Head class="">Name</Table.Head>
					<Table.Head>Email</Table.Head>
					<Table.Head class="">Role</Table.Head>
					<Table.Head class="text-right">Joined At</Table.Head>
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{#if data.members.length === 0}
					<Table.Row>
						<Table.Cell colspan={4} class="h-24 text-center text-muted-foreground">
							No members found.
						</Table.Cell>
					</Table.Row>
				{:else}
					{#each data.members as member (member.id)}
						<Table.Row>
							<Table.Cell>
								<div class="flex items-center gap-3">
									<Avatar>
										<AvatarFallback>{getInitials(member.name)}</AvatarFallback>
									</Avatar>
									<span class="font-medium">{member.name}</span>
								</div>
							</Table.Cell>
							<Table.Cell class="text-muted-foreground">{member.email}</Table.Cell>
							<Table.Cell class="text-muted-foreground capitalize">
								{member.role}
							</Table.Cell>
							<Table.Cell class="text-right text-muted-foreground">
								{dayjs(member.joined_at).fromNow()}
							</Table.Cell>
						</Table.Row>
					{/each}
				{/if}
			</Table.Body>
		</Table.Root>
	</div>

	{#if invitations.length !== 0}
		<div class="rounded-md border">
			<div class="px-6 py-4 border-b bg-accent">
				<h2 class="text-lg font-semibold text-accent-foreground">Pending Invitations</h2>
			</div>
			<Table.Root>
				<Table.Header>
					<Table.Row>
						<Table.Head>Email</Table.Head>
						<Table.Head>Invitee Name</Table.Head>
						<Table.Head>Invited By</Table.Head>
						<Table.Head>Status</Table.Head>
						<Table.Head>Invited At</Table.Head>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{#each invitations as invitation (invitation.id)}
						<Table.Row>
							<Table.Cell>{invitation.email}</Table.Cell>
							<Table.Cell>{invitation.invitee_name}</Table.Cell>
							<Table.Cell>{invitation.inviter_name}</Table.Cell>
							<Table.Cell
								class={cn(
									'capitalize',
									invitation.status === 'PENDING'
										? 'text-yellow-600'
										: invitation.status === 'ACCEPTED'
										? 'text-green-600'
										: invitation.status === 'DECLINED'
										? 'text-red-600'
										: invitation.status === 'EXPIRED'
										? 'text-gray-600'
										: '',
								)}
							>{invitation.status}</Table.Cell>
							<Table.Cell>{dayjs(invitation.created_at).fromNow()}</Table.Cell>
						</Table.Row>
					{/each}
				</Table.Body>
			</Table.Root>
		</div>
	{/if}
</div>
