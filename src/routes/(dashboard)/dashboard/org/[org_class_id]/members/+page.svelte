<script lang="ts">
	import * as Table from '$lib/components/ui/table';
	import { Avatar, AvatarFallback } from '$lib/components/ui/avatar';
	import dayjs from 'dayjs';

	let { data } = $props();

	// --- Helper Functions ---

	/** 根據姓名獲取頭像的縮寫 */
	function getInitials(name: string) {
		return name
			.split(' ')
			.map((n) => n[0])
			.join('')
			.toUpperCase();
	}
</script>

<div class="space-y-6 p-4">
	<div class="text-2xl font-bold">Organization Members</div>

	<div class="rounded-md border">
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
								{dayjs(member.joined_at).format('YYYY-MM-DD')}
							</Table.Cell>
						</Table.Row>
					{/each}
				{/if}
			</Table.Body>
		</Table.Root>
	</div>
</div>
