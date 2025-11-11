<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Command from '$lib/components/ui/command/index.js';
	import * as Popover from '$lib/components/ui/popover/index.js';
	import type { OrganizationGroupMember } from '$lib/schemas';
	import { CheckIcon, ChevronsUpDownIcon, XIcon } from '@lucide/svelte';
	import { SvelteMap } from 'svelte/reactivity';
	import { Badge } from '$lib/components/ui/badge/index.js';

	interface MemberSelectorProps {
		members: OrganizationGroupMember[];
		selected?: SvelteMap<string, OrganizationGroupMember>;
		name?: string;
	}

	let { members, name, selected = $bindable(new SvelteMap()) }: MemberSelectorProps = $props();

	let searchQuery = $state('');
	let toggleMember = (member: OrganizationGroupMember) => {
		if (selected.has(member.id)) {
			selected.delete(member.id);
		} else {
			selected.set(member.id, member);
		}
	};
</script>

<input type="hidden" {name} value={Array.from(selected.keys())} />
<Popover.Root>
	<Popover.Trigger>
		<Button
			type="button"
			variant="outline"
			role="combobox"
			class="w-full justify-between min-h-[40px] h-auto bg-transparent"
		>
			<div class="flex gap-1 flex-wrap">
				{#if selected.size === 0}
					<span class="text-muted-foreground">Select members...</span>
				{:else}
					{#each Array.from(selected.values()) as member (member.id)}
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
			<Command.Input
				placeholder="Search by name or email..."
				bind:value={searchQuery}
			/>
			<Command.Empty>No members found.</Command.Empty>
			<Command.Group>
				{#each members as member (member.id)}
					<Command.Item onSelect={() => toggleMember(member)}>
						<CheckIcon class={`mr-2 h-4 w-4 ${selected.has(member.id) ? 'opacity-100' : 'opacity-0'}`} />
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
