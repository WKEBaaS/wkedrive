<script lang="ts">
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Command from '$lib/components/ui/command/index.js';
	import * as Popover from '$lib/components/ui/popover/index.js';
	import type { OrganizationGroupMember } from '$lib/schemas';
	import { CheckIcon, ChevronsUpDownIcon, XIcon } from '@lucide/svelte';
	import { SvelteMap } from 'svelte/reactivity';

	interface MemberSelectorProps {
		members: OrganizationGroupMember[];
		// Selected member IDs
		selected?: string[];
	}

	let { members, selected = $bindable([]) }: MemberSelectorProps = $props();
	let selectedMap = new SvelteMap<string, OrganizationGroupMember>();

	let toggleMember = (member: OrganizationGroupMember) => {
		if (selectedMap.has(member.id)) {
			selectedMap.delete(member.id);
		} else {
			selectedMap.set(member.id, member);
		}
	};
	$effect(() => {
		selected = Array.from(selectedMap.keys());
	});
</script>

<Popover.Root>
	<Popover.Trigger class="w-full">
		<Button
			type="button"
			variant="outline"
			role="combobox"
			class="w-full justify-between min-h-[40px] h-auto bg-transparent"
		>
			<div class="flex gap-1 flex-wrap">
				{#if selectedMap.size === 0}
					<span class="text-muted-foreground">Select members...</span>
				{:else}
					{#each Array.from(selectedMap.values()) as member (member.id)}
						<Badge variant="secondary">
							{member.name}
							<button
								class="ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2 hover:bg-muted"
								onclick={(e) => {
									e.stopPropagation();
									toggleMember(member);
								}}
							>
								<XIcon class="size-3" />
							</button>
						</Badge>
					{/each}
				{/if}
			</div>
			<ChevronsUpDownIcon class="ml-2 h-4 w-4 shrink-0 opacity-50" />
		</Button>
	</Popover.Trigger>
	<Popover.Content class="w-[var(--bits-popover-anchor-width)] p-0">
		<Command.Root>
			<Command.Input placeholder="Search by name or email..." />
			<Command.Empty>No members found.</Command.Empty>
			<Command.Group>
				{#each members as member (member.id)}
					<Command.Item onSelect={() => toggleMember(member)}>
						<CheckIcon class={`mr-2 h-4 w-4 ${selectedMap.has(member.id) ? 'opacity-100' : 'opacity-0'}`} />
						<div class="flex-1">
							<span class="font-medium">{member.name}</span>
							<span class="text-sm text-muted-foreground">{member.email}</span>
						</div>
					</Command.Item>
				{/each}
			</Command.Group>
		</Command.Root>
	</Popover.Content>
</Popover.Root>
